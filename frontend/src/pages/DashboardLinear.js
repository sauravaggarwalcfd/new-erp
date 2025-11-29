import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Linear-inspired: Dark, modern, sleek with purple accents
const DashboardLinear = () => {
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
    <div className="bg-[#0d0d0d] min-h-screen text-white">
      {/* Linear-style sleek header */}
      <div className="px-10 pt-10 pb-8 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-1">Dashboard</h1>
            <p className="text-sm text-gray-400">Factory operations overview</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all">
              Filter
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all">
              New Order
            </button>
          </div>
        </div>
      </div>

      <div className="px-10 py-8">
        {/* Linear-style metrics grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Total Orders</span>
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 text-sm">📦</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-3">{stats?.orders?.total || 0}</div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span className="text-gray-400">{stats?.orders?.completed || 0} done</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span className="text-gray-400">{stats?.orders?.active || 0} active</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Active Team</span>
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                <span className="text-green-400 text-sm">👥</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-3">{stats?.workers?.total || 0}</div>
            <div className="text-xs text-gray-400">Total employees working</div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Materials</span>
              <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <span className="text-yellow-400 text-sm">📋</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-3">{stats?.materials?.total || 0}</div>
            <div className="text-xs">
              {stats?.materials?.low_stock > 0 ? (
                <span className="text-red-400">{stats.materials.low_stock} low stock items</span>
              ) : (
                <span className="text-green-400">All levels optimal</span>
              )}
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Quality Score</span>
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <span className="text-purple-400 text-sm">✓</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-3">{stats?.quality?.pass_rate || 0}%</div>
            <div className="text-xs text-gray-400">{stats?.quality?.total_checks || 0} total inspections</div>
          </div>
        </div>

        {/* Linear-style action buttons */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <button className="group bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 hover:border-purple-500/50 rounded-xl p-4 transition-all">
              <div className="text-2xl mb-3">📦</div>
              <div className="text-sm font-medium text-gray-300 group-hover:text-white">New Order</div>
              <div className="text-xs text-gray-500 mt-1">Create customer order</div>
            </button>
            <button className="group bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 hover:border-purple-500/50 rounded-xl p-4 transition-all">
              <div className="text-2xl mb-3">⚙️</div>
              <div className="text-sm font-medium text-gray-300 group-hover:text-white">Production</div>
              <div className="text-xs text-gray-500 mt-1">Start production stage</div>
            </button>
            <button className="group bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 hover:border-purple-500/50 rounded-xl p-4 transition-all">
              <div className="text-2xl mb-3">📋</div>
              <div className="text-sm font-medium text-gray-300 group-hover:text-white">Inventory</div>
              <div className="text-xs text-gray-500 mt-1">Add materials</div>
            </button>
            <button className="group bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 hover:border-purple-500/50 rounded-xl p-4 transition-all">
              <div className="text-2xl mb-3">✓</div>
              <div className="text-sm font-medium text-gray-300 group-hover:text-white">Quality</div>
              <div className="text-xs text-gray-500 mt-1">Run inspection</div>
            </button>
          </div>
        </div>

        {/* Linear-style alerts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">System Status</h2>
          </div>
          <div className="space-y-2">
            {stats?.materials?.low_stock > 0 && (
              <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <span className="text-red-400">⚠️</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Low Stock Alert</div>
                    <div className="text-xs text-gray-400 mt-0.5">{stats.materials.low_stock} materials require reordering</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-red-500/10 text-red-400 text-xs font-medium rounded-full">Critical</div>
              </div>
            )}

            {stats?.tasks?.pending > 0 && (
              <div className="flex items-center justify-between p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl hover:bg-purple-500/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <span className="text-purple-400">📝</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Pending Tasks</div>
                    <div className="text-xs text-gray-400 mt-0.5">{stats.tasks.pending} tasks need attention</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-full">Action Required</div>
              </div>
            )}

            {stats?.orders?.active > 0 && (
              <div className="flex items-center justify-between p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl hover:bg-blue-500/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400">🚀</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Active Production</div>
                    <div className="text-xs text-gray-400 mt-0.5">{stats.orders.active} orders in progress</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full">In Progress</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLinear;