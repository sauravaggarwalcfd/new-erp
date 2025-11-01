import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Trash2, Eye, FileText } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MRPManagement({ user, onLogout }) {
  const [mrps, setMrps] = useState([]);
  const [unassignedBoms, setUnassignedBoms] = useState([]);
  const [selectedBoms, setSelectedBoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedMRP, setSelectedMRP] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mrpsRes, bomsRes] = await Promise.all([
        axios.get(`${API}/mrps`),
        axios.get(`${API}/boms?status=unassigned`)
      ]);

      setMrps(mrpsRes.data);
      setUnassignedBoms(bomsRes.data);
    } catch (error) {
      toast.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const toggleBomSelection = (bomId) => {
    setSelectedBoms(prev =>
      prev.includes(bomId)
        ? prev.filter(id => id !== bomId)
        : [...prev, bomId]
    );
  };

  const handleCreateMRP = async () => {
    if (selectedBoms.length === 0) {
      toast.error("Please select at least one BOM");
      return;
    }

    try {
      await axios.post(`${API}/mrps`, { bom_ids: selectedBoms });
      toast.success("MRP created successfully");
      setCreateOpen(false);
      setSelectedBoms([]);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error creating MRP");
    }
  };

  const handleDeleteMRP = async (id) => {
    if (!window.confirm("Are you sure you want to delete this MRP? This will unassign all BOMs.")) return;
    try {
      await axios.delete(`${API}/mrps/${id}`);
      toast.success("MRP deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Error deleting MRP");
    }
  };

  const viewMRP = async (id) => {
    try {
      const response = await axios.get(`${API}/mrps/${id}`);
      setSelectedMRP(response.data);
      setViewOpen(true);
    } catch (error) {
      toast.error("Error fetching MRP details");
    }
  };

  const exportReport = (mrp) => {
    // Generate CSV report
    let csv = "Material Requirements Planning Report\n\n";
    csv += `MRP Number: ${mrp.mrp_number}\n`;
    csv += `Created: ${new Date(mrp.created_at).toLocaleString()}\n`;
    csv += `Created By: ${mrp.created_by}\n\n`;
    csv += "Material Code,Material Name,Unit,Total Quantity,Cost Per Unit,Total Cost\n";
    
    mrp.material_requirements.forEach(mat => {
      csv += `${mat.material_code},${mat.material_name},${mat.unit},${mat.total_quantity},${mat.cost_per_unit},${mat.total_cost}\n`;
    });
    
    csv += `\nTotal Cost,,,,,${mrp.total_cost}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MRP_${mrp.mrp_number}_Report.csv`;
    a.click();
    toast.success("Report exported successfully");
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">MRP Management</h1>
            <p className="text-slate-600 mt-1">Create and manage Material Requirements Planning</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="create-mrp-button">
                <Plus className="w-4 h-4 mr-2" />
                Create MRP
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create MRP</DialogTitle>
                <DialogDescription>Select BOMs to consolidate into an MRP</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-sm text-slate-600">
                  {unassignedBoms.length} unassigned BOM(s) available
                </div>
                {unassignedBoms.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No unassigned BOMs available. Please create BOMs first.
                  </div>
                ) : (
                  <>
                    <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Select</TableHead>
                            <TableHead>Article</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Total Cost</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {unassignedBoms.map((bom) => (
                            <TableRow key={bom.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedBoms.includes(bom.id)}
                                  onCheckedChange={() => toggleBomSelection(bom.id)}
                                  data-testid={`select-bom-${bom.id}`}
                                />
                              </TableCell>
                              <TableCell>{bom.article_name}</TableCell>
                              <TableCell>{bom.color_name}</TableCell>
                              <TableCell>₹{bom.total_cost.toFixed(2)}</TableCell>
                              <TableCell>{new Date(bom.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <div className="text-sm text-slate-600">
                        {selectedBoms.length} BOM(s) selected
                      </div>
                      <Button
                        onClick={handleCreateMRP}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={selectedBoms.length === 0}
                        data-testid="submit-mrp-button"
                      >
                        Create MRP
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All MRPs</CardTitle>
            <CardDescription>View and manage all Material Requirements Planning</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : mrps.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No MRPs found</div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>MRP Number</TableHead>
                      <TableHead>BOMs Count</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mrps.map((mrp) => (
                      <TableRow key={mrp.id}>
                        <TableCell className="font-medium">{mrp.mrp_number}</TableCell>
                        <TableCell>{mrp.bom_ids.length} BOMs</TableCell>
                        <TableCell>₹{mrp.total_cost.toFixed(2)}</TableCell>
                        <TableCell>{mrp.created_by}</TableCell>
                        <TableCell>{new Date(mrp.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewMRP(mrp.id)}
                            data-testid={`view-mrp-${mrp.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => exportReport(mrp)}
                            className="text-green-600 hover:text-green-700"
                            data-testid={`export-mrp-${mrp.id}`}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMRP(mrp.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid={`delete-mrp-${mrp.id}`}
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

      {/* View MRP Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>MRP Details - {selectedMRP?.mrp_number}</DialogTitle>
          </DialogHeader>
          {selectedMRP && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600">MRP Number</p>
                  <p className="font-semibold">{selectedMRP.mrp_number}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">BOMs Included</p>
                  <p className="font-semibold">{selectedMRP.bom_ids.length} BOMs</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Created By</p>
                  <p className="font-semibold">{selectedMRP.created_by}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Consolidated Material Requirements</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material Code</TableHead>
                        <TableHead>Material Name</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Total Quantity</TableHead>
                        <TableHead>Cost/Unit</TableHead>
                        <TableHead>Total Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedMRP.material_requirements.map((mat, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono">{mat.material_code}</TableCell>
                          <TableCell>{mat.material_name}</TableCell>
                          <TableCell>{mat.unit}</TableCell>
                          <TableCell>{mat.total_quantity.toFixed(2)}</TableCell>
                          <TableCell>₹{mat.cost_per_unit.toFixed(2)}</TableCell>
                          <TableCell className="font-semibold">₹{mat.total_cost.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="bg-slate-50 p-4 text-right">
                    <p className="text-lg font-bold">Grand Total: ₹{selectedMRP.total_cost.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => exportReport(selectedMRP)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
