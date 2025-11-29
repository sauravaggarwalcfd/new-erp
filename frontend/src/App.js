import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import '@/App.css';
import GarmentForge from './pages/GarmentForge';
import Dashboard from './pages/Dashboard';
import DashboardModern from './pages/DashboardModern';
import DashboardMinimal from './pages/DashboardMinimal';
import DashboardDark from './pages/DashboardDark';
import DashboardNotion from './pages/DashboardNotion';
import DashboardLinear from './pages/DashboardLinear';
import DashboardStripe from './pages/DashboardStripe';
import DashboardApple from './pages/DashboardApple';
import Orders from './pages/Orders';
import Production from './pages/Production';
import Inventory from './pages/Inventory';
import Quality from './pages/Quality';
import Employees from './pages/Employees';
import Analytics from './pages/Analytics';
import Tasks from './pages/Tasks';
import TasksEnhanced from './pages/TasksEnhanced';
import Messages from './pages/Messages';
import Groups from './pages/Groups';
import Notifications from './pages/Notifications';
import Suppliers from './pages/Suppliers';

const Layout = ({ children }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('erp');
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  // Determine which tab should be active based on current route
  React.useEffect(() => {
    const tasksRoutes = ['/tasks', '/messages', '/groups', '/notifications'];
    const erpRoutes = ['/orders', '/production', '/inventory', '/suppliers', '/quality', '/employees'];
    
    if (tasksRoutes.some(route => location.pathname.includes(route))) {
      setActiveTab('tasks');
    } else if (erpRoutes.some(route => location.pathname.includes(route))) {
      setActiveTab('erp');
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-2xl font-bold">Factory Manager</h1>
          <p className="text-blue-300 text-sm mt-1">Unified Management System</p>
        </div>

        {/* Tab Selector */}
        <div className="p-4 border-b border-blue-800">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('erp')}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold transition ${
                activeTab === 'erp' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-800 text-blue-300 hover:bg-blue-700'
              }`}
              data-testid="erp-tab-button"
            >
              🏭 ERP
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold transition ${
                activeTab === 'tasks' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-800 text-blue-300 hover:bg-blue-700'
              }`}
              data-testid="tasks-tab-button"
            >
              📝 Tasks
            </button>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          {/* Shared Navigation */}
          <div className="mb-4">
            <div className="px-6 py-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              General
            </div>
            <Link to="/" className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/')}`} data-testid="garment-forge-link">
              <span className="mr-3">🏭</span>
              <span>Garment Forge</span>
            </Link>
            <Link to="/dashboard" className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/dashboard')}`} data-testid="dashboard-link">
              <span className="mr-3">📊</span>
              <span>Dashboard</span>
            </Link>
            <Link to="/analytics" className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/analytics')}`} data-testid="analytics-link">
              <span className="mr-3">📈</span>
              <span>Analytics</span>
            </Link>
          </div>

          {/* ERP Section */}
          {activeTab === 'erp' && (
            <div data-testid="erp-section">
              <div className="px-6 py-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                ERP Management
              </div>
              <Link to="/orders" className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/orders')}`} data-testid="orders-link">
                <span className="mr-3">📦</span>
                <span>Orders</span>
              </Link>
              <Link to="/production" className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/production')}`} data-testid="production-link">
                <span className="mr-3">⚙️</span>
                <span>Production</span>
              </Link>
              <Link to="/inventory" className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/inventory')}`} data-testid="inventory-link">
                <span className="mr-3">📋</span>
                <span>Inventory</span>
              </Link>
              <Link to="/suppliers" className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/suppliers')}`} data-testid="suppliers-link">
                <span className="mr-3">🏭</span>
                <span>Suppliers</span>
              </Link>
              <Link to="/quality" className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/quality')}`} data-testid="quality-link">
                <span className="mr-3">✅</span>
                <span>Quality Control</span>
              </Link>
              <Link to="/employees" className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/employees')}`} data-testid="employees-link">
                <span className="mr-3">👥</span>
                <span>Employees</span>
              </Link>
            </div>
          )}

          {/* Tasks Section */}
          {activeTab === 'tasks' && (
            <div data-testid="tasks-section">
              <div className="px-6 py-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Task Management
              </div>
              <Link to="/tasks" className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/tasks')}`} data-testid="tasks-link">
                <span className="mr-3">📝</span>
                <span>Tasks</span>
              </Link>
              <Link to="/messages" className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/messages')}`} data-testid="messages-link">
                <span className="mr-3">💬</span>
                <span>Messages</span>
              </Link>
              <Link to="/groups" className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/groups')}`} data-testid="groups-link">
                <span className="mr-3">👥</span>
                <span>Groups</span>
              </Link>
              <Link to="/notifications" className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/notifications')}`} data-testid="notifications-link">
                <span className="mr-3">🔔</span>
                <span>Notifications</span>
              </Link>
            </div>
          )}
        </nav>
        
        <div className="p-4 border-t border-blue-800 text-sm text-blue-300">
          <div className="mb-2">
            <span className="font-semibold">Active: </span>
            <span className={`px-2 py-1 rounded text-xs ${
              activeTab === 'erp' ? 'bg-blue-600' : 'bg-green-600'
            }`}>
              {activeTab === 'erp' ? '🏭 ERP Mode' : '📝 Tasks Mode'}
            </span>
          </div>
          <p>© 2025 Factory Manager</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<GarmentForge />} />
            <Route path="/dashboard" element={<DashboardApple />} />
            <Route path="/modern" element={<DashboardModern />} />
            <Route path="/minimal" element={<DashboardMinimal />} />
            <Route path="/dark" element={<DashboardDark />} />
            <Route path="/notion" element={<DashboardNotion />} />
            <Route path="/linear" element={<DashboardLinear />} />
            <Route path="/stripe" element={<DashboardStripe />} />
            <Route path="/apple" element={<DashboardApple />} />
            <Route path="/original" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/production" element={<Production />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/quality" element={<Quality />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/tasks" element={<TasksEnhanced />} />
            <Route path="/tasks-old" element={<Tasks />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;
