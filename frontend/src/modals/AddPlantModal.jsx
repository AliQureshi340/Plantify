import React, { useState } from 'react';
import { X, Upload, Plus } from 'lucide-react';

const AddPlantModal = ({ showAddPlant, setShowAddPlant, onPlantAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Indoor',
    price: '',
    stock: '',
    discount: 0,
    description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = ['Indoor', 'Outdoor', 'Herbs', 'Succulents', 'Flowering'];

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
      category: 'Indoor',
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Add New Plant</h2>
          <button 
            onClick={() => {
              setShowAddPlant(false);
              resetForm();
            }}
            style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
          >
            <X />
          </button>
        </div>

        <div>
          {/* Image Upload Section - Prominent at the top */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '16px' }}>
              Plant Image *
            </label>
            
            {!imagePreview ? (
              <div 
                style={{
                  border: '3px dashed #28a745',
                  borderRadius: '12px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#f8f9fa',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => document.getElementById('imageInput').click()}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e8f5e8';
                  e.target.style.borderColor = '#20c997';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.borderColor = '#28a745';
                }}
              >
                <Upload size={48} style={{ color: '#28a745', marginBottom: '15px' }} />
                <h4 style={{ margin: '0 0 8px 0', color: '#28a745', fontSize: '18px' }}>
                  Upload Plant Image
                </h4>
                <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                  Click here to browse and select an image
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                  Supports: JPG, PNG, GIF • Max size: 5MB
                </p>
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  required
                />
              </div>
            ) : (
              <div style={{ 
                position: 'relative', 
                display: 'inline-block',
                border: '2px solid #28a745',
                borderRadius: '12px',
                padding: '8px',
                backgroundColor: '#f8f9fa'
              }}>
                <img
                  src={imagePreview}
                  alt="Plant Preview"
                  style={{
                    width: '200px',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    display: 'block'
                  }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}
                  title="Remove image"
                >
                  ×
                </button>
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#28a745',
                  fontWeight: '600'
                }}>
                  Image Ready ✓
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Plant Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter plant name"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Price (Rs) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                placeholder="Enter price"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Stock Quantity *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="Enter stock quantity"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Discount (%) <span style={{ color: '#999', fontWeight: 'normal' }}>- Optional</span>
            </label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleInputChange}
              min="0"
              max="100"
              placeholder="Enter discount percentage"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Description <span style={{ color: '#999', fontWeight: 'normal' }}>- Optional</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="Enter plant description, care instructions, etc."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                resize: 'vertical',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                setShowAddPlant(false);
                resetForm();
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !imagePreview}
              style={{
                padding: '12px 24px',
                backgroundColor: loading || !imagePreview ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading || !imagePreview ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? 'Adding Plant...' : 'Add Plant'}
              {!loading && <Plus size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPlantModal;
