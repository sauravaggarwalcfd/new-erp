import { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';
import Masters from '@/components/Masters';
import BOMManagement from '@/components/BOMManagement';
import MRPManagement from '@/components/MRPManagement';
import MasterBuilder from '@/components/MasterBuilder';
import BOMFormBuilder from '@/components/BOMFormBuilder';
import Tasks from './pages/TasksEnhanced';
import Messages from './pages/Messages';
import Groups from './pages/Groups';
import Notifications from './pages/Notifications';
import Analytics from './pages/Analytics';
import { Toaster } from '@/components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Set axios defaults
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const UnifiedLayout = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('erp');

  useEffect(() => {
    const tasksRoutes = ['/tasks', '/messages', '/groups', '/notifications'];
    if (tasksRoutes.some(route => location.pathname.includes(route))) {
      setActiveTab('tasks');
    } else {
      setActiveTab('erp');
    }
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏭</div>
            <div>
              <h1 className="text-xl font-bold">GarmentERP</h1>
              <p className="text-xs text-blue-300">Manufacturing System</p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="p-4 border-b border-blue-800">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('erp')}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition ${
                activeTab === 'erp'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-blue-800 text-blue-300 hover:bg-blue-700'
              }`}
              data-testid="erp-tab-button"
            >
              🏭 ERP
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition ${
                activeTab === 'tasks'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-blue-800 text-blue-300 hover:bg-blue-700'
              }`}
              data-testid="tasks-tab-button"
            >
              📝 Tasks
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {/* ERP Section */}
          {activeTab === 'erp' && (
            <div data-testid="erp-section">
              <div className="px-6 py-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                ERP Management
              </div>
              <Link
                to="/"
                className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/')}`}
                data-testid="dashboard-link"
              >
                <span className="mr-3">📊</span>
                <span>Dashboard</span>
              </Link>
              <Link
                to="/masters"
                className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/masters')}`}
                data-testid="masters-link"
              >
                <span className="mr-3">📋</span>
                <span>Masters</span>
              </Link>
              <Link
                to="/master-builder"
                className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/master-builder')}`}
                data-testid="master-builder-link"
              >
                <span className="mr-3">🔧</span>
                <span>Master Builder</span>
              </Link>
              <Link
                to="/boms"
                className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/boms')}`}
                data-testid="bom-link"
              >
                <span className="mr-3">📦</span>
                <span>BOM Management</span>
              </Link>
              <Link
                to="/bom-form-builder"
                className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/bom-form-builder')}`}
                data-testid="bom-form-builder-link"
              >
                <span className="mr-3">⚙️</span>
                <span>BOM Form Builder</span>
              </Link>
              <Link
                to="/mrp"
                className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/mrp')}`}
                data-testid="mrp-link"
              >
                <span className="mr-3">📈</span>
                <span>MRP Management</span>
              </Link>
            </div>
          )}

          {/* Tasks Section */}
          {activeTab === 'tasks' && (
            <div data-testid="tasks-section">
              <div className="px-6 py-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Task Management
              </div>
              <Link
                to="/tasks"
                className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/tasks')}`}
                data-testid="tasks-link"
              >
                <span className="mr-3">📝</span>
                <span>Tasks</span>
              </Link>
              <Link
                to="/messages"
                className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/messages')}`}
                data-testid="messages-link"
              >
                <span className="mr-3">💬</span>
                <span>Messages</span>
              </Link>
              <Link
                to="/groups"
                className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/groups')}`}
                data-testid="groups-link"
              >
                <span className="mr-3">👥</span>
                <span>Groups</span>
              </Link>
              <Link
                to="/notifications"
                className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/notifications')}`}
                data-testid="notifications-link"
              >
                <span className="mr-3">🔔</span>
                <span>Notifications</span>
              </Link>
              <Link
                to="/analytics"
                className={`flex items-center px-6 py-3 hover:bg-blue-800 transition ${isActive('/analytics')}`}
                data-testid="analytics-link"
              >
                <span className="mr-3">📊</span>
                <span>Analytics</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-blue-800">
          <div className="mb-3">
            <div className="text-xs text-blue-400 mb-1">Logged in as</div>
            <div className="font-semibold text-sm">{user?.username || 'User'}</div>
            <div className="text-xs text-blue-300">{user?.email}</div>
          </div>
          <div className="mb-3">
            <span className="text-xs font-semibold">Active: </span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                activeTab === 'erp' ? 'bg-blue-600' : 'bg-green-600'
              }`}
            >
              {activeTab === 'erp' ? '🏭 ERP Mode' : '📝 Tasks Mode'}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition"
            data-testid="logout-button"
          >
            Logout
          </button>
          <p className="text-xs text-blue-400 mt-3 text-center">© 2025 GarmentERP</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
    }
    setLoading(false);
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🏭</div>
          <div className="text-xl text-slate-600">Loading GarmentERP...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              !user ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/"
            element={
              user ? (
                <UnifiedLayout user={user} onLogout={handleLogout}>
                  <Dashboard user={user} onLogout={handleLogout} />
                </UnifiedLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/masters"
            element={
              user ? (
                <UnifiedLayout user={user} onLogout={handleLogout}>
                  <Masters user={user} onLogout={handleLogout} />
                </UnifiedLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/boms"
            element={
              user ? (
                <UnifiedLayout user={user} onLogout={handleLogout}>
                  <BOMManagement user={user} onLogout={handleLogout} />
                </UnifiedLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/mrp"
            element={
              user ? (
                <UnifiedLayout user={user} onLogout={handleLogout}>
                  <MRPManagement user={user} onLogout={handleLogout} />
                </UnifiedLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/master-builder"
            element={
              user ? (
                <UnifiedLayout user={user} onLogout={handleLogout}>
                  <MasterBuilder user={user} onLogout={handleLogout} />
                </UnifiedLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/bom-form-builder"
            element={
              user ? (
                <UnifiedLayout user={user} onLogout={handleLogout}>
                  <BOMFormBuilder user={user} onLogout={handleLogout} />
                </UnifiedLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/tasks"
            element={
              user ? (
                <UnifiedLayout user={user} onLogout={handleLogout}>
                  <div className="p-8"><Tasks /></div>
                </UnifiedLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/messages"
            element={
              user ? (
                <UnifiedLayout user={user} onLogout={handleLogout}>
                  <div className="p-8"><Messages /></div>
                </UnifiedLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/groups"
            element={
              user ? (
                <UnifiedLayout user={user} onLogout={handleLogout}>
                  <div className="p-8"><Groups /></div>
                </UnifiedLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/notifications"
            element={
              user ? (
                <UnifiedLayout user={user} onLogout={handleLogout}>
                  <div className="p-8"><Notifications /></div>
                </UnifiedLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/analytics"
            element={
              user ? (
                <UnifiedLayout user={user} onLogout={handleLogout}>
                  <div className="p-8"><Analytics /></div>
                </UnifiedLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;