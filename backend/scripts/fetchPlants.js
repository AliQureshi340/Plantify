const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();
const API_KEY = "sk-BZFz69fcadc23875617075";
const MONGO_URI = "mongodb://127.0.0.1:27017/plantify";
const PlantSchema = new mongoose.Schema({
  perenualId: Number,
  name: String,
  scientificName: String,
  family: String,
  category: String,
  description: String,
  image: String,
  careGuide: {
    water: String,
    sunlight: String,
    difficulty: String,
  },
  climate: String,
  medicinal: Boolean,
  poisonous: Boolean,
  tags: [String],
});

const Plant = mongoose.model("TrefleePlant", PlantSchema);

mongoose.connect(MONGO_URI).then(async () => {
  console.log("Connected to MongoDB");

  // Clear old data
  await Plant.deleteMany({});
  console.log("Cleared old plants");

  for (let page = 1; page <= 3; page++) {
    const res = await axios.get(
      `https://perenual.com/api/species-list?key=${API_KEY}&page=${page}`
    );

    for (const p of res.data.data) {
      try {
        // Get detailed info per plant
        const detail = await axios.get(
          `https://perenual.com/api/species/details/${p.id}?key=${API_KEY}`
        );
        const d = detail.data;

        await Plant.create({
          perenualId: p.id,
          name: p.common_name || p.scientific_name?.[0],
          scientificName: p.scientific_name?.[0] || "",
          family: d.family || "",
          category: d.cycle || "Unknown",
          description: d.description || "",
          image: p.default_image?.medium_url || "",
          careGuide: {
            water: d.watering || "",
            sunlight: d.sunlight?.[0] || "",
            difficulty: d.care_level || "",
          },
          climate: d.hardiness?.min ? `Zone ${d.hardiness.min}` : "",
          medicinal: d.medicinal || false,
          poisonous: d.poisonous_to_humans ? true : false,
          tags: d.sunlight || [],
        });

        console.log(`Saved: ${p.common_name || p.scientific_name?.[0]}`);
        await new Promise(r => setTimeout(r, 300)); // avoid rate limit
      } catch (err) {
        console.log(`Skipped ${p.id}: ${err.message}`);
      }
    }
  }

  mongoose.disconnect();
  console.log("Done!");
});