import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Search, Filter, Star, Heart, Plus, Minus, X, Check, Truck, MapPin, ArrowLeft, Upload, Package, List, User, LogOut } from 'lucide-react';
import AddPlantModal from './AddPlantModal';
import CheckoutModal from './CheckoutModal';

const PlantDetailsModal = ({ plant, show, onClose, onAddToCart }) => {
  if (!show || !plant) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col lg:flex-row transform transition-all duration-300 scale-100 hover:scale-[1.02]">
        <div className="flex-1 relative">
          <img 
            src={plant.image?.startsWith('http') ? plant.image : `1${plant.image}` || '/images/placeholder.jpg'}
            alt={plant.name}
            className="w-full h-64 lg:h-96 object-cover rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none transition-transform duration-500 hover:scale-105"
          />
          {plant.discount > 0 && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
              SALE
            </div>
          )}
        </div>
        <div className="flex-1 p-6 lg:p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {plant.name}
            </h1>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 hover:rotate-90 transform"
            >
              <X />
            </button>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            {[1,2,3,4,5].map(star => (
              <Star key={star} size={16} className="text-yellow-400 fill-current" />
            ))}
            <span className="ml-2 text-sm text-gray-600">(15 customer reviews)</span>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Rs {(plant.price - (plant.price * (plant.discount || 0) / 100)).toLocaleString()}
              </span>
              {plant.discount > 0 && (
                <span className="text-lg text-gray-400 line-through">
                  Rs {plant.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600 leading-relaxed">
              {plant.description || 'Beautiful plant perfect for your home or garden. Easy to care for and adds natural beauty to any space.'}
            </p>
          </div>
          
          <div className="mb-6 space-y-2 text-gray-600">
            <p><span className="font-semibold text-gray-800">CATEGORY:</span> {plant.category.toUpperCase()}</p>
            <p><span className="font-semibold text-gray-800">Stock:</span> {plant.stock} units available</p>
          </div>
          
          <button
            onClick={() => {
              onAddToCart(plant);
              onClose();
            }}
            disabled={plant.stock === 0}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
              plant.stock === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg'
            }`}
          >
            {plant.stock === 0 ? 'Out of Stock' : 'Add To Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};


const PlantInventory = ({ onClose, onPlantAdded }) => {
  const [myPlants, setMyPlants] = useState([]);
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchMyPlants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
const response = await fetch('http://localhost:5000/api/plants/my', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

if (response.ok) {
  const plants = await response.json();
  setMyPlants(plants);
} else {
  console.error('Failed to fetch plants');
  setMyPlants([]);
}
} catch (error) {
  console.error('Error fetching plants:', error);
  setMyPlants([]);
} finally {
  setLoading(false);
}
};

  useEffect(() => {
    fetchMyPlants();
  }, []);

  const handlePlantAdded = () => {
    fetchMyPlants();
    if (onPlantAdded) onPlantAdded();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
          <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
            <Package size={28} className="text-green-600" />
            Plant Inventory
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddPlant(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-300"
            >
              <Plus size={20} />
              Add Plant
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 hover:rotate-90 transform"
            >
              <X />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-gray-50 to-green-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Loading your plants...</p>
              </div>
            </div>
          ) : myPlants.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Package size={64} className="mx-auto mb-6 text-gray-400 opacity-50" />
                <h3 className="text-2xl font-bold text-gray-600 mb-4">No plants in your inventory</h3>
                <p className="text-gray-500 mb-6">Start by adding your first plant to the inventory.</p>
                <button
                  onClick={() => setShowAddPlant(true)}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-300"
                >
                  Add Your First Plant
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPlants.map(plant => (
                <div key={plant._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <div className="relative mb-4 overflow-hidden rounded-xl">
                    <img
                      src={plant.image?.startsWith('http') ? plant.image : `http://localhost:5000${plant.image}` || '/images/placeholder.jpg'}
                      alt={plant.name}
                      className="w-full h-40 object-cover rounded-xl"
                    />
                    {plant.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        -{plant.discount}%
                      </div>
                    )}
                  </div>
                  
                  <h4 className="text-lg font-bold text-gray-800 mb-2">{plant.name}</h4>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm font-semibold rounded-full mb-3">
                    {plant.category}
                  </span>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-xl font-bold text-green-600">
                        Rs {plant.price.toLocaleString()}
                      </span>
                      {plant.discount > 0 && (
                        <div className="text-sm text-red-500 font-semibold">
                          {plant.discount}% off
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Stock: {plant.stock}</div>
                      <div className="text-xs text-gray-400">Sold: {plant.sold || 0}</div>
                    </div>
                  </div>

               <div className="grid grid-cols-2 gap-2">
  <button className="w-full h-10 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold rounded-lg hover:from-blue-600 hover:to-indigo-600 transform hover:scale-105 transition-all duration-200">
    Edit
  </button>

  <button
    onClick={() => {
      const currentStock = plant.stock;
      const newStock = prompt(
        `Current stock: ${currentStock}\n\nOptions:\n` +
        `• Enter a number to set new stock (e.g., "5" sets stock to 5)\n` +
        `• Enter "-1" to decrease by 1\n` +
        `• Enter "0" to set stock to zero\n\n` +
        `What would you like to do?`
      );

      if (newStock === null) return;

      const handleStockUpdate = async (updateData) => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/plants/${plant._id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
          });

          if (response.ok) {
            fetchMyPlants();
            alert('Stock updated successfully!');
          } else {
            alert('Failed to update stock');
          }
        } catch (error) {
          console.error('Error updating stock:', error);
          alert('Failed to update stock');
        }
      };

      if (newStock === '-1') {
        const updatedStock = Math.max(0, currentStock - 1);
        handleStockUpdate({ stock: updatedStock });
      } else {
        const stockValue = parseInt(newStock);
        if (!isNaN(stockValue) && stockValue >= 0) {
          handleStockUpdate({ stock: stockValue });
        } else {
          alert('Invalid input. Please enter a valid number');
        }
      }
    }}
    className="w-full h-10 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold rounded-lg hover:from-blue-600 hover:to-indigo-600 transform hover:scale-105 transition-all duration-200"
  >
    Manage Stock
  </button>

  <button
    onClick={async () => {
      const action = plant.isActive ? 'hide from shop' : 'show in shop';
      const confirmMessage = plant.isActive 
        ? `Hide "${plant.name}" from shop?\n\nCustomers won't be able to see or buy this plant, but it will remain in your inventory.`
        : `Show "${plant.name}" in shop?\n\nCustomers will be able to see and buy this plant again.`;

      if (!window.confirm(confirmMessage)) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/plants/${plant._id}/toggle-status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          await fetchMyPlants();
          alert(`Plant ${plant.isActive ? 'hidden from' : 'shown in'} shop successfully!`);
        } else {
          alert(`Failed to ${action}`);
        }
      } catch (error) {
        console.error('Error toggling plant status:', error);
        alert(`Failed to ${action}`);
      }
    }}
    className="w-full h-10 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold rounded-lg hover:from-blue-600 hover:to-indigo-600 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-1"
  >
    {plant.isActive ? (
      <>
        <X size={14} />
        Hide from Shop
      </>
    ) : (
      <>
        <Check size={14} />
        Show in Shop
      </>
    )}
  </button>

  <button
    onClick={async () => {
      if (!window.confirm(`⚠️ PERMANENT DELETE ⚠️\n\nDelete "${plant.name}" permanently?\n\nThis will:\n• Remove it from your inventory completely\n• Remove it from the shop\n• Cannot be undone\n\nAre you absolutely sure?`)) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/plants/${plant._id}/permanent-delete`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          await fetchMyPlants();
          if (onPlantAdded) onPlantAdded();
          alert('Plant permanently deleted!');
        } else {
          const errorData = await response.text();
          console.error('Permanent delete failed:', errorData);
          alert('Failed to delete plant permanently');
        }
      } catch (error) {
        console.error('Error permanently deleting plant:', error);
        alert('Failed to delete plant permanently');
      }
    }}
    className="w-full h-10 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold rounded-lg hover:from-blue-600 hover:to-indigo-600 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-1"
  >
    <X size={14} />
    Delete
  </button>
</div>

                  </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddPlantModal
        showAddPlant={showAddPlant}
        setShowAddPlant={setShowAddPlant}
        onPlantAdded={handlePlantAdded}
      />
    </div>
  );
};

const PlantShop = () => {
  const [plants, setPlants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [orderStatus, setOrderStatus] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showPlantDetails, setShowPlantDetails] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAdmin(parsedUser.role === 'admin' || parsedUser.role === 'nursery');
        
        setCustomerInfo({
          name: parsedUser.name || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || '',
          address: parsedUser.address || '',
          city: parsedUser.city || '',
          postalCode: parsedUser.postalCode || ''
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, []);

  const calculateDiscountAmount = useCallback((item) => {
    return item.price * (item.discount || 0) / 100;
  }, []);

  const calculateTotal = useCallback(() => {
    return cart.reduce((total, item) => {
      const discountedPrice = item.price - (item.price * (item.discount || 0) / 100);
      return total + (discountedPrice * item.quantity);
    }, 0);
  }, [cart]);

  const fetchPlants = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (selectedCategory !== 'all') queryParams.append('category', selectedCategory);
      if (searchQuery) queryParams.append('search', searchQuery);
      if (sortBy) queryParams.append('sortBy', sortBy);

      const response = await fetch(`http://localhost:5000/api/store/plants?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setPlants(data);
      } else {
        console.error('Failed to fetch plants');
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/store/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, [selectedCategory, searchQuery, sortBy]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const addToCart = useCallback((plant) => {
  setCart(prevCart => {
    const existingItem = prevCart.find(item => item._id === plant._id);
    if (existingItem) {
      return prevCart.map(item => 
        item._id === plant._id 
          ? { ...item, quantity: Math.min(item.quantity + 1, plant.stock) }
          : item
      );
    }
    return [...prevCart, { ...plant, quantity: 1 }];
  });
}, []);

  const removeFromCart = (plantId) => {
    setCart(cart.filter(item => item._id !== plantId));
  };

  const updateQuantity = (plantId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(plantId);
      return;
    }
    
    setCart(cart.map(item => 
      item._id === plantId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };


const filteredPlants = plants.filter(plant => {
  return selectedCategory === "all" || plant.category.toLowerCase() === selectedCategory.toLowerCase();
});



const placeOrder = async (paymentIntentId) => {
  try {
    const orderData = {
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      customerAddress: customerInfo.address,
      deliveryType: deliveryType,
      items: cart.map(item => ({
        plantId: item._id,
        plantName: item.name,
        quantity: item.quantity,
        price: item.price - (item.price * (item.discount || 0) / 100)
      })),
      total: calculateTotal(),
      userId: user?.id || null,
      paymentIntentId,        // ← new
      paymentStatus: 'paid',  // ← new
    };

    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (response.ok) {
      setOrderStatus({ success: true, orderId: result.order.orderNumber });
      setCart([]);
      setShowCheckout(false);
      fetchPlants();
    } else {
      setOrderStatus({ success: false, message: result.error || 'Failed to place order' });
    }
  } catch (error) {
    setOrderStatus({ success: false, message: 'Failed to place order' });
  }
};
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAdmin(false);
    setCustomerInfo({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: ''
    });
  };

  const PlantCard = ({ plant }) => {
    const [isAdding, setIsAdding] = useState(false);
    const discountedPrice = plant.price - calculateDiscountAmount(plant);
    
    return (
<div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:scale-105 hover:-translate-y-2">     <div 
          className="p-6 h-full flex flex-col"
          onClick={() => {
            setSelectedPlant(plant);
            setShowPlantDetails(true);
          }}
        >
          <div className="relative mb-4">
            <img 
              src={plant.image?.startsWith('http') ? plant.image : `http://localhost:5000${plant.image}` || '/images/placeholder.jpg'}
              alt={plant.name}
className="w-full h-48 object-cover rounded-xl transform group-hover:scale-110 transition-transform duration-500"           />
            {plant.discount > 0 && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                -{plant.discount}%
              </div>
            )}
            {plant.stock < 5 && plant.stock > 0 && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                Only {plant.stock} left
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors duration-300">
              {plant.name}
            </h3>
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-gray-100 to-green-100 text-gray-700 text-sm font-semibold rounded-full mb-3 w-fit">
              {plant.category}
            </span>
            
            <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
              {plant.description || 'Beautiful plant perfect for your home or garden.'}
            </p>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Rs {discountedPrice.toLocaleString()}
                </span>
                {plant.discount > 0 && (
                  <span className="text-lg text-gray-400 line-through">
                    Rs {plant.price.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Stock: {plant.stock} units
              </div>
            </div>

            <button
  onClick={(e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isAdding || plant.stock === 0) return;
    
    setIsAdding(true);
    addToCart(plant);
    setTimeout(() => setIsAdding(false), 500);
  }}
  disabled={plant.stock === 0 || isAdding}
  className={`w-full py-3 px-4 font-bold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
    plant.stock === 0 || isAdding
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl'
  }`}
>
  <ShoppingCart size={16} />
  {isAdding ? 'Adding...' : plant.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
</button>
          </div>
        </div>
      </div>
    );
  };

  const CartSidebar = () => (
    <div className={`fixed top-0 right-0 w-96 h-full bg-white shadow-2xl transition-transform duration-300 z-[1000] flex flex-col ${
      showCart ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Shopping Cart ({cart.length})
          </h3>
          <button 
            onClick={() => setShowCart(false)}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 hover:rotate-90 transform"
          >
            <X />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
        {cart.length === 0 ? (
          <div className="text-center mt-20">
            <ShoppingCart size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">Your cart is empty</p>
            <p className="text-gray-400 text-sm mt-2">Add some beautiful plants to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map(item => {
              const discountedPrice = item.price - calculateDiscountAmount(item);
              return (
                <div key={item._id} className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <img 
                      src={item.image?.startsWith('http') ? item.image : `http://localhost:5000${item.image}` || '/images/placeholder.jpg'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl border-2 border-gray-200"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">{item.name}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-green-600">
                          Rs {discountedPrice.toLocaleString()}
                        </span>
                        {item.discount > 0 && (
                          <span className="text-sm text-gray-400 line-through">
                            Rs {item.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 ${
                              item.quantity >= item.stock 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-green-200 hover:bg-green-300 text-green-700'
                            }`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200 ml-auto"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold text-gray-800">Total:</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Rs {calculateTotal().toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => {
              setShowCart(false);
              setShowCheckout(true);
            }}
            className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-300"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );

  const OrderStatusModal = () => {
    if (!orderStatus) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[3000] p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all duration-300 scale-100">
          {orderStatus.success ? (
            <>
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Check size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                Order Placed Successfully!
              </h3>
              <p className="text-gray-600 mb-2">
                Order ID: <span className="font-semibold">{orderStatus.orderId}</span>
              </p>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. You will receive a confirmation email shortly.
              </p>
              <button
                onClick={() => setOrderStatus(null)}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-300"
              >
                Continue Shopping
              </button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <X size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-red-600 mb-4">Order Failed</h3>
              <p className="text-gray-600 mb-6">{orderStatus.message}</p>
              <button
                onClick={() => setOrderStatus(null)}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
<div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative z-50">      {/* Header */}
      <header className="bg-white shadow-xl sticky top-0 z-50 border-b-4 border-green-500">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
<img src="https://img.icons8.com/?size=100&id=4Xem_S1LR0kT&format=png&color=40C057" width="36" height="36" /> Plantify Shop
            </h1>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3 mr-4 px-4 py-2 bg-gradient-to-r from-gray-100 to-green-100 rounded-2xl">
                  <User size={20} className="text-gray-600" />
                  <span className="text-gray-700 font-semibold">Welcome, {user.name}</span>
                  <button
                    onClick={logout}
                    className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold rounded-xl hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 flex items-center gap-1"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
              
              {isAdmin && (
                <button
                  onClick={() => setShowInventory(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-600 transform hover:scale-105 transition-all duration-300"
                >
                  <Package size={20} />
                  Inventory
                </button>
              )}
              
              <button
                onClick={() => setShowCart(true)}
                className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-300"
              >
                <ShoppingCart size={20} />
                Cart ({cart.length})
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Search */}
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">Search Plants</label>
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <input
        type="text"
        placeholder="Search for plants..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none transition-colors duration-200 text-lg"
      />
    </div>
  </div>

  {/* Category */}
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
    <select
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none transition-colors duration-200 text-lg"
    >
      <option value="all">All Categories</option>
      {categories.map(cat => (
        <option key={cat} value={cat}>
          {cat.charAt(0).toUpperCase() + cat.slice(1)}
        </option>
      ))}
    </select>
  </div>

  {/* Sort By */}
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">Sort By</label>
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none transition-colors duration-200 text-lg"
    >
      <option value="name">Name (A-Z)</option>
      <option value="price_low">Price (Low to High)</option>
      <option value="price_high">Price (High to Low)</option>
      <option value="popular">Most Popular</option>
      <option value="newest">Newest First</option>
    </select>
  </div>
</div>

        </div>
      </div>

     {/* Main Content */}  
<main className="max-w-7xl mx-auto px-6 py-8">
  <div className="mb-6">
    <p className="text-gray-600 text-lg">
      Showing <span className="font-semibold text-gray-800">{filteredPlants.length}</span> plants 
      {selectedCategory !== 'all' && (
        <span> in <span className="font-semibold text-green-600">{selectedCategory}</span></span>
      )}
    </p>
  </div>

  {filteredPlants.length === 0 ? (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">🌱</div>
      <h3 className="text-2xl font-bold text-gray-600 mb-4">No plants found</h3>
      <p className="text-gray-500 text-lg">Try adjusting your search or filter criteria</p>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {filteredPlants.map(plant => (
        <PlantCard key={plant._id} plant={plant} />
      ))}
    </div>
  )}
</main>


      {/* Components */}
      <CartSidebar />
      
      <CheckoutModal 
        showCheckout={showCheckout}
        setShowCheckout={setShowCheckout}
        customerInfo={customerInfo}
        setCustomerInfo={setCustomerInfo}
        deliveryType={deliveryType}
        setDeliveryType={setDeliveryType}
        cart={cart}
        calculateTotal={calculateTotal}
        calculateDiscountAmount={calculateDiscountAmount}
        placeOrder={placeOrder}
      />
      
      {showInventory && (
        <PlantInventory 
          onClose={() => setShowInventory(false)}
          onPlantAdded={fetchPlants}
        />
      )}
      
      <OrderStatusModal />
      
      <PlantDetailsModal 
        plant={selectedPlant}
        show={showPlantDetails}
        onClose={() => setShowPlantDetails(false)}
        onAddToCart={addToCart}
      />
      
      {showCart && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-[999]"
          onClick={() => setShowCart(false)}
        />
      )}
    </div>
  );
};

export default PlantShop;
