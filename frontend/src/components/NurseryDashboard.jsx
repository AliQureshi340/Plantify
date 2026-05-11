import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthSystem';
import AddPlantModal from './AddPlantModal';
import ShopOrdersManagement from "./Nursery-Section/ShopOrdersManagement";
import { WithPageLoader } from '../styles/PageLoader';
//
import { FcInfo, FcHome, FcShop, FcTodoList ,FcDepartment,FcStatistics } from "react-icons/fc";



const NurseryDashboard = () => {
  const { authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [plants, setPlants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [editingPlant, setEditingPlant] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [notification, setNotification] = useState(null);
  const [pageTransition, setPageTransition] = useState(false);
  const [modalTransition, setModalTransition] = useState(false);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle modal transitions
  const openOrderModal = (order) => {
    setModalTransition(true);
    setTimeout(() => {
      setSelectedOrder(order);
      setModalTransition(false);
    }, 50);
  };

  const closeOrderModal = () => {
    setModalTransition(true);
    setTimeout(() => {
      setSelectedOrder(null);
      setModalTransition(false);
    }, 200);
  };

  const openEditModal = (plant) => {
    setModalTransition(true);
    setTimeout(() => {
      setEditingPlant(plant);
      setModalTransition(false);
    }, 50);
  };

  const closeEditModal = () => {
    setModalTransition(true);
    setTimeout(() => {
      setEditingPlant(null);
      setModalTransition(false);
    }, 200);
  };

  // Handle tab navigation with transition effect
  const navigateToTab = (tab) => {
    if (tab === activeTab) return;
    setPageTransition(true);
    setTimeout(() => {
      setActiveTab(tab);
      setPageTransition(false);
    }, 300);
  };

  // Fetch data from backend
  useEffect(() => {
    fetchPlants();
    fetchOrders();
    fetchCustomers();
  }, []);

  const fetchPlants = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/plants');
      const data = await response.json();
      setPlants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching plants:', error);
      showNotification('Failed to fetch plants', 'error');
      setPlants([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await authFetch('/api/orders?limit=100');
      const data = await response.json();
      const ordersData = Array.isArray(data) ? data : (data.orders || []);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showNotification('Failed to fetch orders', 'error');
      setOrders([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await authFetch('/api/admin/users');
      const data = await response.json();
      const customerData = Array.isArray(data) ? data.filter(user => user.role === 'user') : [];
      setCustomers(customerData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      showNotification('Failed to fetch customers', 'error');
      setCustomers([]);
    }
  };

  const handleUpdatePlant = async (id, updatedPlant) => {
    try {
      const response = await authFetch(`/api/plants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPlant)
      });
      if (response.ok) {
        fetchPlants();
        closeEditModal();
        showNotification('Plant updated successfully!');
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to update plant', 'error');
      }
    } catch (error) {
      console.error('Error updating plant:', error);
      showNotification('Failed to update plant', 'error');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await authFetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchOrders();
        showNotification(`Order status updated to ${status}`);
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to update order', 'error');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      showNotification('Failed to update order', 'error');
    }
  };

  const generateReport = () => {
    if (!orders || !Array.isArray(orders)) {
      return {
        totalSales: 0,
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        lowStock: 0,
        totalCustomers: 0,
        topSellingPlants: [],
        averageOrderValue: 0
      };
    }

    if (!plants || !Array.isArray(plants)) {
      return {
        totalSales: 0,
        totalOrders: orders.length,
        pendingOrders: orders.filter(order => order.status === 'pending').length,
        completedOrders: orders.filter(order => order.status === 'completed').length,
        lowStock: 0,
        totalCustomers: customers?.length || 0,
        topSellingPlants: [],
        averageOrderValue: 0
      };
    }

    const completedOrders = orders.filter(order => order.status === 'completed');
    const totalSales = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrdersCount = completedOrders.length;
    const lowStock = plants.filter(plant => plant.stock < 10);
    const topSellingPlants = plants.sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5);

    return {
      totalSales,
      totalOrders,
      pendingOrders,
      completedOrders: completedOrdersCount,
      lowStock: lowStock.length,
      totalCustomers: customers?.length || 0,
      topSellingPlants,
      averageOrderValue: completedOrdersCount > 0 ? totalSales / completedOrdersCount : 0
    };
  };

  const report = generateReport();

  // Notification component
  const Notification = () => (
    notification && (
      <div className={`fixed top-5 right-5 px-6 py-4 rounded-xl text-white font-semibold z-[2000] shadow-2xl transform transition-all duration-500 animate-pulse
        ${notification.type === 'error' 
          ? 'bg-gradient-to-r from-red-500 to-pink-500' 
          : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}>
        {notification.message}
      </div>
    )
  );

  // Dashboard Overview with enhanced metrics
  const renderDashboard = () => {
    const recentOrders = (orders || []).slice(0, 5);
    const lowStockPlants = (plants || []).filter(plant => plant.stock < 10).slice(0, 5);

    return (
      <div className={`page-content min-h-screen transition-all duration-500 ${pageTransition ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
        <div className="p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Plant Nursery Dashboard
            </h2>
            <button 
              onClick={() => window.open('/shop', '_blank')}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200"
            >
              View Plant Store
            </button>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-2xl text-center text-white shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all duration-300">
              <h3 className="text-sm font-semibold opacity-90 mb-2">Plant Revenue</h3>
              <p className="text-3xl font-bold mb-1">Rs {report.totalSales.toLocaleString()}</p>
              <small className="text-xs opacity-80">From {report.completedOrders} sales</small>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-center text-white shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all duration-300">
              <h3 className="text-sm font-semibold opacity-90 mb-2">Growing Orders</h3>
              <p className="text-3xl font-bold mb-1">{report.pendingOrders}</p>
              <small className="text-xs opacity-80">Ready to bloom</small>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-6 rounded-2xl text-center text-white shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all duration-300">
              <h3 className="text-sm font-semibold opacity-90 mb-2">Plant Alert</h3>
              <p className="text-3xl font-bold mb-1">{report.lowStock}</p>
              <small className="text-xs opacity-80">Need fresh stock</small>
            </div>
            <div className="bg-gradient-to-br from-emerald-600 to-green-700 p-6 rounded-2xl text-center text-white shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all duration-300">
              <h3 className="text-sm font-semibold opacity-90 mb-2">Garden Community</h3>
              <p className="text-3xl font-bold mb-1">{report.totalCustomers}</p>
              <small className="text-xs opacity-80">Plant lovers</small>
            </div>
            <div className="bg-gradient-to-br from-green-700 to-emerald-800 p-6 rounded-2xl text-center text-white shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all duration-300">
              <h3 className="text-sm font-semibold opacity-90 mb-2">Avg Plant Value</h3>
              <p className="text-3xl font-bold mb-1">Rs {Math.round(report.averageOrderValue).toLocaleString()}</p>
              <small className="text-xs opacity-80">Per green purchase</small>
            </div>
            <div className="bg-gradient-to-br from-emerald-700 to-green-800 p-6 rounded-2xl text-center text-white shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all duration-300">
              <h3 className="text-sm font-semibold opacity-90 mb-2">Green Collection</h3>
              <p className="text-3xl font-bold mb-1">{plants.length}</p>
              <small className="text-xs opacity-80">In plant nursery</small>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transform transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">📦</span> Recent Orders
              </h3>
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div key={order._id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex justify-between items-center">
                      <div>
<p className="font-semibold text-gray-800">#{order.orderNumber}</p>                        <p className="text-sm text-gray-600">
                          {order.customerName || order.shippingAddress?.fullName || 'N/A'} • Rs {order.total.toLocaleString()}
                        </p>
                        <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold
                          ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <button 
                        onClick={() => openOrderModal(order)}
                        className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
                {recentOrders.length === 0 && (
                  <p className="text-center text-gray-500 italic py-8">No orders yet</p>
                )}
              </div>
            </div>
            
            {/* Low Stock Alert */}
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transform transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">⚠️</span> Low Stock Alert
              </h3>
              <div className="space-y-3">
                {lowStockPlants.map(plant => (
                  <div key={plant._id} className="p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors duration-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{plant.name}</p>
                        <p className="text-sm font-bold text-red-600">Only {plant.stock} left</p>
                      </div>
                      <button 
                        onClick={() => openEditModal(plant)}
                        className="px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-lg hover:bg-yellow-600 transition-colors duration-200"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                ))}
                {lowStockPlants.length === 0 && (
                  <p className="text-center text-gray-500 italic py-8">All plants well stocked</p>
                )}
              </div>
            </div>

            {/* Top Selling Plants */}
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transform transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🏆</span> Top Sellers
              </h3>
              <div className="space-y-3">
                {report.topSellingPlants.map((plant, index) => (
                  <div key={plant._id} className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                        ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'}`}>
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{plant.name}</p>
                        <p className="text-sm text-gray-600">{plant.sold || 0} sold</p>
                      </div>
                    </div>
                  </div>
                ))}
                {report.topSellingPlants.length === 0 && (
                  <p className="text-center text-gray-500 italic py-8">No sales data yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Plants Management
  const renderPlants = () => (
    <div className={`page-content transition-all duration-500 ${pageTransition ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
      <div className="p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Plants Inventory Management
          </h2>
          <div className="flex gap-3">
            <button 
              onClick={() => window.open('/shop', '_blank')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200"
            >
              View in Shop
            </button>
            <button 
              onClick={() => setShowAddPlant(true)} 
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200"
            >
              + Add New Plant
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Plant Details</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Pricing</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Stock Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {plants.map(plant => {
                  const stockStatus = plant.stock === 0 ? 'Out of Stock' : 
                                    plant.stock < 5 ? 'Critical' : 
                                    plant.stock < 10 ? 'Low' : 'Good';
                  const stockColor = plant.stock === 0 ? 'bg-red-500' : 
                                   plant.stock < 5 ? 'bg-orange-500' : 
                                   plant.stock < 10 ? 'bg-yellow-500' : 'bg-green-500';
                  
                  return (
                    <tr key={plant._id} className="hover:bg-green-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <img 
                          src={plant.image || '/api/placeholder/60/60'} 
                          alt={plant.name} 
                          className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">{plant.name}</h4>
                          <span className="inline-block mt-1 px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-full">
                            {plant.category}
                          </span>
                          <p className="mt-2 text-sm text-gray-600">{plant.description?.substring(0, 50)}...</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-xl font-bold text-green-600">Rs {plant.price.toLocaleString()}</p>
                          {plant.discount > 0 && (
                            <span className="inline-block mt-1 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                              -{plant.discount}% OFF
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-lg font-bold text-gray-800 mb-1">{plant.stock} units</p>
                          <span className={`inline-block px-3 py-1 ${stockColor} text-white text-xs font-bold rounded-full`}>
                            {stockStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-600">Sold: <span className="font-semibold">{plant.sold || 0}</span></p>
                          <p className="text-gray-600">Revenue: <span className="font-semibold text-green-600">Rs {((plant.sold || 0) * plant.price).toLocaleString()}</span></p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => openEditModal(plant)} 
                          className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {plants.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                <p className="text-lg">No plants in inventory. Add your first plant to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Orders Management
  const renderOrders = () => (
    <div className={`page-content transition-all duration-500 ${pageTransition ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
      <div className="p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 min-h-screen">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-8">
          Plant Orders Management
        </h2>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Order Info</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Items & Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Delivery</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-green-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div>
<p className="font-semibold text-gray-800 text-lg">#{order.orderNumber}</p>                        <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{order.customerName || order.shippingAddress?.fullName || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{order.customerEmail || order.shippingAddress?.email || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{order.customerPhone || order.shippingAddress?.phone || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{order.items?.length || 0} items</p>
                        <p className="text-xl font-bold text-green-600">Rs {order.total.toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer transition-colors duration-200
                          ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold
                        ${order.deliveryType === 'delivery' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {order.deliveryType === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => openOrderModal(order)}
                        className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                <p className="text-lg">No orders received yet. Start by adding plants to your inventory!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Order Details Modal
  const OrderDetailsModal = () => (
    selectedOrder && (
      <div className={`fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 ${modalTransition ? 'opacity-0' : 'opacity-100'}`}>
        <div className={`bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${modalTransition ? 'scale-95 translate-y-4 opacity-0' : 'scale-100 translate-y-0 opacity-100'}`}>
          <div className="flex justify-between items-center mb-6">
<h2 className="text-2xl font-bold text-gray-800">Order Details #{selectedOrder.orderNumber}</h2>
            <button 
              onClick={() => closeOrderModal()}
              className="text-gray-500 hover:text-gray-700 text-3xl font-bold transition-colors duration-200"
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Customer Information:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-gray-700"><span className="font-semibold">City:</span> {selectedOrder.shippingAddress?.city || 'N/A'}</p>
                <p className="text-gray-700"><span className="font-semibold">Delivery Type:</span> {selectedOrder.deliveryType || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Order Items:</h4>
            <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-4">
              <div className="space-y-3">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">{item.plantName || item.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Rs {item.price?.toLocaleString()} each</p>
                      <p className="text-lg font-bold text-green-600">
                        Rs {((item.price || 0) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4 pt-4 border-t-2 border-green-500">
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    Total: Rs {selectedOrder.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Update Order Status:</h4>
            <div className="flex gap-4 items-center">
              <select 
                value={selectedOrder.status}
                onChange={(e) => {
                  updateOrderStatus(selectedOrder._id, e.target.value);
                  setSelectedOrder({...selectedOrder, status: e.target.value});
                }}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg text-base font-semibold min-w-48 focus:border-green-500 focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <span className={`px-4 py-2 rounded-lg text-sm font-bold
                ${selectedOrder.status === 'completed' ? 'bg-green-100 text-green-800' : 
                  selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                Current: {selectedOrder.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={() => closeOrderModal()}
              className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Edit Plant Modal
  const renderEditModal = () => {
    if (!editingPlant) return null;
    
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 ${modalTransition ? 'opacity-0' : 'opacity-100'}`}>
        <div className={`bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[80vh] overflow-y-auto transform transition-all duration-300 ${modalTransition ? 'scale-95 translate-y-4 opacity-0' : 'scale-100 translate-y-0 opacity-100'}`}>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit Plant</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdatePlant(editingPlant._id, editingPlant);
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Name:</label>
                <input 
                  type="text" 
                  value={editingPlant.name}
                  onChange={(e) => setEditingPlant({...editingPlant, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Price:</label>
                <input 
                  type="number" 
                  value={editingPlant.price}
                  onChange={(e) => setEditingPlant({...editingPlant, price: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Stock:</label>
                <input 
                  type="number" 
                  value={editingPlant.stock}
                  onChange={(e) => setEditingPlant({...editingPlant, stock: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Discount (%):</label>
                <input 
                  type="number" 
                  value={editingPlant.discount || 0}
                  onChange={(e) => setEditingPlant({...editingPlant, discount: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button 
                type="button" 
                onClick={() => closeEditModal()} 
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Update Plant
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <WithPageLoader>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-green-50">
        <div className="w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl border-r border-slate-700">
          <div className="p-6">
            <h2 className="text-2xl font-bold border-b-2 border-emerald-500 pb-4 mb-6 text-emerald-400">
              Plant Management Hub
            </h2>
            <nav className="space-y-3">
              {[
                { key: 'dashboard', icon: <FcStatistics />, label: ' Dashboard' },
  { key: 'plants', icon: <FcDepartment />, label: 'Plant Inventory' },
  { key: 'orders', icon: <FcShop />, label: 'Plant Orders' },
  { key: 'shop-orders', icon: <FcTodoList />, label: 'Shop Orders' },
              ].map(item => (
                <div
                  key={item.key}
                  onClick={() => navigateToTab(item.key)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl cursor-pointer transition-all duration-300
                    ${activeTab === item.key 
                      ? 'bg-emerald-700 text-white' 
                      : 'hover:bg-emerald-700 hover:text-white'}`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-semibold text-base">{item.label}</span>
                </div>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'plants' && renderPlants()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'shop-orders' && <ShopOrdersManagement />}
        </div>

        <AddPlantModal 
          showAddPlant={showAddPlant}
          setShowAddPlant={setShowAddPlant}
          onPlantAdded={fetchPlants}
        />
        {renderEditModal()}
        <OrderDetailsModal />
        <Notification />
      </div>
    </WithPageLoader>
  );
};

export default NurseryDashboard;
