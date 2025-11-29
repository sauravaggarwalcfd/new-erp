import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Apple-inspired: Premium, refined, spacious design
const DashboardApple = () => {
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
    <div className="bg-[#f5f5f7] min-h-screen" style={{fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'}}>
      {/* Apple-style compact header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
            <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-all shadow-sm">
              Create Order
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Apple-style compact cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-xs font-medium text-gray-600 mb-1">Orders</p>
            <p className="text-3xl font-semibold text-gray-900 mb-2" style={{letterSpacing: '-0.02em'}}>{stats?.orders?.total || 0}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">{stats?.orders?.completed || 0} done</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">{stats?.orders?.active || 0} active</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-gray-600 mb-1">Team</p>
            <p className="text-3xl font-semibold text-gray-900 mb-2" style={{letterSpacing: '-0.02em'}}>{stats?.workers?.total || 0}</p>
            <p className="text-xs text-gray-500">Active employees</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-xs font-medium text-gray-600 mb-1">Materials</p>
            <p className="text-3xl font-semibold text-gray-900 mb-2" style={{letterSpacing: '-0.02em'}}>{stats?.materials?.total || 0}</p>
            {stats?.materials?.low_stock > 0 ? (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium text-xs">{stats.materials.low_stock} low stock</span>
            ) : (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium text-xs">All stocked</span>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-gray-600 mb-1">Quality</p>
            <p className="text-3xl font-semibold text-gray-900 mb-2" style={{letterSpacing: '-0.02em'}}>{stats?.quality?.pass_rate || 0}%</p>
            <p className="text-xs text-gray-500">{stats?.quality?.total_checks || 0} checks</p>
          </div>
        </div>

        {/* Apple-style compact action cards */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            <button className="group p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all">
              <div className="text-2xl mb-2">📦</div>
              <div className="text-sm font-semibold text-gray-900">New Order</div>
              <div className="text-xs text-gray-600 mt-0.5">Create order</div>
            </button>
            <button className="group p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all">
              <div className="text-2xl mb-2">⚙️</div>
              <div className="text-sm font-semibold text-gray-900">Production</div>
              <div className="text-xs text-gray-600 mt-0.5">Start stage</div>
            </button>
            <button className="group p-4 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition-all">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm font-semibold text-gray-900">Inventory</div>
              <div className="text-xs text-gray-600 mt-0.5">Add materials</div>
            </button>
            <button className="group p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all">
              <div className="text-2xl mb-2">✓</div>
              <div className="text-sm font-semibold text-gray-900">Quality</div>
              <div className="text-xs text-gray-600 mt-0.5">Inspection</div>
            </button>
          </div>
        </div>

        {/* Apple-style compact alerts */}
        {(stats?.materials?.low_stock > 0 || stats?.tasks?.pending > 0 || stats?.orders?.active > 0) && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
            <div className="space-y-3">
              {stats?.materials?.low_stock > 0 && (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">⚠️</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm mb-0.5">Low Stock Alert</div>
                    <div className="text-xs text-gray-600">{stats.materials.low_stock} materials require immediate attention</div>
                  </div>
                  <button className="px-3 py-1.5 bg-red-600 text-white rounded-full text-xs font-medium hover:bg-red-700 transition-all">Review</button>
                </div>
              )}

              {stats?.tasks?.pending > 0 && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📝</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm mb-0.5">Pending Tasks</div>
                    <div className="text-xs text-gray-600">{stats.tasks.pending} tasks awaiting completion</div>
                  </div>
                  <button className="px-3 py-1.5 bg-blue-600 text-white rounded-full text-xs font-medium hover:bg-blue-700 transition-all">View</button>
                </div>
              )}

              {stats?.orders?.active > 0 && (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🚀</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm mb-0.5">Production Active</div>
                    <div className="text-xs text-gray-600">{stats.orders.active} orders currently in progress</div>
                  </div>
                  <button className="px-3 py-1.5 bg-green-600 text-white rounded-full text-xs font-medium hover:bg-green-700 transition-all">Monitor</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardApple;