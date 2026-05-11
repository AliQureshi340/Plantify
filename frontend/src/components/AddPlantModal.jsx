import React, { useState } from 'react';
import { X, Upload, Plus } from 'lucide-react';

const AddPlantModal = ({ showAddPlant, setShowAddPlant, onPlantAdded }) => {
 const [formData, setFormData] = useState({
  name: '',
  category: 'indoor',
  price: '',
  stock: '',
  discount: 0,
  description: ''
});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

const categories = ['outdoor', 'indoor', 'seeds', 'fertilizers', 'equipment', 'artificial'];


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const resetForm = () => {
   setFormData({
  name: '',
  category: 'outdoor',
  price: '',
  stock: '',
  discount: 0,
  description: ''
});
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.price || !formData.stock) {
        alert('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (!imagePreview) {
        alert('Please upload an image');
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('category', formData.category);
      submitData.append('price', formData.price);
      submitData.append('stock', formData.stock);
      submitData.append('discount', formData.discount);
      submitData.append('description', formData.description);
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/plants', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const result = await response.json();

      if (response.ok) {
        alert('Plant added successfully!');
        resetForm();
        setShowAddPlant(false);
        if (onPlantAdded) onPlantAdded();
      } else {
        alert(result.error || 'Failed to add plant');
      }

    } catch (error) {
      console.error('Error adding plant:', error);
      alert('Failed to add plant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!showAddPlant) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Add New Plant
          </h2>
          <button 
            onClick={() => {
              setShowAddPlant(false);
              resetForm();
            }}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold transition-colors duration-200"
          >
            ×
          </button>
        </div>

        <div>
          {/* Image Upload Section - Prominent at the top */}
          <div className="mb-6">
            <label className="block mb-3 font-bold text-gray-700">
              Plant Image *
            </label>
            
            {!imagePreview ? (
              <div 
                className="border-4 border-dashed border-green-400 rounded-2xl p-10 text-center cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 hover:border-emerald-500 transition-all duration-300 group"
                onClick={() => document.getElementById('imageInput').click()}
              >
                <Upload className="w-16 h-16 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h4 className="text-xl font-bold text-green-700 mb-2">
                  Upload Plant Image
                </h4>
                <p className="text-gray-600 mb-2">
                  Click here to browse and select an image
                </p>
                <p className="text-sm text-gray-500">
                  Supports: JPG, PNG, GIF • Max size: 5MB
                </p>
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
              </div>
            ) : (
              <div className="relative inline-block border-2 border-green-500 rounded-xl p-2 bg-gradient-to-br from-green-50 to-emerald-50">
                <img
                  src={imagePreview}
                  alt="Plant Preview"
                  className="w-52 h-52 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                  title="Remove image"
                >
                  ×
                </button>
                <div className="text-center mt-2 text-sm text-green-600 font-bold">
                  Image Ready ✓
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 font-bold text-gray-700">Plant Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter plant name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors duration-200 hover:border-gray-400"
              />
            </div>

            <div>
              <label className="block mb-2 font-bold text-gray-700">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors duration-200 hover:border-gray-400 cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 font-bold text-gray-700">Price (Rs) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                placeholder="Enter price"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors duration-200 hover:border-gray-400"
              />
            </div>

            <div>
              <label className="block mb-2 font-bold text-gray-700">Stock Quantity *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="Enter stock quantity"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors duration-200 hover:border-gray-400"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-bold text-gray-700">
              Discount (%) <span className="text-gray-400 font-normal text-sm">- Optional</span>
            </label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleInputChange}
              min="0"
              max="100"
              placeholder="Enter discount percentage"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors duration-200 hover:border-gray-400"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-bold text-gray-700">
              Description <span className="text-gray-400 font-normal text-sm">- Optional</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="Enter plant description, care instructions, etc."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors duration-200 hover:border-gray-400 resize-vertical"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => {
                setShowAddPlant(false);
                resetForm();
              }}
              className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !imagePreview}
              className={`px-6 py-3 font-semibold rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-200 flex items-center gap-2
                ${loading || !imagePreview 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:-translate-y-0.5 hover:from-green-600 hover:to-emerald-600'}`}
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Adding Plant...
                </>
              ) : (
                <>
                  Add Plant
                  <Plus className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPlantModal;
