import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardMinimal = () => {
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
    <div className="bg-gray-50 min-h-screen">
      {/* Minimal Header */}
      <div className="border-b border-gray-200 bg-white px-8 py-6 mb-8">
        <h1 className="text-3xl font-light text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of factory operations</p>
      </div>
      
      {/* Minimal Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-gray-200 mb-px">
        {/* Orders Card */}
        <div className="bg-white p-8 hover:bg-gray-50 transition-colors">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">Total Orders</p>
          <p className="text-5xl font-light text-gray-900 mb-4">{stats?.orders?.total || 0}</p>
          <div className="flex gap-4 text-xs">
            <span className="text-green-600">{stats?.orders?.completed || 0} Completed</span>
            <span className="text-blue-600">{stats?.orders?.active || 0} Active</span>
          </div>
        </div>

        {/* Workers Card */}
        <div className="bg-white p-8 hover:bg-gray-50 transition-colors">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">Active Workers</p>
          <p className="text-5xl font-light text-gray-900 mb-4">{stats?.workers?.total || 0}</p>
          <p className="text-xs text-gray-500">Total employees</p>
        </div>

        {/* Materials Card */}
        <div className="bg-white p-8 hover:bg-gray-50 transition-colors">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">Materials</p>
          <p className="text-5xl font-light text-gray-900 mb-4">{stats?.materials?.total || 0}</p>
          <p className="text-xs text-red-600">{stats?.materials?.low_stock || 0} Low Stock</p>
        </div>

        {/* Quality Card */}
        <div className="bg-white p-8 hover:bg-gray-50 transition-colors">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">QC Pass Rate</p>
          <p className="text-5xl font-light text-gray-900 mb-4">{stats?.quality?.pass_rate || 0}%</p>
          <p className="text-xs text-gray-500">{stats?.quality?.total_checks || 0} Checks</p>
        </div>
      </div>

      {/* Quick Actions - Minimal Style */}
      <div className="bg-white border-t border-b border-gray-200 px-8 py-8 mb-8">
        <h2 className="text-sm uppercase tracking-wider text-gray-500 font-medium mb-6">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-4">
          <button className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-700 py-6 px-4 transition-all">
            <span className="block text-2xl mb-2">📦</span>
            <span className="text-sm font-medium">New Order</span>
          </button>
          <button className="border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 text-gray-700 hover:text-green-700 py-6 px-4 transition-all">
            <span className="block text-2xl mb-2">⚙️</span>
            <span className="text-sm font-medium">Production</span>
          </button>
          <button className="border-2 border-gray-300 hover:border-yellow-500 hover:bg-yellow-50 text-gray-700 hover:text-yellow-700 py-6 px-4 transition-all">
            <span className="block text-2xl mb-2">📋</span>
            <span className="text-sm font-medium">Add Material</span>
          </button>
          <button className="border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 text-gray-700 hover:text-purple-700 py-6 px-4 transition-all">
            <span className="block text-2xl mb-2">📝</span>
            <span className="text-sm font-medium">Create Task</span>
          </button>
        </div>
      </div>

      {/* Alerts - Minimal List Style */}
      <div className="bg-white px-8 py-8">
        <h2 className="text-sm uppercase tracking-wider text-gray-500 font-medium mb-6">System Alerts</h2>
        <div className="space-y-px bg-gray-100">
          {stats?.materials?.low_stock > 0 && (
            <div className="bg-white px-6 py-4 flex items-center justify-between hover:bg-red-50 transition-colors">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-4"></span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Low Stock Materials</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.materials.low_stock} items need reordering</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">Critical</span>
            </div>
          )}
          {stats?.tasks?.pending > 0 && (
            <div className="bg-white px-6 py-4 flex items-center justify-between hover:bg-yellow-50 transition-colors">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-4"></span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Pending Tasks</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.tasks.pending} tasks require attention</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">Warning</span>
            </div>
          )}
          {stats?.orders?.active > 0 && (
            <div className="bg-white px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition-colors">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-4"></span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Active Production</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.orders.active} orders in progress</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">Info</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardMinimal;