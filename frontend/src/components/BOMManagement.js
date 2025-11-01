import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Eye } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function BOMManagement({ user, onLogout }) {
  const [boms, setBoms] = useState([]);
  const [articles, setArticles] = useState([]);
  const [colors, setColors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedBOM, setSelectedBOM] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    article_id: "",
    color_id: "",
    items: []
  });

  const [currentItem, setCurrentItem] = useState({
    material_id: "",
    avg_consumption: 0,
    wastage_percent: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bomsRes, articlesRes, colorsRes, materialsRes] = await Promise.all([
        axios.get(`${API}/boms`),
        axios.get(`${API}/articles`),
        axios.get(`${API}/colors`),
        axios.get(`${API}/raw-materials`)
      ]);

      setBoms(bomsRes.data);
      setArticles(articlesRes.data);
      setColors(colorsRes.data);
      setMaterials(materialsRes.data);
    } catch (error) {
      toast.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const addItemToBOM = () => {
    if (!currentItem.material_id || currentItem.avg_consumption <= 0) {
      toast.error("Please select material and enter consumption");
      return;
    }

    const material = materials.find(m => m.id === currentItem.material_id);
    if (!material) return;

    const totalConsumption = currentItem.avg_consumption * (1 + currentItem.wastage_percent / 100);
    const totalCost = totalConsumption * material.cost_per_unit;

    const item = {
      material_id: material.id,
      material_name: material.name,
      avg_consumption: currentItem.avg_consumption,
      wastage_percent: currentItem.wastage_percent,
      total_consumption: totalConsumption,
      cost_per_unit: material.cost_per_unit,
      total_cost: totalCost
    };

    setFormData({
      ...formData,
      items: [...formData.items, item]
    });

    setCurrentItem({
      material_id: "",
      avg_consumption: 0,
      wastage_percent: 0
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleCreateBOM = async (e) => {
    e.preventDefault();

    if (!formData.article_id || !formData.color_id) {
      toast.error("Please select article and color");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("Please add at least one material");
      return;
    }

    try {
      await axios.post(`${API}/boms`, formData);
      toast.success("BOM created successfully");
      setCreateOpen(false);
      setFormData({ article_id: "", color_id: "", items: [] });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error creating BOM");
    }
  };

  const handleDeleteBOM = async (id) => {
    if (!window.confirm("Are you sure you want to delete this BOM?")) return;
    try {
      await axios.delete(`${API}/boms/${id}`);
      toast.success("BOM deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Error deleting BOM");
    }
  };

  const viewBOM = async (id) => {
    try {
      const response = await axios.get(`${API}/boms/${id}`);
      setSelectedBOM(response.data);
      setViewOpen(true);
    } catch (error) {
      toast.error("Error fetching BOM details");
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">BOM Management</h1>
            <p className="text-slate-600 mt-1">Create and manage Bills of Materials</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="create-bom-button">
                <Plus className="w-4 h-4 mr-2" />
                Create BOM
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Bill of Materials</DialogTitle>
                <DialogDescription>Add materials and quantities for the article</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateBOM} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Article</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                      value={formData.article_id}
                      onChange={(e) => setFormData({ ...formData, article_id: e.target.value })}
                      data-testid="bom-article-select"
                      required
                    >
                      <option value="">Select Article</option>
                      {articles.map((a) => (
                        <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                      value={formData.color_id}
                      onChange={(e) => setFormData({ ...formData, color_id: e.target.value })}
                      data-testid="bom-color-select"
                      required
                    >
                      <option value="">Select Color</option>
                      {colors.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Add Materials</h3>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Material</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                        value={currentItem.material_id}
                        onChange={(e) => setCurrentItem({ ...currentItem, material_id: e.target.value })}
                        data-testid="bom-material-select"
                      >
                        <option value="">Select Material</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Avg Consumption</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={currentItem.avg_consumption}
                        onChange={(e) => setCurrentItem({ ...currentItem, avg_consumption: parseFloat(e.target.value) || 0 })}
                        data-testid="bom-consumption-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Wastage %</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={currentItem.wastage_percent}
                        onChange={(e) => setCurrentItem({ ...currentItem, wastage_percent: parseFloat(e.target.value) || 0 })}
                        data-testid="bom-wastage-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>&nbsp;</Label>
                      <Button type="button" onClick={addItemToBOM} className="w-full" data-testid="add-material-button">
                        Add Material
                      </Button>
                    </div>
                  </div>

                  {formData.items.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Material</TableHead>
                            <TableHead>Avg Consumption</TableHead>
                            <TableHead>Wastage %</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Cost</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.material_name}</TableCell>
                              <TableCell>{item.avg_consumption.toFixed(2)}</TableCell>
                              <TableCell>{item.wastage_percent}%</TableCell>
                              <TableCell>{item.total_consumption.toFixed(2)}</TableCell>
                              <TableCell>₹{item.total_cost.toFixed(2)}</TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(index)}
                                  className="text-red-600 hover:text-red-700"
                                  data-testid={`remove-material-${index}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="bg-slate-50 p-3 text-right font-semibold">
                        Total Cost: ₹{formData.items.reduce((sum, item) => sum + item.total_cost, 0).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" data-testid="submit-bom-button">
                  Create BOM
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All BOMs</CardTitle>
            <CardDescription>View and manage all Bills of Materials</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : boms.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No BOMs found</div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boms.map((bom) => (
                      <TableRow key={bom.id}>
                        <TableCell className="font-medium">{bom.article_name}</TableCell>
                        <TableCell>{bom.color_name}</TableCell>
                        <TableCell>₹{bom.total_cost.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={bom.status === "unassigned" ? "secondary" : "default"}
                            className={bom.status === "unassigned" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}
                            data-testid={`bom-status-${bom.id}`}
                          >
                            {bom.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(bom.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewBOM(bom.id)}
                            data-testid={`view-bom-${bom.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBOM(bom.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid={`delete-bom-${bom.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View BOM Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>BOM Details</DialogTitle>
          </DialogHeader>
          {selectedBOM && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-600">Article</Label>
                  <p className="font-medium">{selectedBOM.article_name}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Color</Label>
                  <p className="font-medium">{selectedBOM.color_name}</p>
                </div>
              </div>
              <div>
                <Label className="text-slate-600 mb-2 block">Materials</Label>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead>Avg Consumption</TableHead>
                        <TableHead>Wastage %</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedBOM.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.material_name}</TableCell>
                          <TableCell>{item.avg_consumption.toFixed(2)}</TableCell>
                          <TableCell>{item.wastage_percent}%</TableCell>
                          <TableCell>{item.total_consumption.toFixed(2)}</TableCell>
                          <TableCell>₹{item.total_cost.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="bg-slate-50 p-3 text-right font-semibold">
                    Total Cost: ₹{selectedBOM.total_cost.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
