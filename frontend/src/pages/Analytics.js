import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [productionEfficiency, setProductionEfficiency] = useState(null);
  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      const [analyticsRes, efficiencyRes, ordersRes, materialsRes] = await Promise.all([
        axios.get(`${API}/analytics/dashboard`),
        axios.get(`${API}/analytics/production-efficiency`),
        axios.get(`${API}/orders`),
        axios.get(`${API}/materials`)
      ]);

      setAnalytics(analyticsRes.data);
      setProductionEfficiency(efficiencyRes.data);
      setOrders(ordersRes.data);
      setMaterials(materialsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const calculateInventoryValue = () => {
    return materials.reduce((total, mat) => total + (mat.quantity * mat.unit_price), 0).toFixed(2);
  };

  const getOrdersByStatus = () => {
    const statusCounts = {
      pending: 0,
      in_production: 0,
      quality_check: 0,
      completed: 0,
      shipped: 0
    };
    
    orders.forEach(order => {
      if (statusCounts.hasOwnProperty(order.status)) {
        statusCounts[order.status]++;
      }
    });
    
    return statusCounts;
  };

  const getLowStockMaterials = () => {
    return materials.filter(mat => mat.quantity <= mat.reorder_level);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading analytics...</p></div>;
  }

  const ordersByStatus = getOrdersByStatus();
  const lowStockItems = getLowStockMaterials();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Analytics & Reports</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
          <h3 className="text-sm font-medium mb-2 opacity-90">Total Orders</h3>
          <p className="text-4xl font-bold mb-2">{analytics?.orders?.total || 0}</p>
          <p className="text-sm opacity-90">
            {analytics?.orders?.completed || 0} completed | {analytics?.orders?.active || 0} active
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
          <h3 className="text-sm font-medium mb-2 opacity-90">Inventory Value</h3>
          <p className="text-4xl font-bold mb-2">${calculateInventoryValue()}</p>
          <p className="text-sm opacity-90">{materials.length} materials tracked</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
          <h3 className="text-sm font-medium mb-2 opacity-90">QC Pass Rate</h3>
          <p className="text-4xl font-bold mb-2">{analytics?.quality?.pass_rate || 0}%</p>
          <p className="text-sm opacity-90">{analytics?.quality?.total_checks || 0} inspections</p>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Status Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">{ordersByStatus.pending}</p>
            <p className="text-sm text-gray-600 mt-1">Pending</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{ordersByStatus.in_production}</p>
            <p className="text-sm text-gray-600 mt-1">In Production</p>
          </div>
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <p className="text-3xl font-bold text-indigo-600">{ordersByStatus.quality_check}</p>
            <p className="text-sm text-gray-600 mt-1">Quality Check</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{ordersByStatus.completed}</p>
            <p className="text-sm text-gray-600 mt-1">Completed</p>
          </div>
          <div className="text-center p-4 bg-teal-50 rounded-lg">
            <p className="text-3xl font-bold text-teal-600">{ordersByStatus.shipped}</p>
            <p className="text-sm text-gray-600 mt-1">Shipped</p>
          </div>
        </div>
      </div>

      {/* Production Efficiency */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Production Stage Completion</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 border-2 border-gray-200 rounded-lg">
            <p className="text-2xl mb-1">✂️</p>
            <p className="text-2xl font-bold text-gray-800">{productionEfficiency?.stage_completion?.cutting || 0}</p>
            <p className="text-xs text-gray-600 mt-1">Cutting</p>
          </div>
          <div className="text-center p-4 border-2 border-gray-200 rounded-lg">
            <p className="text-2xl mb-1">🧵</p>
            <p className="text-2xl font-bold text-gray-800">{productionEfficiency?.stage_completion?.stitching || 0}</p>
            <p className="text-xs text-gray-600 mt-1">Stitching</p>
          </div>
          <div className="text-center p-4 border-2 border-gray-200 rounded-lg">
            <p className="text-2xl mb-1">✨</p>
            <p className="text-2xl font-bold text-gray-800">{productionEfficiency?.stage_completion?.finishing || 0}</p>
            <p className="text-xs text-gray-600 mt-1">Finishing</p>
          </div>
          <div className="text-center p-4 border-2 border-gray-200 rounded-lg">
            <p className="text-2xl mb-1">✅</p>
            <p className="text-2xl font-bold text-gray-800">{productionEfficiency?.stage_completion?.quality_check || 0}</p>
            <p className="text-xs text-gray-600 mt-1">QC</p>
          </div>
          <div className="text-center p-4 border-2 border-gray-200 rounded-lg">
            <p className="text-2xl mb-1">📦</p>
            <p className="text-2xl font-bold text-gray-800">{productionEfficiency?.stage_completion?.packaging || 0}</p>
            <p className="text-xs text-gray-600 mt-1">Packaging</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-4 text-center">
          Total Completed Stages: <strong>{productionEfficiency?.total_completed_stages || 0}</strong>
        </p>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">⚠️</span> Low Stock Materials
          </h2>
          <div className="space-y-3">
            {lowStockItems.map(material => (
              <div key={material.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div>
                  <p className="font-medium text-gray-800">{material.name}</p>
                  <p className="text-sm text-gray-600">{material.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{material.quantity} {material.unit}</p>
                  <p className="text-xs text-gray-600">Reorder at: {material.reorder_level}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-xs uppercase tracking-wider text-left">Customer</th>
                <th className="px-4 py-2 text-xs uppercase tracking-wider text-left">Style</th>
                <th className="px-4 py-2 text-xs uppercase tracking-wider text-left">Quantity</th>
                <th className="px-4 py-2 text-xs uppercase tracking-wider text-left">Status</th>
                <th className="px-4 py-2 text-xs uppercase tracking-wider text-left">Delivery</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map(order => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-3 text-sm">{order.customer_name}</td>
                  <td className="px-4 py-3 text-sm">{order.style_number}</td>
                  <td className="px-4 py-3 text-sm">{order.total_quantity} pcs</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`badge badge-${order.status === 'completed' ? 'completed' : order.status === 'pending' ? 'pending' : 'in-progress'}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{order.delivery_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="text-center py-8 text-gray-500">No orders to display</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
