import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Settings, Edit, Trash2, Database, Grid3x3 } from "lucide-react";
import MasterConfigBuilder from "./MasterConfigBuilder";
import DynamicMasterManager from "./DynamicMasterManager";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CATEGORIES = [
  { id: "production", name: "Production", icon: "⚙️", color: "blue" },
  { id: "material", name: "Material", icon: "📦", color: "green" },
  { id: "quality", name: "Quality", icon: "✅", color: "purple" },
  { id: "hr", name: "HR/Resource", icon: "👥", color: "orange" },
  { id: "logistics", name: "Logistics", icon: "🚚", color: "red" },
  { id: "cost", name: "Cost", icon: "💰", color: "yellow" },
  { id: "other", name: "Other", icon: "📋", color: "gray" }
];

export default function MasterBuilder({ user, onLogout }) {
  const [masterConfigs, setMasterConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetchMasterConfigs();
  }, []);

  const fetchMasterConfigs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/master-configs`);
      setMasterConfigs(response.data);
    } catch (error) {
      toast.error("Error fetching master configurations");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedConfig(null);
    setShowBuilder(true);
  };

  const handleEditConfig = (config) => {
    setSelectedConfig(config);
    setShowBuilder(true);
  };

  const handleDeleteConfig = async (configId) => {
    if (!window.confirm("Are you sure? This will delete the master configuration and all its data!")) return;
    
    try {
      await axios.delete(`${API}/master-configs/${configId}`);
      toast.success("Master configuration deleted");
      fetchMasterConfigs();
    } catch (error) {
      toast.error("Error deleting master configuration");
    }
  };

  const handleSaveConfig = async (configData) => {
    try {
      if (selectedConfig) {
        await axios.put(`${API}/master-configs/${selectedConfig.id}`, configData);
        toast.success("Master configuration updated");
      } else {
        await axios.post(`${API}/master-configs`, configData);
        toast.success("Master configuration created");
      }
      setShowBuilder(false);
      setSelectedConfig(null);
      fetchMasterConfigs();
    } catch (error) {
      console.error("Save error:", error.response?.data);
      const errorMsg = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : "Error saving configuration. Please check all fields.";
      toast.error(errorMsg);
    }
  };

  const handleManageMaster = (config) => {
    setSelectedMaster(config);
  };

  const filteredConfigs = filterCategory === "all" 
    ? masterConfigs 
    : masterConfigs.filter(c => c.category === filterCategory);

  if (showBuilder) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <MasterConfigBuilder
          initialConfig={selectedConfig}
          onSave={handleSaveConfig}
          onCancel={() => {
            setShowBuilder(false);
            setSelectedConfig(null);
          }}
        />
      </Layout>
    );
  }

  if (selectedMaster) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <DynamicMasterManager
          config={selectedMaster}
          onBack={() => setSelectedMaster(null)}
        />
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Dynamic Master Builder</h1>
            <p className="text-slate-600 mt-1">Create and manage custom master data for your factory</p>
          </div>
          <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create New Master
          </Button>
        </div>

        {/* Category Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterCategory === "all" ? "default" : "outline"}
                onClick={() => setFilterCategory("all")}
                size="sm"
              >
                All Masters ({masterConfigs.length})
              </Button>
              {CATEGORIES.map(category => {
                const count = masterConfigs.filter(c => c.category === category.id).length;
                return (
                  <Button
                    key={category.id}
                    variant={filterCategory === category.id ? "default" : "outline"}
                    onClick={() => setFilterCategory(category.id)}
                    size="sm"
                    className={filterCategory === category.id ? `bg-${category.color}-600` : ""}
                  >
                    {category.icon} {category.name} ({count})
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Master Configurations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-500">Loading...</div>
          ) : filteredConfigs.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Database className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 mb-4">No master configurations found</p>
              <Button onClick={handleCreateNew} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Master
              </Button>
            </div>
          ) : (
            filteredConfigs.map(config => {
              const category = CATEGORIES.find(c => c.id === config.category);
              return (
                <Card key={config.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{config.icon || category?.icon || "📋"}</div>
                        <div>
                          <CardTitle className="text-lg">{config.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {category?.name || "Other"}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditConfig(config)}
                          title="Edit Configuration"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteConfig(config.id)}
                          className="text-red-600"
                          title="Delete Master"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {config.description && (
                      <p className="text-sm text-slate-600 mb-4">{config.description}</p>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Fields:</span>
                        <span className="font-medium">{config.fields?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Excel Upload:</span>
                        <span className={config.enableExcelUpload ? "text-green-600" : "text-slate-400"}>
                          {config.enableExcelUpload ? "✓ Enabled" : "✗ Disabled"}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleManageMaster(config)}
                      className="w-full mt-4"
                      variant="outline"
                    >
                      <Grid3x3 className="w-4 h-4 mr-2" />
                      Manage Data
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
