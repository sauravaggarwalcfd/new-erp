import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { 
  Plus, Edit, Trash2, Upload, Download, ArrowLeft, Search,
  Filter, ArrowUpDown, ArrowUp, ArrowDown, Group, X
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DynamicMasterManager({ config, onBack }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  
  // Advanced filtering, sorting, grouping
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ field: null, direction: null });
  const [groupBy, setGroupBy] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  useEffect(() => {
    fetchData();
  }, [config]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/dynamic-masters/${config.id}/data`);
      setData(response.data);
    } catch (error) {
      toast.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    const initialData = {};
    config.fields.forEach(field => {
      initialData[field.name] = field.defaultValue || "";
    });
    setFormData(initialData);
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await axios.delete(`${API}/dynamic-masters/${config.id}/data/${itemId}`);
      toast.success("Record deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Error deleting record");
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      const missingFields = config.fields
        .filter(f => f.required && !formData[f.name])
        .map(f => f.label);

      if (missingFields.length > 0) {
        toast.error(`Please fill required fields: ${missingFields.join(", ")}`);
        return;
      }

      if (editingItem) {
        await axios.put(`${API}/dynamic-masters/${config.id}/data/${editingItem.id}`, formData);
        toast.success("Record updated successfully");
      } else {
        await axios.post(`${API}/dynamic-masters/${config.id}/data`, formData);
        toast.success("Record created successfully");
      }

      setShowForm(false);
      setFormData({});
      setEditingItem(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error saving record");
    }
  };

  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${API}/dynamic-masters/${config.id}/bulk-upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success(response.data.message);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error uploading file");
    }
  };

  // Filtering logic
  const applyFilters = (items) => {
    let filtered = items;

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(item => {
        return config.fields.some(field => {
          const value = item[field.name];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Apply column filters
    Object.keys(filters).forEach(fieldName => {
      const filterValue = filters[fieldName];
      if (filterValue) {
        filtered = filtered.filter(item => {
          const value = item[fieldName];
          if (value === undefined || value === null) return false;
          return value.toString().toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    return filtered;
  };

  // Sorting logic
  const applySorting = (items) => {
    if (!sortConfig.field) return items;

    const sorted = [...items].sort((a, b) => {
      const aValue = a[sortConfig.field] || "";
      const bValue = b[sortConfig.field] || "";

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = aValue.toString().toLowerCase();
      const bStr = bValue.toString().toLowerCase();

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  // Grouping logic
  const applyGrouping = (items) => {
    if (!groupBy) return { ungrouped: items };

    const grouped = items.reduce((acc, item) => {
      const groupValue = item[groupBy] || "Ungrouped";
      if (!acc[groupValue]) {
        acc[groupValue] = [];
      }
      acc[groupValue].push(item);
      return acc;
    }, {});

    return grouped;
  };

  // Handle sorting
  const handleSort = (fieldName) => {
    let direction = 'asc';
    if (sortConfig.field === fieldName) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }

    setSortConfig({
      field: direction ? fieldName : null,
      direction: direction
    });
  };

  // Handle filter change
  const handleFilterChange = (fieldName, value) => {
    setFilters({
      ...filters,
      [fieldName]: value
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setSortConfig({ field: null, direction: null });
    setGroupBy(null);
  };

  // Process data with filters, sorting, and grouping
  const filteredData = applyFilters(data);
  const sortedData = applySorting(filteredData);
  const groupedData = applyGrouping(sortedData);

  const renderFormField = (field) => {
    const value = formData[field.name] || "";

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            placeholder={field.placeholder}
            rows={3}
          />
        );

      case "dropdown":
        return (
          <select
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case "multiselect":
        return (
          <select
            multiple
            className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={Array.isArray(value) ? value : []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setFormData({ ...formData, [field.name]: selected });
            }}
          >
            {field.options?.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value === true || value === "true"}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
              className="h-4 w-4"
            />
            <span className="text-sm text-slate-600">{field.label}</span>
          </div>
        );

      case "file":
        return (
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setFormData({ ...formData, [field.name]: file.name });
              }
            }}
          />
        );

      case "date":
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
          />
        );

      case "number":
      case "decimal":
        return (
          <Input
            type="number"
            step={field.type === "decimal" ? "0.01" : "1"}
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {config.icon} {config.name}
            </h2>
            <p className="text-slate-600 mt-1">{config.description || "Manage master data"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {config.enableExcelUpload && (
            <>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                className="hidden"
                id="excel-upload"
              />
              <Button variant="outline" onClick={() => document.getElementById("excel-upload").click()}>
                <Upload className="w-4 h-4 mr-2" />
                Excel Upload
              </Button>
            </>
          )}
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      {/* Search and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="flex-1 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search across all fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={showFilterPanel ? "bg-blue-50 text-blue-600" : ""}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters {Object.keys(filters).filter(k => filters[k]).length > 0 && `(${Object.keys(filters).filter(k => filters[k]).length})`}
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            {/* Filter Panel */}
            {showFilterPanel && (
              <div className="border rounded-lg p-4 bg-slate-50">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Advanced Filters
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {config.fields.slice(0, 6).map(field => (
                    <div key={field.id} className="space-y-1">
                      <Label className="text-xs text-slate-600">{field.label}</Label>
                      <Input
                        placeholder={`Filter by ${field.label.toLowerCase()}...`}
                        value={filters[field.name] || ""}
                        onChange={(e) => handleFilterChange(field.name, e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sort and Group Controls */}
            <div className="flex items-center gap-4 pt-2 border-t">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                <Label className="text-sm text-slate-600">Sort By:</Label>
                <select
                  className="flex h-8 rounded-md border border-slate-300 bg-white px-3 text-sm"
                  value={sortConfig.field || ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSortConfig({ field: e.target.value, direction: 'asc' });
                    } else {
                      setSortConfig({ field: null, direction: null });
                    }
                  }}
                >
                  <option value="">None</option>
                  {config.fields.map(field => (
                    <option key={field.id} value={field.name}>{field.label}</option>
                  ))}
                </select>
                {sortConfig.field && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSortConfig({
                      ...sortConfig,
                      direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                    })}
                  >
                    {sortConfig.direction === 'asc' ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Group className="w-4 h-4 text-slate-400" />
                <Label className="text-sm text-slate-600">Group By:</Label>
                <select
                  className="flex h-8 rounded-md border border-slate-300 bg-white px-3 text-sm"
                  value={groupBy || ""}
                  onChange={(e) => setGroupBy(e.target.value || null)}
                >
                  <option value="">None</option>
                  {config.fields.filter(f => f.type === 'dropdown' || f.type === 'text').map(field => (
                    <option key={field.id} value={field.name}>{field.label}</option>
                  ))}
                </select>
              </div>

              <div className="ml-auto text-sm text-slate-600">
                {sortedData.length} {sortedData.length === 1 ? 'record' : 'records'}
                {searchTerm || Object.keys(filters).some(k => filters[k]) ? ` (filtered from ${data.length})` : ''}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Records ({filteredData.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {searchTerm ? "No matching records found" : "No records yet. Click 'Add New' to create one."}
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    {config.fields.slice(0, 6).map(field => (
                      <TableHead key={field.id}>{field.label}</TableHead>
                    ))}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      {config.fields.slice(0, 6).map(field => (
                        <TableCell key={field.id}>
                          {field.type === "checkbox" 
                            ? (item[field.name] ? "✓" : "✗")
                            : Array.isArray(item[field.name])
                            ? item[field.name].join(", ")
                            : item[field.name] || "-"}
                        </TableCell>
                      ))}
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600"
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

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit" : "Add New"} {config.name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {config.fields.map(field => (
              <div key={field.id} className={field.type === "textarea" ? "col-span-2" : ""}>
                <Label>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderFormField(field)}
                {field.helpText && (
                  <p className="text-xs text-slate-500 mt-1">{field.helpText}</p>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              {editingItem ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
