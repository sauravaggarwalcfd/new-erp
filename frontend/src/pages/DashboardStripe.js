import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Stripe-inspired: Professional, elegant blue-gray theme
const DashboardStripe = () => {
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
    <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen">
      {/* Stripe-style elegant header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor your factory operations</p>
            </div>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm">
                Export
              </button>
              <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium text-sm shadow-sm">
                New Order
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stripe-style metric cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-gray-900">{stats?.orders?.total || 0}</span>
                  <span className="text-sm text-green-600 font-medium">+12%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                <span className="text-green-600 font-medium">{stats?.orders?.completed || 0}</span> completed
              </div>
              <div className="text-xs text-gray-500">
                <span className="text-blue-600 font-medium">{stats?.orders?.active || 0}</span> active
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Team Members</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-gray-900">{stats?.workers?.total || 0}</span>
                  <span className="text-sm text-gray-500">active</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">All departments operational</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Materials</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-gray-900">{stats?.materials?.total || 0}</span>
                  {stats?.materials?.low_stock > 0 && (
                    <span className="text-sm text-red-600 font-medium">!</span>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                {stats?.materials?.low_stock > 0 ? (
                  <span className="text-red-600 font-medium">{stats.materials.low_stock} low stock items</span>
                ) : (
                  <span className="text-green-600 font-medium">All stock levels good</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Quality Rate</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-gray-900">{stats?.quality?.pass_rate || 0}%</span>
                  <span className="text-sm text-green-600 font-medium">✓</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">{stats?.quality?.total_checks || 0} inspections completed</div>
            </div>
          </div>
        </div>

        {/* Stripe-style sections */}
        <div className="grid grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 hover:border-indigo-300">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-lg">📦</div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">Create Order</div>
                  <div className="text-xs text-gray-500">New customer order</div>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 hover:border-indigo-300">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-lg">⚙️</div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">Start Production</div>
                  <div className="text-xs text-gray-500">Begin new stage</div>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 hover:border-indigo-300">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-lg">📋</div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">Add Material</div>
                  <div className="text-xs text-gray-500">Update inventory</div>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 hover:border-indigo-300">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-lg">✓</div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">Quality Check</div>
                  <div className="text-xs text-gray-500">Run inspection</div>
                </div>
              </button>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerts</h2>
            <div className="space-y-3">
              {stats?.materials?.low_stock > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 text-sm">⚠️</span>
                    <div>
                      <div className="text-xs font-medium text-red-900">Low Stock</div>
                      <div className="text-xs text-red-700 mt-0.5">{stats.materials.low_stock} items</div>
                    </div>
                  </div>
                </div>
              )}
              {stats?.tasks?.pending > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 text-sm">📝</span>
                    <div>
                      <div className="text-xs font-medium text-blue-900">Pending Tasks</div>
                      <div className="text-xs text-blue-700 mt-0.5">{stats.tasks.pending} tasks</div>
                    </div>
                  </div>
                </div>
              )}
              {stats?.orders?.active > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 text-sm">🚀</span>
                    <div>
                      <div className="text-xs font-medium text-green-900">In Production</div>
                      <div className="text-xs text-green-700 mt-0.5">{stats.orders.active} orders</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStripe;