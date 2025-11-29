import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API}/analytics/dashboard`);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Orders Card */}
        <div className="bg-white rounded-lg shadow p-6 card-hover" data-testid="orders-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-3xl font-bold text-gray-800" data-testid="total-orders">{stats?.orders?.total || 0}</p>
          <p className="text-sm text-green-600 mt-2">
            {stats?.orders?.active || 0} Active | {stats?.orders?.completed || 0} Completed
          </p>
        </div>

        {/* Workers Card */}
        <div className="bg-white rounded-lg shadow p-6 card-hover" data-testid="workers-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Active Workers</h3>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-gray-800" data-testid="total-workers">{stats?.workers?.total || 0}</p>
          <p className="text-sm text-gray-600 mt-2">Total employees</p>
        </div>

        {/* Materials Card */}
        <div className="bg-white rounded-lg shadow p-6 card-hover" data-testid="materials-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Materials</h3>
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-3xl font-bold text-gray-800" data-testid="total-materials">{stats?.materials?.total || 0}</p>
          <p className="text-sm text-red-600 mt-2" data-testid="low-stock-materials">
            {stats?.materials?.low_stock || 0} Low Stock Alerts
          </p>
        </div>

        {/* Quality Card */}
        <div className="bg-white rounded-lg shadow p-6 card-hover" data-testid="quality-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">QC Pass Rate</h3>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-3xl font-bold text-gray-800" data-testid="qc-pass-rate">{stats?.quality?.pass_rate || 0}%</p>
          <p className="text-sm text-gray-600 mt-2">
            {stats?.quality?.total_checks || 0} Total Checks
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/orders'}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition"
            data-testid="quick-action-new-order"
          >
            📦 New Order
          </button>
          <button 
            onClick={() => window.location.href = '/production'}
            className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition"
            data-testid="quick-action-production"
          >
            ⚙️ Start Production
          </button>
          <button 
            onClick={() => window.location.href = '/inventory'}
            className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg transition"
            data-testid="quick-action-add-material"
          >
            📋 Add Material
          </button>
          <button 
            onClick={() => window.location.href = '/tasks'}
            className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition"
            data-testid="quick-action-create-task"
          >
            📝 Create Task
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Alerts & Notifications</h2>
        <div className="space-y-3">
          {stats?.materials?.low_stock > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4" data-testid="alert-low-stock">
              <p className="text-red-800 font-medium">⚠️ Low Stock Alert</p>
              <p className="text-red-600 text-sm mt-1">{stats.materials.low_stock} materials need reordering</p>
            </div>
          )}
          {stats?.tasks?.pending > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4" data-testid="alert-pending-tasks">
              <p className="text-yellow-800 font-medium">📝 Pending Tasks</p>
              <p className="text-yellow-600 text-sm mt-1">{stats.tasks.pending} tasks awaiting action</p>
            </div>
          )}
          {stats?.orders?.active > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4" data-testid="alert-active-orders">
              <p className="text-blue-800 font-medium">🚀 Active Production</p>
              <p className="text-blue-600 text-sm mt-1">{stats.orders.active} orders in production</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;