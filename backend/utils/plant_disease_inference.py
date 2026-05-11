import argparse
import json
import os
import sys

import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model

CLASS_NAMES = [
    "Pepper__bell___Bacterial_spot",
    "Pepper__bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Tomato_Bacterial_spot",
    "Tomato_Early_blight",
    "Tomato_Late_blight",
    "Tomato_Leaf_Mold",
    "Tomato_Septoria_leaf_spot",
    "Tomato_Spider_mites_Two_spotted_spider_mite",
    "Tomato__Target_Spot",
    "Tomato__Tomato_YellowLeaf__Curl_Virus",
    "Tomato__Tomato_mosaic_virus",
    "Tomato_healthy",
]

MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)
UNSUPPORTED_IMAGE_THRESHOLD = 0.35


def load_labels(labels_path):
    if not labels_path or not os.path.exists(labels_path):
        return None
    with open(labels_path, "r", encoding="utf-8") as labels_file:
        data = json.load(labels_file)
    if isinstance(data, list):
        return data
    raise ValueError("Labels file must contain a JSON array.")


def preprocess_image(image_path, target_size):
    image = Image.open(image_path).convert("RGB")
    image = image.resize(target_size)
    arr = np.array(image).astype("float32") / 255.0
    arr = (arr - MEAN) / STD
    arr = np.expand_dims(arr, axis=0)
    return arr


def temperature_scaling(probabilities, temperature=0.8):
    logits = np.log(probabilities + 1e-9)
    exp_logits = np.exp(logits / temperature)
    return exp_logits / np.sum(exp_logits)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True)
    parser.add_argument("--image", required=True)
    parser.add_argument("--labels", required=False, default="")
    args = parser.parse_args()

    try:
        model = load_model(args.model)
        input_shape = model.input_shape
        if isinstance(input_shape, list):
            input_shape = input_shape[0]

        height = int(input_shape[1])
        width = int(input_shape[2])

        image_batch = preprocess_image(args.image, (width, height))
        predictions = model.predict(image_batch, verbose=0)[0]
        predictions = temperature_scaling(predictions, temperature=0.8)
        predicted_index = int(np.argmax(predictions))
        confidence = float(predictions[predicted_index])

        labels = load_labels(args.labels)
        if labels and predicted_index < len(labels):
            predicted_label = labels[predicted_index]
        elif predicted_index < len(CLASS_NAMES):
            predicted_label = CLASS_NAMES[predicted_index]
        else:
            predicted_label = f"Class {predicted_index}"

        top_k = min(3, len(predictions))
        top_indices = np.argsort(predictions)[-top_k:][::-1]
        top_predictions = []
        for idx in top_indices:
            idx_int = int(idx)
            if labels and idx_int < len(labels):
                label = labels[idx_int]
            elif idx_int < len(CLASS_NAMES):
                label = CLASS_NAMES[idx_int]
            else:
                label = f"Class {idx_int}"
            top_predictions.append(
                {
                    "label": label,
                    "confidence": float(predictions[idx_int]),
                    "classIndex": idx_int,
                }
            )

        print(
            json.dumps(
                {
                    "success": True,
                    "predictedClass": predicted_label,
                    "classIndex": predicted_index,
                    "confidence": confidence,
                    "isUnsupportedImage": confidence < UNSUPPORTED_IMAGE_THRESHOLD,
                    "confidenceThreshold": UNSUPPORTED_IMAGE_THRESHOLD,
                    "topPredictions": top_predictions,
                    "inputSize": {"width": width, "height": height},
                }
            )
        )
    except Exception as exc:
        print(json.dumps({"success": False, "error": str(exc)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
