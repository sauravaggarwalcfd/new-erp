import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, Users, Package, FileText, 
  ClipboardList, Factory, Boxes, Palette, Ruler, 
  ShoppingCart, BarChart3, AlertCircle, CheckCircle2,
  Clock, ArrowRight, Plus, Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CorporateDashboard({ user }) {
  const [stats, setStats] = useState({
    buyers: 0,
    suppliers: 0,
    rawMaterials: 0,
    colors: 0,
    sizes: 0,
    articles: 0,
    boms: 0,
    mrps: 0,
    fabrics: 0,
    recentBoms: [],
    recentMrps: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [buyers, suppliers, materials, colors, sizes, articles, boms, mrps, fabrics] = await Promise.all([
        axios.get(`${API}/buyers`).catch(() => ({ data: [] })),
        axios.get(`${API}/suppliers`).catch(() => ({ data: [] })),
        axios.get(`${API}/raw-materials`).catch(() => ({ data: [] })),
        axios.get(`${API}/colors`).catch(() => ({ data: [] })),
        axios.get(`${API}/sizes`).catch(() => ({ data: [] })),
        axios.get(`${API}/articles`).catch(() => ({ data: [] })),
        axios.get(`${API}/boms`).catch(() => ({ data: [] })),
        axios.get(`${API}/mrps`).catch(() => ({ data: [] })),
        axios.get(`${API}/dynamic-masters/fabric_master_excel/data`).catch(() => ({ data: [] }))
      ]);

      setStats({
        buyers: buyers.data.length,
        suppliers: suppliers.data.length,
        rawMaterials: materials.data.length,
        colors: colors.data.length,
        sizes: sizes.data.length,
        articles: articles.data.length,
        boms: boms.data.length,
        mrps: mrps.data.length,
        fabrics: fabrics.data.length,
        recentBoms: boms.data.slice(0, 5),
        recentMrps: mrps.data.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: 'Total BOMs',
      value: stats.boms,
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'blue',
      link: '/boms'
    },
    {
      title: 'Active MRPs',
      value: stats.mrps,
      change: '+8%',
      trend: 'up',
      icon: BarChart3,
      color: 'green',
      link: '/mrp'
    },
    {
      title: 'Total Suppliers',
      value: stats.suppliers,
      change: '+5%',
      trend: 'up',
      icon: Factory,
      color: 'purple',
      link: '/masters'
    },
    {
      title: 'Fabric Catalog',
      value: stats.fabrics,
      change: '+15%',
      trend: 'up',
      icon: Boxes,
      color: 'orange',
      link: '/master-builder'
    }
  ];

  const quickActions = [
    {
      title: 'Create BOM',
      description: 'Start new Bill of Materials',
      icon: Plus,
      color: 'bg-blue-600 hover:bg-blue-700',
      link: '/boms'
    },
    {
      title: 'Generate MRP',
      description: 'Material requirement planning',
      icon: ClipboardList,
      color: 'bg-green-600 hover:bg-green-700',
      link: '/mrp'
    },
    {
      title: 'Manage Masters',
      description: 'Configure master data',
      icon: Settings,
      color: 'bg-purple-600 hover:bg-purple-700',
      link: '/masters'
    },
    {
      title: 'Form Builder',
      description: 'Customize BOM forms',
      icon: Settings,
      color: 'bg-orange-600 hover:bg-orange-700',
      link: '/bom-form-builder'
    }
  ];

  const masterDataCards = [
    { label: 'Buyers', value: stats.buyers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Suppliers', value: stats.suppliers, icon: Factory, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Raw Materials', value: stats.rawMaterials, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Colors', value: stats.colors, icon: Palette, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Sizes', value: stats.sizes, icon: Ruler, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Articles', value: stats.articles, icon: ShoppingCart, color: 'text-indigo-600', bg: 'bg-indigo-50' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.username || 'User'}</h1>
              <p className="text-blue-200 text-lg">GarmentERP Manufacturing Dashboard</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-200">Today</div>
              <div className="text-2xl font-bold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Link to={kpi.link} key={index}>
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-t-4 border-t-blue-600 hover:-translate-y-1">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-${kpi.color}-50`}>
                        <Icon className={`w-6 h-6 text-${kpi.color}-600`} />
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {kpi.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {kpi.change}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">{kpi.title}</p>
                      <p className="text-3xl font-bold text-slate-900">{kpi.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
            <CardTitle className="text-2xl flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Frequently used operations</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link to={action.link} key={index}>
                    <div className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg">
                      <div className={`${action.color} text-white p-6`}>
                        <Icon className="w-8 h-8 mb-3" />
                        <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
                        <p className="text-sm text-white/80">{action.description}</p>
                        <ArrowRight className="w-5 h-5 absolute bottom-4 right-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Master Data Overview */}
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 border-b">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Package className="w-6 h-6 text-purple-600" />
                Master Data Overview
              </CardTitle>
              <CardDescription>Current master data statistics</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {masterDataCards.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className={`${item.bg} rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-white`}>
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">{item.label}</p>
                          <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6">
                <Link to="/masters">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Manage All Masters
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-green-50 border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-slate-700">Database</span>
                  </div>
                  <span className="text-xs font-semibold text-green-600">ONLINE</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-slate-700">API Services</span>
                  </div>
                  <span className="text-xs font-semibold text-green-600">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">Last Sync</span>
                  </div>
                  <span className="text-xs font-semibold text-blue-600">JUST NOW</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-slate-700">Masters Loaded</span>
                  </div>
                  <span className="text-xs font-semibold text-green-600">{stats.fabrics} ITEMS</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Recent BOMs
              </CardTitle>
              <CardDescription>Latest Bills of Materials</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {stats.recentBoms.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentBoms.map((bom, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div>
                        <p className="font-medium text-slate-900">{bom.header?.styleNumber || `BOM #${index + 1}`}</p>
                        <p className="text-xs text-slate-600">{bom.header?.buyer || 'No buyer'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No BOMs created yet</p>
                  <Link to="/boms">
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700" size="sm">
                      Create First BOM
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-green-50 border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Recent MRPs
              </CardTitle>
              <CardDescription>Latest material plans</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {stats.recentMrps.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentMrps.map((mrp, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div>
                        <p className="font-medium text-slate-900">MRP #{index + 1}</p>
                        <p className="text-xs text-slate-600">{new Date(mrp.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No MRPs generated yet</p>
                  <Link to="/mrp">
                    <Button className="mt-4 bg-green-600 hover:bg-green-700" size="sm">
                      Generate MRP
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
