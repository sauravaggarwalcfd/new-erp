import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Notion-inspired: Clean, minimal, with subtle shadows and excellent typography
const DashboardNotion = () => {
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
    <div className="bg-white min-h-screen">
      {/* Notion-style minimal header */}
      <div className="px-12 pt-12 pb-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system'}}>Factory Dashboard</h1>
        <p className="text-base text-gray-500">Monday, February 2025</p>
      </div>

      <div className="px-12 py-8">
        {/* Stats in clean card grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all cursor-pointer border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">📦</div>
              <span className="text-sm font-medium text-gray-600">Orders</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats?.orders?.total || 0}</div>
            <div className="text-sm text-gray-500">
              <span className="text-green-600">{stats?.orders?.completed || 0} completed</span>
              <span className="mx-2">•</span>
              <span className="text-blue-600">{stats?.orders?.active || 0} active</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all cursor-pointer border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">👥</div>
              <span className="text-sm font-medium text-gray-600">Team</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats?.workers?.total || 0}</div>
            <div className="text-sm text-gray-500">Active employees</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all cursor-pointer border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-xl">📋</div>
              <span className="text-sm font-medium text-gray-600">Materials</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats?.materials?.total || 0}</div>
            <div className="text-sm text-gray-500">
              {stats?.materials?.low_stock > 0 ? (
                <span className="text-red-600">{stats.materials.low_stock} low stock</span>
              ) : (
                <span className="text-green-600">All stocked</span>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all cursor-pointer border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-xl">✓</div>
              <span className="text-sm font-medium text-gray-600">Quality</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats?.quality?.pass_rate || 0}%</div>
            <div className="text-sm text-gray-500">{stats?.quality?.total_checks || 0} inspections</div>
          </div>
        </div>

        {/* Quick Actions - Notion style */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            <button className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all">
              <span className="text-xl">📦</span>
              <span className="text-sm font-medium text-gray-700">New Order</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all">
              <span className="text-xl">⚙️</span>
              <span className="text-sm font-medium text-gray-700">Start Production</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all">
              <span className="text-xl">📋</span>
              <span className="text-sm font-medium text-gray-700">Add Material</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all">
              <span className="text-xl">✓</span>
              <span className="text-sm font-medium text-gray-700">Quality Check</span>
            </button>
          </div>
        </div>

        {/* Alerts - Notion callout style */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Alerts</h2>
          
          {stats?.materials?.low_stock > 0 && (
            <div className="flex gap-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">Low Stock Alert</div>
                <div className="text-sm text-gray-600">{stats.materials.low_stock} materials need immediate reordering</div>
              </div>
            </div>
          )}

          {stats?.tasks?.pending > 0 && (
            <div className="flex gap-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
              <div className="text-2xl">📝</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">Pending Tasks</div>
                <div className="text-sm text-gray-600">{stats.tasks.pending} tasks awaiting your attention</div>
              </div>
            </div>
          )}

          {stats?.orders?.active > 0 && (
            <div className="flex gap-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
              <div className="text-2xl">🚀</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">Production Active</div>
                <div className="text-sm text-gray-600">{stats.orders.active} orders currently in production</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardNotion;