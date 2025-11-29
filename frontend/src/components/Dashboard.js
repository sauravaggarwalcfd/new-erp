import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, FileText, ClipboardList } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard({ user, onLogout }) {
  const [stats, setStats] = useState({
    buyers: 0,
    suppliers: 0,
    rawMaterials: 0,
    colors: 0,
    sizes: 0,
    articles: 0,
    boms: 0,
    unassignedBoms: 0,
    mrps: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [buyers, suppliers, materials, colors, sizes, articles, boms, mrps] = await Promise.all([
        axios.get(`${API}/buyers`),
        axios.get(`${API}/suppliers`),
        axios.get(`${API}/raw-materials`),
        axios.get(`${API}/colors`),
        axios.get(`${API}/sizes`),
        axios.get(`${API}/articles`),
        axios.get(`${API}/boms`),
        axios.get(`${API}/mrps`)
      ]);

      const unassigned = boms.data.filter(b => b.status === "unassigned").length;

      setStats({
        buyers: buyers.data.length,
        suppliers: suppliers.data.length,
        rawMaterials: materials.data.length,
        colors: colors.data.length,
        sizes: sizes.data.length,
        articles: articles.data.length,
        boms: boms.data.length,
        unassignedBoms: unassigned,
        mrps: mrps.data.length
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-600 mt-1">Overview of your manufacturing operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Buyers</CardTitle>
              <Users className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800" data-testid="buyers-count">{stats.buyers}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Suppliers</CardTitle>
              <Package className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800" data-testid="suppliers-count">{stats.suppliers}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Raw Materials</CardTitle>
              <ClipboardList className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800" data-testid="materials-count">{stats.rawMaterials}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Articles</CardTitle>
              <FileText className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800" data-testid="articles-count">{stats.articles}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-cyan-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Colors</CardTitle>
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-400 via-yellow-400 to-blue-400"></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800" data-testid="colors-count">{stats.colors}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-pink-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Sizes</CardTitle>
              <FileText className="w-5 h-5 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800" data-testid="sizes-count">{stats.sizes}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total BOMs</CardTitle>
              <FileText className="w-5 h-5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800" data-testid="boms-count">{stats.boms}</div>
              <p className="text-xs text-slate-500 mt-1">{stats.unassignedBoms} unassigned</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">MRPs Created</CardTitle>
              <ClipboardList className="w-5 h-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800" data-testid="mrps-count">{stats.mrps}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
