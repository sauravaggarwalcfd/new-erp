import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const GarmentForge = () => {
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const currentUser = { id: '1202fa63-f5e0-430d-9d17-f59ee91ec49f', name: 'John Smith' };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [statsRes, tasksRes, ordersRes, notificationsRes] = await Promise.all([
        axios.get(`${API}/analytics/dashboard`),
        axios.get(`${API}/tasks`),
        axios.get(`${API}/orders`),
        axios.get(`${API}/notifications?user_id=${currentUser.id}`)
      ]);

      setStats(statsRes.data);
      setRecentTasks(tasksRes.data.slice(0, 5));
      setRecentOrders(ordersRes.data.slice(0, 5));
      setNotifications(notificationsRes.data.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🏭</div>
          <p className="text-xl font-medium text-gray-700">Loading Garment Forge...</p>
        </div>
      </div>
    );
  }

  const moduleCards = [
    {
      title: "Order Management",
      icon: "📦",
      description: "Manage customer orders from design to delivery",
      path: "/orders",
      color: "from-blue-500 to-blue-600",
      stats: `${stats?.orders?.total || 0} Orders`,
      features: ["Order Tracking", "Customer Management", "Delivery Scheduling", "Size & Color Variants"]
    },
    {
      title: "Production Control",
      icon: "⚙️",
      description: "Track production stages and worker assignments",
      path: "/production",
      color: "from-green-500 to-green-600",
      stats: "5 Stages",
      features: ["Cutting → Stitching → Finishing → QC → Packaging", "Worker Assignment", "Timeline Tracking"]
    },
    {
      title: "Smart Tasks & Communication",
      icon: "📋",
      description: "Advanced task management with notifications",
      path: "/tasks",
      color: "from-purple-500 to-purple-600",
      stats: `${stats?.tasks?.pending || 0} Active`,
      features: ["Interactive Notifications", "Group Chat Integration", "File Attachments (6MB)", "Recurring Tasks"]
    },
    {
      title: "Inventory & Materials",
      icon: "📦",
      description: "Material tracking with smart alerts",
      path: "/inventory",
      color: "from-yellow-500 to-orange-600",
      stats: `${stats?.materials?.total || 0} Materials`,
      features: ["Stock Alerts", "Supplier Management", "Usage Tracking", "Reorder Automation"]
    },
    {
      title: "Quality Control",
      icon: "✅",
      description: "QC inspections and defect tracking",
      path: "/quality",
      color: "from-emerald-500 to-emerald-600",
      stats: `${stats?.quality?.pass_rate || 0}% Pass Rate`,
      features: ["Stage-wise QC", "Defect Tracking", "Inspector Assignment", "Quality Analytics"]
    },
    {
      title: "Team Management",
      icon: "👥",
      description: "Employee profiles and department organization",
      path: "/employees",
      color: "from-indigo-500 to-indigo-600",
      stats: `${stats?.workers?.total || 0} Employees`,
      features: ["Skills Tracking", "Department Organization", "Performance Monitoring"]
    },
    {
      title: "Messages & Groups",
      icon: "💬",
      description: "Team communication and group coordination",
      path: "/messages",
      color: "from-pink-500 to-pink-600",
      stats: "Real-time Chat",
      features: ["1-on-1 Messaging", "Group Chats", "Task Notifications", "File Sharing"]
    },
    {
      title: "Analytics & Reports",
      icon: "📊",
      description: "Business insights and performance metrics",
      path: "/analytics",
      color: "from-teal-500 to-teal-600",
      stats: "Live Data",
      features: ["Production Metrics", "Inventory Value", "Quality Trends", "Performance Analytics"]
    }
  ];

  const quickActions = [
    { icon: "🆕", label: "New Order", path: "/orders", color: "bg-blue-500" },
    { icon: "▶️", label: "Start Production", path: "/production", color: "bg-green-500" },
    { icon: "📋", label: "Create Task", path: "/tasks", color: "bg-purple-500" },
    { icon: "📦", label: "Add Material", path: "/inventory", color: "bg-yellow-500" },
    { icon: "✅", label: "QC Check", path: "/quality", color: "bg-emerald-500" },
    { icon: "👤", label: "Add Employee", path: "/employees", color: "bg-indigo-500" },
    { icon: "💬", label: "New Message", path: "/messages", color: "bg-pink-500" },
    { icon: "🔔", label: "Notifications", path: "/notifications", color: "bg-orange-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🏭 Garment Forge
              </h1>
              <p className="text-gray-600 mt-1">Complete Factory Management System</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">Welcome back, {currentUser.name}</p>
                <p className="text-xs text-gray-500">Factory Operations Manager</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-white rounded-xl p-2 shadow-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'modules' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🎛️ All Modules
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'activity' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🔔 Recent Activity
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">📦</div>
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Live</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats?.orders?.total || 0}</h3>
                <p className="text-sm text-gray-600">Total Orders</p>
                <div className="flex gap-3 mt-3 text-xs">
                  <span className="text-green-600">✓ {stats?.orders?.completed || 0} Done</span>
                  <span className="text-blue-600">⚡ {stats?.orders?.active || 0} Active</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">👥</div>
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Active</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats?.workers?.total || 0}</h3>
                <p className="text-sm text-gray-600">Team Members</p>
                <p className="text-xs text-gray-500 mt-3">Across all departments</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">📋</div>
                  {stats?.materials?.low_stock > 0 && (
                    <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">Alert</span>
                  )}
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats?.materials?.total || 0}</h3>
                <p className="text-sm text-gray-600">Materials</p>
                {stats?.materials?.low_stock > 0 ? (
                  <p className="text-xs text-red-600 mt-3">⚠️ {stats.materials.low_stock} Low Stock</p>
                ) : (
                  <p className="text-xs text-green-600 mt-3">✓ All Stocked</p>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">✅</div>
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Excellent</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats?.quality?.pass_rate || 0}%</h3>
                <p className="text-sm text-gray-600">Quality Score</p>
                <p className="text-xs text-gray-500 mt-3">{stats?.quality?.total_checks || 0} Inspections</p>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => window.location.href = action.path}
                    className={`${action.color} hover:opacity-90 text-white p-4 rounded-xl transition transform hover:scale-105 shadow-lg`}
                  >
                    <div className="text-2xl mb-2">{action.icon}</div>
                    <div className="text-xs font-medium">{action.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Alerts & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Alerts */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">🚨</span> Active Alerts
                </h3>
                <div className="space-y-3">
                  {stats?.materials?.low_stock > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg cursor-pointer"
                         onClick={() => window.location.href = '/inventory'}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⚠️</span>
                        <div>
                          <p className="font-medium text-red-800">Low Stock Alert</p>
                          <p className="text-sm text-red-600">{stats.materials.low_stock} materials need reordering</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {stats?.tasks?.pending > 0 && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg cursor-pointer"
                         onClick={() => window.location.href = '/tasks'}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📝</span>
                        <div>
                          <p className="font-medium text-yellow-800">Pending Tasks</p>
                          <p className="text-sm text-yellow-600">{stats.tasks.pending} tasks awaiting action</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {stats?.orders?.active > 0 && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg cursor-pointer"
                         onClick={() => window.location.href = '/orders'}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🚀</span>
                        <div>
                          <p className="font-medium text-blue-800">Production Active</p>
                          <p className="text-sm text-blue-600">{stats.orders.active} orders in progress</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {stats?.materials?.low_stock === 0 && stats?.tasks?.pending === 0 && stats?.orders?.active === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-4xl mb-2">✅</div>
                      <p className="font-medium">All systems running smoothly!</p>
                      <p className="text-sm">No urgent alerts at this time</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Notifications */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">🔔</span> Recent Notifications
                  <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Interactive</span>
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {notifications.map((notif, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition cursor-pointer border-l-4 border-blue-400"
                         onClick={() => window.location.href = '/notifications'}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {notif.notification_type === 'task_created' ? '🆕' : 
                           notif.notification_type === 'task_reminder' ? '⏰' : '✅'}
                        </span>
                        <p className="font-medium text-sm text-gray-800 flex-1 truncate">{notif.title}</p>
                        {!notif.read && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{notif.content}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">{new Date(notif.created_at).toLocaleDateString()}</p>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          ⚡ Action Required
                        </span>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="text-center py-4 text-gray-400">
                      <div className="text-2xl mb-2">🔕</div>
                      <p className="text-sm">No notifications yet</p>
                      <p className="text-xs">Create tasks to see notifications here</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => window.location.href = '/notifications'}
                  className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  View All Notifications →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All Modules Tab */}
        {activeTab === 'modules' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {moduleCards.map((module, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${module.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{module.icon}</div>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                      {module.stats}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{module.title}</h3>
                  <p className="text-sm opacity-90">{module.description}</p>
                </div>
                
                <div className="p-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Key Features:</h4>
                  <ul className="space-y-2 mb-6">
                    {module.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => window.location.href = module.path}
                    className={`w-full py-3 bg-gradient-to-r ${module.color} text-white rounded-xl font-medium hover:opacity-90 transition shadow-md`}
                  >
                    Open {module.title}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Activity Tab */}
        {activeTab === 'activity' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Tasks */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📋</span> Recent Tasks
              </h3>
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer"
                       onClick={() => window.location.href = '/tasks'}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800 truncate">{task.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>👤 Assigned</span>
                      <span>🏭 {task.department}</span>
                      {task.due_date && <span>📅 {task.due_date}</span>}
                      {task.tags && task.tags.length > 0 && (
                        <span className="px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                          🏷️ {task.tags.length}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {recentTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-3xl mb-2">📋</div>
                    <p className="text-sm">No tasks yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📦</span> Recent Orders
              </h3>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer"
                       onClick={() => window.location.href = '/orders'}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">{order.style_number}</h4>
                        <p className="text-sm text-gray-600">{order.customer_name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>👕 {order.garment_type}</span>
                      <span>📊 {order.total_quantity} pcs</span>
                      <span>📅 {order.delivery_date}</span>
                    </div>
                  </div>
                ))}
                {recentOrders.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-3xl mb-2">📦</div>
                    <p className="text-sm">No orders yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GarmentForge;