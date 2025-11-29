import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    style_number: '',
    garment_type: '',
    color: '',
    sizes: [{ size: 'S', quantity: 0 }],
    total_quantity: 0,
    delivery_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/orders`, formData);
      setShowForm(false);
      setFormData({
        customer_name: '',
        style_number: '',
        garment_type: '',
        color: '',
        sizes: [{ size: 'S', quantity: 0 }],
        total_quantity: 0,
        delivery_date: '',
        notes: ''
      });
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`${API}/orders/${id}`);
        fetchOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(`${API}/orders/${id}?status=${status}`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const addSizeRow = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { size: '', quantity: 0 }]
    });
  };

  const updateSize = (index, field, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index][field] = value;
    const total = newSizes.reduce((sum, s) => sum + (parseInt(s.quantity) || 0), 0);
    setFormData({ ...formData, sizes: newSizes, total_quantity: total });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge badge-pending',
      in_production: 'badge badge-in-progress',
      quality_check: 'badge badge-in-progress',
      completed: 'badge badge-completed',
      shipped: 'badge badge-completed'
    };
    return badges[status] || 'badge';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          data-testid="create-order-button"
        >
          {showForm ? 'Cancel' : '+ New Order'}
        </button>
      </div>

      {/* Create Order Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6" data-testid="order-form">
          <h2 className="text-xl font-semibold mb-4">Create New Order</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  data-testid="order-customer-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Style Number</label>
                <input
                  type="text"
                  required
                  value={formData.style_number}
                  onChange={(e) => setFormData({ ...formData, style_number: e.target.value })}
                  data-testid="order-style-number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Garment Type</label>
                <select
                  required
                  value={formData.garment_type}
                  onChange={(e) => setFormData({ ...formData, garment_type: e.target.value })}
                  data-testid="order-garment-type"
                >
                  <option value="">Select Type</option>
                  <option value="T-Shirt">T-Shirt</option>
                  <option value="Shirt">Shirt</option>
                  <option value="Jeans">Jeans</option>
                  <option value="Dress">Dress</option>
                  <option value="Jacket">Jacket</option>
                  <option value="Trouser">Trouser</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="text"
                  required
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  data-testid="order-color"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                <input
                  type="date"
                  required
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                  data-testid="order-delivery-date"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Size & Quantity</label>
              {formData.sizes.map((size, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Size (S/M/L/XL)"
                    value={size.size}
                    onChange={(e) => updateSize(index, 'size', e.target.value)}
                    className="w-1/3"
                    data-testid={`order-size-${index}`}
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={size.quantity}
                    onChange={(e) => updateSize(index, 'quantity', e.target.value)}
                    className="w-2/3"
                    data-testid={`order-quantity-${index}`}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addSizeRow}
                className="text-blue-600 text-sm hover:underline"
                data-testid="add-size-button"
              >
                + Add Size
              </button>
              <p className="text-sm text-gray-600 mt-2">Total Quantity: {formData.total_quantity}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                rows="3"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                data-testid="order-notes"
              />
            </div>

            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
              data-testid="submit-order-button"
            >
              Create Order
            </button>
          </form>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Style</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Garment</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Delivery</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t" data-testid={`order-row-${order.id}`}>
                <td className="px-6 py-4 text-sm">{order.id.substring(0, 8)}</td>
                <td className="px-6 py-4 text-sm">{order.customer_name}</td>
                <td className="px-6 py-4 text-sm">{order.style_number}</td>
                <td className="px-6 py-4 text-sm">{order.garment_type}</td>
                <td className="px-6 py-4 text-sm">{order.total_quantity}</td>
                <td className="px-6 py-4 text-sm">{order.delivery_date}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={getStatusBadge(order.status)}>{order.status.replace('_', ' ')}</span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <select
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    value={order.status}
                    className="text-xs border rounded px-2 py-1"
                    data-testid={`order-status-select-${order.id}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_production">In Production</option>
                    <option value="quality_check">Quality Check</option>
                    <option value="completed">Completed</option>
                    <option value="shipped">Shipped</option>
                  </select>
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="ml-2 text-red-600 hover:text-red-800"
                    data-testid={`delete-order-${order.id}`}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500" data-testid="no-orders-message">
            No orders found. Create your first order!
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;