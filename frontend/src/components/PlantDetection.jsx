import React, { useMemo, useState } from 'react';
import { Leaf, Upload, Loader2, AlertCircle, FileText, ArrowLeft, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';

const PlantDetection = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const confidencePercent = useMemo(() => {
    if (!prediction?.confidence) return 0;
    return Math.round(prediction.confidence * 100);
  }, [prediction]);

  const unsupportedThresholdPercent = useMemo(() => {
    if (typeof prediction?.confidenceThreshold !== 'number') return 35;
    return Math.round(prediction.confidenceThreshold * 100);
  }, [prediction]);

  const onImageChange = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setPrediction(null);
    setError('');
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) onImageChange(file);
  };

  const downloadPdfReport = () => {
    if (!prediction) return;
    const doc = new jsPDF();
    const createdAt = new Date().toLocaleString();
    const fileName = selectedFile?.name || 'uploaded_leaf_image';
    const topPredictions = Array.isArray(prediction.topPredictions) ? prediction.topPredictions : [];

    doc.setFontSize(18);
    doc.text('Plant Disease Detection Report', 14, 18);
    doc.setFontSize(11);
    doc.text(`Generated: ${createdAt}`, 14, 28);
    doc.text(`Image: ${fileName}`, 14, 35);
    doc.text(`Predicted Class: ${prediction.predictedClass}`, 14, 45);
    doc.text(`Confidence: ${confidencePercent}%`, 14, 52);
    doc.text(`Status: ${prediction.isUnsupportedImage ? 'Unsupported image' : confidencePercent < 50 ? 'Model uncertain' : 'Acceptable'}`, 14, 59);
    doc.setFontSize(13);
    doc.text('Top Predictions', 14, 72);
    doc.setFontSize(11);
    let y = 80;
    topPredictions.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.label} - ${Math.round(item.confidence * 100)}%`, 14, y);
      y += 8;
    });
    doc.save(`plant-detection-report-${Date.now()}.pdf`);
  };

  const detectPlantDisease = async () => {
    if (!selectedFile) { setError('Please upload an image first.'); return; }
    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      const preferredBase = process.env.REACT_APP_API_BASE || '';
      const candidateBases = [preferredBase, 'http://localhost:5000', ...Array.from({length: 20}, (_,i) => `http://localhost:${5001+i}`)].filter((v,i,a) => v && a.indexOf(v) === i);

      let response = null, data = null, lastNetworkError = null;
      for (const base of candidateBases) {
        try {
          response = await fetch(`${base}/api/plant-detection/predict`, { method: 'POST', body: formData });
          data = await response.json();
          if (response.ok && data.success) break;
        } catch (e) { lastNetworkError = e; response = null; data = null; }
      }

      if (!response || !data) throw new Error(lastNetworkError?.message || 'Unable to reach backend server');
      if (!response.ok || !data.success) throw new Error(data?.error || 'Prediction failed');
      setPrediction(data.prediction);
    } catch (err) {
      setError(err.message || 'Something went wrong while processing your image.');
    } finally {
      setLoading(false);
    }
  };

  const confidenceColor = confidencePercent >= 70 ? 'from-green-500 to-emerald-500' : confidencePercent >= 50 ? 'from-yellow-500 to-orange-400' : 'from-red-500 to-pink-500';
  const confidenceText = confidencePercent >= 70 ? 'text-green-700' : confidencePercent >= 50 ? 'text-yellow-700' : 'text-red-700';
  const confidenceBg = confidencePercent >= 70 ? 'from-green-50 to-emerald-50 border-green-200' : confidencePercent >= 50 ? 'from-yellow-50 to-orange-50 border-yellow-200' : 'from-red-50 to-pink-50 border-red-200';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative">

      {/* Decorative bg blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none" />

      {/* Header */}
      <header className="bg-white shadow-xl sticky top-0 z-50 border-b-4 border-green-500">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Leaf className="text-white" size={22} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Plant Disease Detection
            </h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-green-200 text-green-700 font-bold rounded-2xl hover:bg-green-50 hover:border-green-400 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>
      </header>

      {/* Hero strip */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-10 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-10 text-6xl">🌿</div>
          <div className="absolute top-1 right-20 text-5xl">🍃</div>
          <div className="absolute bottom-2 left-1/3 text-4xl">🌱</div>
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">AI-Powered Leaf Analysis</h2>
          <p className="text-green-100 text-lg">Upload a clear leaf photo and get instant disease detection for pepper, potato, and tomato plants.</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Upload Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Upload size={20} className="text-green-600" />
                Upload Leaf Photo
              </h2>
              <p className="text-sm text-gray-500 mt-1">PNG, JPG, JPEG, WEBP supported</p>
            </div>

            <div className="p-6">
              {/* Drop zone */}
              <label
                className={`block w-full border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  dragOver
                    ? 'border-green-500 bg-green-50 scale-[1.02]'
                    : 'border-green-300 hover:border-green-500 hover:bg-green-50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${dragOver ? 'bg-green-500 scale-110' : 'bg-gradient-to-br from-green-100 to-emerald-100'}`}>
                  <Upload size={28} className={dragOver ? 'text-white' : 'text-green-600'} />
                </div>
                <p className="text-gray-700 font-semibold text-lg mb-1">
                  {dragOver ? 'Drop it here!' : 'Click or drag & drop'}
                </p>
                <p className="text-gray-400 text-sm">Choose a clear leaf image for best results</p>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onImageChange(e.target.files?.[0])} />
              </label>

              {selectedFile && (
                <div className="mt-4 flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              )}

              {/* Detect Button */}
              <button
                onClick={detectPlantDisease}
                disabled={loading || !selectedFile}
                className={`mt-5 w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                  loading || !selectedFile
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {loading
                  ? <><Loader2 className="animate-spin" size={22} /> Analyzing Leaf...</>
                  : <><Leaf size={22} /> Detect Disease</>
                }
              </button>

              {/* Loading progress bar */}
              {loading && (
                <div className="mt-4">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse w-3/4" />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">Running AI analysis...</p>
                </div>
              )}

              {/* PDF button */}
              {prediction && (
                <button
                  onClick={downloadPdfReport}
                  className="mt-3 w-full py-3 px-6 rounded-2xl font-bold text-green-700 border-2 border-green-300 bg-white hover:bg-green-50 hover:border-green-500 hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FileText size={18} />
                  Download PDF Report
                </button>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 text-sm flex items-start gap-3">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Tips */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide">Tips for best results</p>
                <ul className="space-y-1">
                  {['Use clear, well-lit photos', 'Focus on the affected leaf area', 'Supported: pepper, potato, tomato'].map(tip => (
                    <li key={tip} className="text-xs text-blue-600 flex items-center gap-2">
                      <ChevronRight size={12} /> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" />
                Detection Result
              </h2>
              <p className="text-sm text-gray-500 mt-1">AI analysis output will appear here</p>
            </div>

            <div className="p-6">
              {/* Preview */}
              {previewUrl ? (
                <div className="relative overflow-hidden rounded-2xl border-2 border-gray-100 mb-5 group">
                  <img
                    src={previewUrl}
                    alt="Plant preview"
                    className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ) : (
                <div className="h-64 rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-green-50 flex flex-col items-center justify-center text-gray-400 mb-5">
                  <Leaf size={48} className="mb-3 opacity-30" />
                  <p className="font-medium">Image preview appears here</p>
                  <p className="text-sm mt-1">Upload a leaf photo to get started</p>
                </div>
              )}

              {/* Loading skeleton */}
              {loading && (
                <div className="space-y-3 animate-pulse">
                  <div className="h-6 bg-green-100 rounded-xl w-3/4" />
                  <div className="h-4 bg-gray-100 rounded-xl w-1/2" />
                  <div className="h-3 bg-gray-100 rounded-xl w-full" />
                  <div className="h-3 bg-gray-100 rounded-xl w-5/6" />
                </div>
              )}

              {/* Result */}
              {prediction && !loading && (
                <div className="space-y-4">
                  {/* Main result card */}
                  <div className={`p-5 rounded-2xl bg-gradient-to-br border-2 ${confidenceBg}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Predicted Disease</p>
                        <p className={`text-2xl font-bold ${confidenceText}`}>{prediction.predictedClass}</p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${confidenceText} bg-white border`}>
                        {confidencePercent}% confidence
                      </div>
                    </div>

                    {/* Confidence bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Confidence Level</span>
                        <span>{confidencePercent}%</span>
                      </div>
                      <div className="h-3 bg-white rounded-full overflow-hidden border">
                        <div
                          className={`h-full bg-gradient-to-r ${confidenceColor} rounded-full transition-all duration-1000`}
                          style={{ width: `${confidencePercent}%` }}
                        />
                      </div>
                    </div>

                    {prediction.isUnsupportedImage && (
                      <div className="flex items-start gap-2 p-3 bg-white rounded-xl border border-red-200">
                        <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600">This may not be a supported plant. Upload a pepper, potato, or tomato leaf.</p>
                      </div>
                    )}
                    {!prediction.isUnsupportedImage && confidencePercent < 50 && (
                      <div className="flex items-start gap-2 p-3 bg-white rounded-xl border border-yellow-200">
                        <AlertCircle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-700">Low confidence — try a clearer, better-lit image.</p>
                      </div>
                    )}
                  </div>

                  {/* Top predictions */}
                  {Array.isArray(prediction.topPredictions) && prediction.topPredictions.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-3">Top Predictions</p>
                      <div className="space-y-2">
                        {prediction.topPredictions.map((item, i) => {
                          const pct = Math.round(item.confidence * 100);
                          return (
                            <div key={`${item.classIndex}-${item.label}`} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm text-gray-700 font-medium group-hover:text-green-700 transition-colors">{item.label}</span>
                                <span className="text-sm font-bold text-gray-800">{pct}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700"
                                  style={{ width: `${pct}%`, transitionDelay: `${i * 100}ms` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Empty state */}
              {!prediction && !loading && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
                    <Leaf size={32} className="text-green-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No results yet</p>
                  <p className="text-gray-400 text-sm mt-1">Upload an image and click Detect</p>
                </div>
              )}
            </div>
          </div>
        </div>

       
      </main>
    </div>
  );
};

export default PlantDetection;