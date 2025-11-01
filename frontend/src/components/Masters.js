import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Generic Master Component
function MasterTable({ title, description, columns, data, onAdd, onEdit, onDelete, renderForm, loading }) {
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditItem(null)} className="bg-blue-600 hover:bg-blue-700" data-testid={`add-${title.toLowerCase()}`}>
                <Plus className="w-4 h-4 mr-2" />
                Add {title.slice(0, -1)}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editItem ? "Edit" : "Add"} {title.slice(0, -1)}</DialogTitle>
                <DialogDescription>Fill in the details below</DialogDescription>
              </DialogHeader>
              {renderForm(editItem, (data) => {
                if (editItem) {
                  onEdit(editItem.id, data);
                } else {
                  onAdd(data);
                }
                setOpen(false);
                setEditItem(null);
              })}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No {title.toLowerCase()} found</div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    {columns.map((col) => (
                      <TableCell key={col.key}>{col.render ? col.render(item) : item[col.key]}</TableCell>
                    ))}
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditItem(item);
                          setOpen(true);
                        }}
                        data-testid={`edit-${title.toLowerCase()}-${item.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`delete-${title.toLowerCase()}-${item.id}`}
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
  );
}

export default function Masters({ user, onLogout }) {
  const [buyers, setBuyers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchAllMasters();
  }, []);

  const fetchAllMasters = async () => {
    setLoading(true);
    try {
      const [buyersRes, suppliersRes, materialsRes, colorsRes, sizesRes, articlesRes] = await Promise.all([
        axios.get(`${API}/buyers`),
        axios.get(`${API}/suppliers`),
        axios.get(`${API}/raw-materials`),
        axios.get(`${API}/colors`),
        axios.get(`${API}/sizes`),
        axios.get(`${API}/articles`)
      ]);

      setBuyers(buyersRes.data);
      setSuppliers(suppliersRes.data);
      setMaterials(materialsRes.data);
      setColors(colorsRes.data);
      setSizes(sizesRes.data);
      setArticles(articlesRes.data);
    } catch (error) {
      toast.error("Error fetching masters");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setUploadLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(`${API}/upload-excel`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      toast.success(response.data.message);
      
      const results = response.data.results;
      if (results.errors && results.errors.length > 0) {
        toast.warning(`${results.errors.length} errors occurred during import`);
      }
      
      toast.info(`Added: ${results.colors_added} colors, ${results.articles_added} articles, ${results.sizes_added} units, ${results.raw_materials_added} components`);
      
      setUploadDialogOpen(false);
      setSelectedFile(null);
      fetchAllMasters();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error uploading file");
    } finally {
      setUploadLoading(false);
    }
  };

  // Buyer handlers
  const handleAddBuyer = async (data) => {
    try {
      await axios.post(`${API}/buyers`, data);
      toast.success("Buyer added successfully");
      fetchAllMasters();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error adding buyer");
    }
  };

  const handleEditBuyer = async (id, data) => {
    try {
      await axios.put(`${API}/buyers/${id}`, data);
      toast.success("Buyer updated successfully");
      fetchAllMasters();
    } catch (error) {
      toast.error("Error updating buyer");
    }
  };

  const handleDeleteBuyer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this buyer?")) return;
    try {
      await axios.delete(`${API}/buyers/${id}`);
      toast.success("Buyer deleted successfully");
      fetchAllMasters();
    } catch (error) {
      toast.error("Error deleting buyer");
    }
  };

  // Supplier handlers
  const handleAddSupplier = async (data) => {
    try {
      await axios.post(`${API}/suppliers`, data);
      toast.success("Supplier added successfully");
      fetchAllMasters();
    } catch (error) {
      toast.error("Error adding supplier");
    }
  };

  const handleEditSupplier = async (id, data) => {
    try {
      await axios.put(`${API}/suppliers/${id}`, data);
      toast.success("Supplier updated successfully");
      fetchAllMasters();
    } catch (error) {
      toast.error("Error updating supplier");
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await axios.delete(`${API}/suppliers/${id}`);
      toast.success("Supplier deleted successfully");
      fetchAllMasters();
    } catch (error) {
      toast.error("Error deleting supplier");
    }
  };

  // Raw Material handlers
  const handleAddMaterial = async (data) => {
    try {
      await axios.post(`${API}/raw-materials`, data);
      toast.success("Raw material added successfully");
      fetchAllMasters();
    } catch (error) {
      toast.error("Error adding raw material");
    }
  };

  const handleEditMaterial = async (id, data) => {
    try {
      await axios.put(`${API}/raw-materials/${id}`, data);
      toast.success("Raw material updated successfully");
      fetchAllMasters();
    } catch (error) {
      toast.error("Error updating raw material");
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this raw material?")) return;
    try {
      await axios.delete(`${API}/raw-materials/${id}`);
      toast.success("Raw material deleted successfully");
      fetchAllMasters();
    } catch (error) {
      toast.error("Error deleting raw material");
    }
  };

  // Color handlers
  const handleAddColor = async (data) => {
    try {
      await axios.post(`${API}/colors`, data);
      toast.success("Color added successfully");
      fetchAllMasters();
    } catch (error) {
      toast.error("Error adding color");
    }
  };

  const handleEditColor = async (id, data) => {
    try {
      await axios.put(`${API}/colors/${id}`, data);
      toast.success("Color updated successfully");
      fetchAllMasters();
    } catch (error) {
      toast.error("Error updating color");
    }
  };

  const handleDeleteColor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this color?")) return;
    try {
      await axios.delete(`${API}/colors/${id}`);
      toast.success("Color deleted successfully");
      fetchAllMasters();
    } catch (error) {
      toast.error("Error deleting color");
    }
  };

  // Size handlers
  const handleAddSize = async (data) => {
    try {
      await axios.post(`${API}/sizes`, data);
      toast.success("Size added successfully");
      fetchAllMasters();
    } catch (error) {
      toast.error("Error adding size");
    }
  };

  const handleEditSize = async (id, data) => {
    try {
      await axios.put(`${API}/sizes/${id}`, data);
      toast.success("Size updated successfully");
      fetchAllMasters();
    } catch (error) {
      toast.error("Error updating size");
    }
  };

  const handleDeleteSize = async (id) => {
    if (!window.confirm("Are you sure you want to delete this size?")) return;
    try {
      await axios.delete(`${API}/sizes/${id}`);
      toast.success("Size deleted successfully");
      fetchAllMasters();
    } catch (error) {
      toast.error("Error deleting size");
    }
  };

  // Article handlers
  const handleAddArticle = async (data) => {
    try {
      await axios.post(`${API}/articles`, data);
      toast.success("Article added successfully");
      fetchAllMasters();
    } catch (error) {
      toast.error("Error adding article");
    }
  };

  const handleEditArticle = async (id, data) => {
    try {
      await axios.put(`${API}/articles/${id}`, data);
      toast.success("Article updated successfully");
      fetchAllMasters();
    } catch (error) {
      toast.error("Error updating article");
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      await axios.delete(`${API}/articles/${id}`);
      toast.success("Article deleted successfully");
      fetchAllMasters();
    } catch (error) {
      toast.error("Error deleting article");
    }
  };

  // Form components
  const BuyerForm = (editItem, onSubmit) => {
    const [formData, setFormData] = useState(editItem || {
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: ""
    });

    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }} className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Contact Person</Label>
          <Input value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Address</Label>
          <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Save</Button>
      </form>
    );
  };

  const SupplierForm = (editItem, onSubmit) => {
    const [formData, setFormData] = useState(editItem || {
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      material_type: "fabric"
    });

    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }} className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Contact Person</Label>
          <Input value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Address</Label>
          <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Material Type</Label>
          <select
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={formData.material_type}
            onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
          >
            <option value="fabric">Fabric</option>
            <option value="trims">Trims</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Save</Button>
      </form>
    );
  };

  const MaterialForm = (editItem, onSubmit) => {
    const [formData, setFormData] = useState(editItem || {
      name: "",
      code: "",
      material_type: "fabric",
      unit: "meters",
      cost_per_unit: 0,
      supplier_id: ""
    });

    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }} className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Code</Label>
          <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Material Type</Label>
          <select
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={formData.material_type}
            onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
          >
            <option value="fabric">Fabric</option>
            <option value="trims">Trims</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Unit</Label>
          <select
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          >
            <option value="meters">Meters</option>
            <option value="pieces">Pieces</option>
            <option value="kg">Kilograms</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Cost Per Unit</Label>
          <Input type="number" step="0.01" value={formData.cost_per_unit} onChange={(e) => setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) })} required />
        </div>
        <div className="space-y-2">
          <Label>Supplier (Optional)</Label>
          <select
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={formData.supplier_id}
            onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
          >
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Save</Button>
      </form>
    );
  };

  const ColorForm = (editItem, onSubmit) => {
    const [formData, setFormData] = useState(editItem || {
      name: "",
      code: "",
      hex_value: "#000000"
    });

    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }} className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Code</Label>
          <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Hex Color (Optional)</Label>
          <div className="flex gap-2">
            <Input type="color" value={formData.hex_value || "#000000"} onChange={(e) => setFormData({ ...formData, hex_value: e.target.value })} className="w-20" />
            <Input value={formData.hex_value || ""} onChange={(e) => setFormData({ ...formData, hex_value: e.target.value })} placeholder="#000000" />
          </div>
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Save</Button>
      </form>
    );
  };

  const SizeForm = (editItem, onSubmit) => {
    const [formData, setFormData] = useState(editItem || {
      name: "",
      code: "",
      sort_order: 0
    });

    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }} className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Code</Label>
          <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Sort Order</Label>
          <Input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })} required />
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Save</Button>
      </form>
    );
  };

  const ArticleForm = (editItem, onSubmit) => {
    const [formData, setFormData] = useState(editItem || {
      name: "",
      code: "",
      description: "",
      buyer_id: ""
    });

    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }} className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Code</Label>
          <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Buyer (Optional)</Label>
          <select
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={formData.buyer_id}
            onChange={(e) => setFormData({ ...formData, buyer_id: e.target.value })}
          >
            <option value="">Select Buyer</option>
            {buyers.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Save</Button>
      </form>
    );
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Master Data Management</h1>
            <p className="text-slate-600 mt-1">Manage all master data for garment manufacturing</p>
          </div>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700" data-testid="bulk-upload-button">
                <Plus className="w-4 h-4 mr-2" />
                Bulk Upload Excel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Master Data from Excel</DialogTitle>
                <DialogDescription>
                  Upload an Excel file with sheets: Color ID, Art No., Units Master, Components
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                    data-testid="file-input"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-slate-600">
                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="w-5 h-5 text-green-600" />
                          <span className="font-medium">{selectedFile.name}</span>
                        </div>
                      ) : (
                        <div>
                          <FileText className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                          <p>Click to select Excel file</p>
                          <p className="text-sm text-slate-500 mt-1">Supports .xlsx and .xls</p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
                <Button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || uploadLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                  data-testid="upload-submit-button"
                >
                  {uploadLoading ? "Uploading..." : "Upload & Import"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="buyers" className="space-y-6">{" "}
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="buyers" data-testid="tab-buyers">Buyers</TabsTrigger>
            <TabsTrigger value="suppliers" data-testid="tab-suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="materials" data-testid="tab-materials">Raw Materials</TabsTrigger>
            <TabsTrigger value="colors" data-testid="tab-colors">Colors</TabsTrigger>
            <TabsTrigger value="sizes" data-testid="tab-sizes">Sizes</TabsTrigger>
            <TabsTrigger value="articles" data-testid="tab-articles">Articles</TabsTrigger>
          </TabsList>

          <TabsContent value="buyers">
            <MasterTable
              title="Buyers"
              description="Manage customer/buyer information"
              columns={[
                { key: "name", label: "Name" },
                { key: "contact_person", label: "Contact Person" },
                { key: "email", label: "Email" },
                { key: "phone", label: "Phone" }
              ]}
              data={buyers}
              onAdd={handleAddBuyer}
              onEdit={handleEditBuyer}
              onDelete={handleDeleteBuyer}
              renderForm={BuyerForm}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="suppliers">
            <MasterTable
              title="Suppliers"
              description="Manage supplier/vendor information"
              columns={[
                { key: "name", label: "Name" },
                { key: "contact_person", label: "Contact Person" },
                { key: "email", label: "Email" },
                { key: "material_type", label: "Material Type" }
              ]}
              data={suppliers}
              onAdd={handleAddSupplier}
              onEdit={handleEditSupplier}
              onDelete={handleDeleteSupplier}
              renderForm={SupplierForm}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="materials">
            <MasterTable
              title="Raw Materials"
              description="Manage raw materials including fabric, trims, and accessories"
              columns={[
                { key: "code", label: "Code" },
                { key: "name", label: "Name" },
                { key: "material_type", label: "Type" },
                { key: "unit", label: "Unit" },
                { key: "cost_per_unit", label: "Cost/Unit", render: (item) => `₹${item.cost_per_unit.toFixed(2)}` }
              ]}
              data={materials}
              onAdd={handleAddMaterial}
              onEdit={handleEditMaterial}
              onDelete={handleDeleteMaterial}
              renderForm={MaterialForm}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="colors">
            <MasterTable
              title="Colors"
              description="Manage color master data"
              columns={[
                { key: "code", label: "Code" },
                { key: "name", label: "Name" },
                { 
                  key: "hex_value", 
                  label: "Color", 
                  render: (item) => (
                    <div className="flex items-center gap-2">
                      {item.hex_value && <div className="w-6 h-6 rounded border border-slate-300" style={{ backgroundColor: item.hex_value }}></div>}
                      <span>{item.hex_value || "N/A"}</span>
                    </div>
                  )
                }
              ]}
              data={colors}
              onAdd={handleAddColor}
              onEdit={handleEditColor}
              onDelete={handleDeleteColor}
              renderForm={ColorForm}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="sizes">
            <MasterTable
              title="Sizes"
              description="Manage size master data"
              columns={[
                { key: "code", label: "Code" },
                { key: "name", label: "Name" },
                { key: "sort_order", label: "Sort Order" }
              ]}
              data={sizes}
              onAdd={handleAddSize}
              onEdit={handleEditSize}
              onDelete={handleDeleteSize}
              renderForm={SizeForm}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="articles">
            <MasterTable
              title="Articles"
              description="Manage article/style information"
              columns={[
                { key: "code", label: "Code" },
                { key: "name", label: "Name" },
                { key: "description", label: "Description" }
              ]}
              data={articles}
              onAdd={handleAddArticle}
              onEdit={handleEditArticle}
              onDelete={handleDeleteArticle}
              renderForm={ArticleForm}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
