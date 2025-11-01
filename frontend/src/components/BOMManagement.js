import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "@/components/Layout";
import BOMCreate from "@/components/BOMCreate";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Eye } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function BOMManagement({ user, onLogout }) {
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedBOM, setSelectedBOM] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" | "view" | "create"

  useEffect(() => {
    fetchBOMs();
  }, []);

  const fetchBOMs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/boms`);
      setBoms(response.data);
    } catch (error) {
      toast.error("Error fetching BOMs");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBOM = async (bomData) => {
    try {
      if (selectedBOM) {
        // Update existing BOM
        await axios.put(`${API}/boms/${selectedBOM.id}`, bomData);
        toast.success("BOM updated successfully");
      } else {
        // Create new BOM
        await axios.post(`${API}/boms/comprehensive`, bomData);
        toast.success("BOM created successfully");
      }
      setShowCreateForm(false);
      setSelectedBOM(null);
      setViewMode("list");
      fetchBOMs();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error saving BOM");
    }
  };

  const handleViewBOM = async (bom) => {
    try {
      // Fetch full BOM details
      const response = await axios.get(`${API}/boms/${bom.id}`);
      setSelectedBOM(response.data);
      setViewMode("view");
    } catch (error) {
      toast.error("Error loading BOM details");
    }
  };

  const handleEditBOM = () => {
    setViewMode("edit");
  };

  const handleCancelView = () => {
    setSelectedBOM(null);
    setViewMode("list");
  };

  const handleDeleteBOM = async (id) => {
    if (!window.confirm("Are you sure you want to delete this BOM?")) return;
    try {
      await axios.delete(`${API}/boms/${id}`);
      toast.success("BOM deleted successfully");
      fetchBOMs();
    } catch (error) {
      toast.error("Error deleting BOM");
    }
  };

  if (showCreateForm) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <BOMCreate
          onCancel={() => setShowCreateForm(false)}
          onSave={handleSaveBOM}
        />
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">BOM Management</h1>
            <p className="text-slate-600 mt-1">Create and manage Bills of Materials</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="create-bom-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create BOM
          </Button>
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
              <div className="text-center py-8 text-slate-500">No BOMs found. Click "Create BOM" to get started.</div>
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
                        <TableCell className="font-medium">{bom.article_name || bom.header?.styleNumber || "N/A"}</TableCell>
                        <TableCell>{bom.color_name || "N/A"}</TableCell>
                        <TableCell>₹{bom.total_cost?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={bom.status === "unassigned" ? "secondary" : "default"}
                            className={bom.status === "unassigned" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}
                          >
                            {bom.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(bom.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBOM(bom.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
    </Layout>
  );
}
