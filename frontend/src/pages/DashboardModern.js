import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardModern = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white px-8 py-8 mb-8 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-bold mb-2">Factory Dashboard</h1>
        <p className="text-purple-100">Real-time overview of your operations</p>
      </div>
      
      {/* Stats Grid with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Orders Card */}
        <div className="bg-white/40 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl">
              <span className="text-3xl">📦</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 font-medium">Total Orders</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {stats?.orders?.total || 0}
              </p>
            </div>
          </div>
          <div className="flex justify-between text-xs mt-4 pt-4 border-t border-gray-200">
            <span className="text-green-600 font-semibold">✓ {stats?.orders?.completed || 0} Done</span>
            <span className="text-blue-600 font-semibold">⚡ {stats?.orders?.active || 0} Active</span>
          </div>
        </div>

        {/* Workers Card */}
        <div className="bg-white/40 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl">
              <span className="text-3xl">👥</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 font-medium">Active Team</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                {stats?.workers?.total || 0}
              </p>
            </div>
          </div>
          <div className="text-xs mt-4 pt-4 border-t border-gray-200">
            <span className="text-gray-600 font-semibold">Total employees working</span>
          </div>
        </div>

        {/* Materials Card */}
        <div className="bg-white/40 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-4 rounded-2xl">
              <span className="text-3xl">📋</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 font-medium">Materials</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {stats?.materials?.total || 0}
              </p>
            </div>
          </div>
          <div className="text-xs mt-4 pt-4 border-t border-gray-200">
            {stats?.materials?.low_stock > 0 ? (
              <span className="text-red-600 font-semibold">⚠️ {stats.materials.low_stock} Low Stock!</span>
            ) : (
              <span className="text-green-600 font-semibold">✓ All stock levels good</span>
            )}
          </div>
        </div>

        {/* Quality Card */}
        <div className="bg-white/40 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-2xl">
              <span className="text-3xl">✅</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 font-medium">Quality Score</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {stats?.quality?.pass_rate || 0}%
              </p>
            </div>
          </div>
          <div className="text-xs mt-4 pt-4 border-t border-gray-200">
            <span className="text-gray-600 font-semibold">{stats?.quality?.total_checks || 0} total checks</span>
          </div>
        </div>
      </div>

      {/* Quick Actions with Gradient Buttons */}
      <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-xl p-8 mb-8 border border-white/50">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-6 rounded-2xl transition-all transform hover:scale-105 shadow-lg">
            <span className="text-2xl mb-2 block">📦</span>
            <span className="text-sm font-semibold">New Order</span>
          </button>
          <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 rounded-2xl transition-all transform hover:scale-105 shadow-lg">
            <span className="text-2xl mb-2 block">⚙️</span>
            <span className="text-sm font-semibold">Production</span>
          </button>
          <button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white py-4 px-6 rounded-2xl transition-all transform hover:scale-105 shadow-lg">
            <span className="text-2xl mb-2 block">📋</span>
            <span className="text-sm font-semibold">Add Material</span>
          </button>
          <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-4 px-6 rounded-2xl transition-all transform hover:scale-105 shadow-lg">
            <span className="text-2xl mb-2 block">📝</span>
            <span className="text-sm font-semibold">Create Task</span>
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/50">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Alerts & Notifications</h2>
        <div className="space-y-4">
          {stats?.materials?.low_stock > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-5 rounded-xl">
              <p className="text-red-800 font-bold flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                Low Stock Alert
              </p>
              <p className="text-red-600 text-sm mt-2 ml-10">{stats.materials.low_stock} materials need reordering</p>
            </div>
          )}
          {stats?.tasks?.pending > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 p-5 rounded-xl">
              <p className="text-yellow-800 font-bold flex items-center">
                <span className="text-2xl mr-3">📝</span>
                Pending Tasks
              </p>
              <p className="text-yellow-600 text-sm mt-2 ml-10">{stats.tasks.pending} tasks awaiting action</p>
            </div>
          )}
          {stats?.orders?.active > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-5 rounded-xl">
              <p className="text-blue-800 font-bold flex items-center">
                <span className="text-2xl mr-3">🚀</span>
                Active Production
              </p>
              <p className="text-blue-600 text-sm mt-2 ml-10">{stats.orders.active} orders in production</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardModern;
