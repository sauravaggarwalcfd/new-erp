import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardDark = () => {
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
    return <div className="flex items-center justify-center h-64"><p className="text-gray-400">Loading...</p></div>;
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Dark Mode Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 px-8 py-8 mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Factory Dashboard</h1>
        <p className="text-gray-400">Real-time production monitoring</p>
      </div>
      
      {/* Dark Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Orders Card */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <span className="text-2xl">📦</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-2">Total Orders</p>
          <p className="text-4xl font-bold text-white mb-3">{stats?.orders?.total || 0}</p>
          <div className="flex justify-between text-xs pt-3 border-t border-gray-700">
            <span className="text-green-400">✓ {stats?.orders?.completed || 0} Done</span>
            <span className="text-blue-400">⚡ {stats?.orders?.active || 0} Active</span>
          </div>
        </div>

        {/* Workers Card */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700 hover:border-green-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500/20 p-3 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-2">Active Workers</p>
          <p className="text-4xl font-bold text-white mb-3">{stats?.workers?.total || 0}</p>
          <div className="text-xs pt-3 border-t border-gray-700">
            <span className="text-gray-400">Total employees working</span>
          </div>
        </div>

        {/* Materials Card */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700 hover:border-yellow-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-2">Materials</p>
          <p className="text-4xl font-bold text-white mb-3">{stats?.materials?.total || 0}</p>
          <div className="text-xs pt-3 border-t border-gray-700">
            {stats?.materials?.low_stock > 0 ? (
              <span className="text-red-400">⚠️ {stats.materials.low_stock} Low Stock</span>
            ) : (
              <span className="text-green-400">✓ All levels good</span>
            )}
          </div>
        </div>

        {/* Quality Card */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700 hover:border-purple-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-2">QC Pass Rate</p>
          <p className="text-4xl font-bold text-white mb-3">{stats?.quality?.pass_rate || 0}%</p>
          <div className="text-xs pt-3 border-t border-gray-700">
            <span className="text-gray-400">{stats?.quality?.total_checks || 0} inspections</span>
          </div>
        </div>
      </div>

      {/* Dark Quick Actions */}
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 mb-8 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl transition-all transform hover:scale-105">
            <span className="text-2xl mb-2 block">📦</span>
            <span className="text-sm font-semibold">New Order</span>
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl transition-all transform hover:scale-105">
            <span className="text-2xl mb-2 block">⚙️</span>
            <span className="text-sm font-semibold">Production</span>
          </button>
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white py-4 px-6 rounded-xl transition-all transform hover:scale-105">
            <span className="text-2xl mb-2 block">📋</span>
            <span className="text-sm font-semibold">Add Material</span>
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-xl transition-all transform hover:scale-105">
            <span className="text-2xl mb-2 block">📝</span>
            <span className="text-sm font-semibold">Create Task</span>
          </button>
        </div>
      </div>

      {/* Dark Alerts */}
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">Alerts & Notifications</h2>
        <div className="space-y-4">
          {stats?.materials?.low_stock > 0 && (
            <div className="bg-red-900/30 border-l-4 border-red-500 p-5 rounded-lg">
              <p className="text-red-400 font-bold flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                Low Stock Alert
              </p>
              <p className="text-red-300 text-sm mt-2 ml-10">{stats.materials.low_stock} materials need reordering</p>
            </div>
          )}
          {stats?.tasks?.pending > 0 && (
            <div className="bg-yellow-900/30 border-l-4 border-yellow-500 p-5 rounded-lg">
              <p className="text-yellow-400 font-bold flex items-center">
                <span className="text-2xl mr-3">📝</span>
                Pending Tasks
              </p>
              <p className="text-yellow-300 text-sm mt-2 ml-10">{stats.tasks.pending} tasks awaiting action</p>
            </div>
          )}
          {stats?.orders?.active > 0 && (
            <div className="bg-blue-900/30 border-l-4 border-blue-500 p-5 rounded-lg">
              <p className="text-blue-400 font-bold flex items-center">
                <span className="text-2xl mr-3">🚀</span>
                Active Production
              </p>
              <p className="text-blue-300 text-sm mt-2 ml-10">{stats.orders.active} orders in production</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardDark;