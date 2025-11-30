import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, Settings, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'date', label: 'Date Picker' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'master-dropdown', label: 'Master Dropdown' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'calculated', label: 'Calculated Field' }
];

const AVAILABLE_MASTERS = [
  { value: 'buyers', label: 'Buyers' },
  { value: 'suppliers', label: 'Suppliers' },
  { value: 'colors', label: 'Colors' },
  { value: 'articles', label: 'Articles' },
  { value: 'sizes', label: 'Sizes' },
  { value: 'raw-materials', label: 'Raw Materials' },
  { value: 'fabric_master_excel', label: 'Fabric Master' }
];

export default function BOMFormBuilder({ user, onLogout }) {
  const [config, setConfig] = useState({
    headerFields: [],
    fabricTableFields: [],
    trimsTableFields: []
  });
  const [loading, setLoading] = useState(false);
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [currentSection, setCurrentSection] = useState('header');
  const [fieldForm, setFieldForm] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    defaultValue: '',
    masterSource: '',
    masterDisplayField: 'name',
    calculation: '',
    width: 'auto',
    order: 0
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/bom-form-config`);
      if (response.data) {
        setConfig(response.data);
      }
    } catch (error) {
      // If config doesn't exist, create default
      setConfig(getDefaultConfig());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultConfig = () => ({
    headerFields: [
      { name: 'date', label: 'Date', type: 'date', required: true, order: 0 },
      { name: 'imageReference', label: 'Image Reference', type: 'text', required: false, order: 1 },
      { name: 'artNo', label: 'Art No', type: 'master-dropdown', required: true, masterSource: 'articles', masterDisplayField: 'code', order: 2 },
      { name: 'planQty', label: 'Plan Qty', type: 'number', required: false, order: 3 },
      { name: 'setNo', label: 'Set No', type: 'text', required: false, order: 4 },
      { name: 'buyer', label: 'Buyer', type: 'master-dropdown', required: false, masterSource: 'buyers', masterDisplayField: 'name', order: 5 },
      { name: 'styleNumber', label: 'Style Number', type: 'text', required: true, order: 6 },
      { name: 'remarks', label: 'Remarks', type: 'textarea', required: false, order: 7 }
    ],
    fabricTableFields: [
      { name: 'srNo', label: 'SR NO', type: 'number', required: true, width: '80px', order: 0 },
      { name: 'comboName', label: 'COMBO NAME', type: 'text', required: true, width: '200px', order: 1 },
      { name: 'lotNo', label: 'LOT NO', type: 'text', required: false, width: '100px', order: 2 },
      { name: 'lotCount', label: 'LOT COUNT', type: 'number', required: false, width: '100px', order: 3 },
      { name: 'colour', label: 'COLOUR', type: 'master-dropdown', required: false, masterSource: 'colors', masterDisplayField: 'name', width: '150px', order: 4 },
      { name: 'fabricQuality', label: 'FABRIC QUALITY', type: 'master-dropdown', required: false, masterSource: 'fabric_master_excel', masterDisplayField: 'FABRIC NAME', width: '250px', order: 5 },
      { name: 'fcNo', label: 'FC NO', type: 'text', required: false, width: '100px', order: 6 },
      { name: 'planRat', label: 'PLAN RAT', type: 'number', required: false, width: '100px', order: 7 },
      { name: 'gsm', label: 'GSM', type: 'number', required: false, width: '100px', order: 8 },
      { name: 'priority', label: 'PRIORITY', type: 'text', required: false, width: '100px', order: 9 },
      { name: 'component', label: 'COMPONENT', type: 'text', required: false, width: '200px', order: 10 },
      { name: 'avgUnit', label: 'AVG UNIT', type: 'dropdown', required: false, width: '100px', order: 11 },
      { name: 'orderPcs', label: 'ORDER (PCS)', type: 'number', required: false, width: '120px', order: 12 },
      { name: 'extraPcs', label: 'EXTRA PCS', type: 'number', required: false, width: '120px', order: 13 },
      { name: 'wastagePcs', label: 'WASTAGE PCS', type: 'number', required: false, width: '120px', order: 14 },
      { name: 'readyFabricNeed', label: 'READY FABRIC', type: 'calculated', required: false, width: '120px', calculation: 'orderPcs + extraPcs + wastagePcs', order: 15 },
      { name: 'shortage', label: 'SHORTAGE', type: 'number', required: false, width: '120px', order: 16 },
      { name: 'greigeFabricNeed', label: 'GREIGE FABRIC', type: 'calculated', required: false, width: '120px', calculation: 'readyFabricNeed - shortage', order: 17 }
    ],
    trimsTableFields: [
      { name: 'srNo', label: 'SR NO', type: 'number', required: true, width: '80px', order: 0 },
      { name: 'comboName', label: 'COMBO NAME', type: 'text', required: false, width: '200px', order: 1 },
      { name: 'trimType', label: 'TRIM TYPE', type: 'text', required: false, width: '150px', order: 2 },
      { name: 'itemName', label: 'ITEM NAME', type: 'text', required: false, width: '200px', order: 3 },
      { name: 'itemCode', label: 'ITEM CODE', type: 'text', required: false, width: '150px', order: 4 },
      { name: 'color', label: 'COLOR', type: 'master-dropdown', required: false, masterSource: 'colors', masterDisplayField: 'name', width: '150px', order: 5 },
      { name: 'size', label: 'SIZE', type: 'master-dropdown', required: false, masterSource: 'sizes', masterDisplayField: 'name', width: '100px', order: 6 },
      { name: 'quantity', label: 'QUANTITY', type: 'number', required: false, width: '100px', order: 7 },
      { name: 'supplier', label: 'SUPPLIER', type: 'master-dropdown', required: false, masterSource: 'suppliers', masterDisplayField: 'name', width: '200px', order: 8 },
      { name: 'unitPrice', label: 'UNIT PRICE', type: 'number', required: false, width: '120px', order: 9 },
      { name: 'totalCost', label: 'TOTAL COST', type: 'calculated', required: false, width: '120px', calculation: 'quantity * unitPrice', order: 10 }
    ]
  });

  const saveConfig = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/bom-form-config`, config);
      toast.success('BOM Form configuration saved successfully!');
    } catch (error) {
      toast.error('Error saving configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = () => {
    setEditingField(null);
    setFieldForm({
      name: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      defaultValue: '',
      masterSource: '',
      masterDisplayField: 'name',
      calculation: '',
      width: 'auto',
      order: getCurrentFields().length
    });
    setShowFieldDialog(true);
  };

  const handleEditField = (field, index) => {
    setEditingField({ ...field, index });
    setFieldForm({ ...field });
    setShowFieldDialog(true);
  };

  const handleDeleteField = (index) => {
    if (!window.confirm('Are you sure you want to delete this field?')) return;
    
    const sectionKey = getSectionKey();
    const updatedFields = config[sectionKey].filter((_, i) => i !== index);
    setConfig({ ...config, [sectionKey]: updatedFields });
    toast.success('Field deleted');
  };

  const handleSaveField = () => {
    const sectionKey = getSectionKey();
    
    if (!fieldForm.name || !fieldForm.label) {
      toast.error('Name and Label are required');
      return;
    }

    if (editingField !== null) {
      // Update existing field
      const updatedFields = [...config[sectionKey]];
      updatedFields[editingField.index] = fieldForm;
      setConfig({ ...config, [sectionKey]: updatedFields });
      toast.success('Field updated');
    } else {
      // Add new field
      setConfig({
        ...config,
        [sectionKey]: [...config[sectionKey], fieldForm]
      });
      toast.success('Field added');
    }
    
    setShowFieldDialog(false);
  };

  const handleMoveField = (index, direction) => {
    const sectionKey = getSectionKey();
    const fields = [...config[sectionKey]];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= fields.length) return;
    
    [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
    fields.forEach((field, i) => field.order = i);
    
    setConfig({ ...config, [sectionKey]: fields });
  };

  const getSectionKey = () => {
    switch (currentSection) {
      case 'header': return 'headerFields';
      case 'fabric': return 'fabricTableFields';
      case 'trims': return 'trimsTableFields';
      default: return 'headerFields';
    }
  };

  const getCurrentFields = () => {
    return config[getSectionKey()] || [];
  };

  const renderFieldsList = () => {
    const fields = getCurrentFields();
    
    return (
      <div className="space-y-2">
        {fields.map((field, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <GripVertical className="w-5 h-5 text-slate-400" />
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{field.label}</div>
                    <div className="text-sm text-slate-600">
                      Name: <code className="bg-slate-100 px-2 py-0.5 rounded">{field.name}</code>
                      {' '} | Type: <span className="text-blue-600">{field.type}</span>
                      {field.masterSource && (
                        <span> | Master: <span className="text-green-600">{field.masterSource}</span></span>
                      )}
                      {field.required && <span className="ml-2 text-red-600 font-medium">*Required</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleMoveField(index, 'up')} disabled={index === 0}>
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleMoveField(index, 'down')} disabled={index === fields.length - 1}>
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditField(field, index)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteField(index)} className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            BOM Form Builder
          </h1>
          <p className="text-slate-600 mt-2">Configure Dyeing BOM Sheet fields and link to masters</p>
        </div>
        <Button onClick={saveConfig} className="bg-green-600 hover:bg-green-700" disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          Save Configuration
        </Button>
      </div>

      {/* Tabs for different sections */}
      <Tabs value={currentSection} onValueChange={setCurrentSection} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-14 bg-white border">
          <TabsTrigger value="header" className="text-lg font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            📋 Header Fields
          </TabsTrigger>
          <TabsTrigger value="fabric" className="text-lg font-semibold data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            📦 Fabric Table
          </TabsTrigger>
          <TabsTrigger value="trims" className="text-lg font-semibold data-[state=active]:bg-green-600 data-[state=active]:text-white">
            ✂️ Trims Table
          </TabsTrigger>
        </TabsList>

        <TabsContent value="header" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Header Fields Configuration</CardTitle>
                  <CardDescription>Manage fields displayed at the top of the BOM sheet</CardDescription>
                </div>
                <Button onClick={handleAddField} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Header Field
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderFieldsList()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fabric" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Fabric Table Columns</CardTitle>
                  <CardDescription>Configure columns for the fabric BOM table</CardDescription>
                </div>
                <Button onClick={handleAddField} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Fabric Column
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderFieldsList()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trims" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Trims Table Columns</CardTitle>
                  <CardDescription>Configure columns for the trims table</CardDescription>
                </div>
                <Button onClick={handleAddField} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Trims Column
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderFieldsList()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Field Editor Dialog */}
      <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingField ? 'Edit Field' : 'Add New Field'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Field Name (Code) *</Label>
              <Input
                value={fieldForm.name}
                onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value.replace(/\s/g, '') })}
                placeholder="e.g., fabricType"
              />
              <p className="text-xs text-slate-500">No spaces, camelCase recommended</p>
            </div>
            <div className="space-y-2">
              <Label>Field Label (Display) *</Label>
              <Input
                value={fieldForm.label}
                onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                placeholder="e.g., Fabric Type"
              />
            </div>
            <div className="space-y-2">
              <Label>Field Type *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                value={fieldForm.type}
                onChange={(e) => setFieldForm({ ...fieldForm, type: e.target.value })}
              >
                {FIELD_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Width</Label>
              <Input
                value={fieldForm.width}
                onChange={(e) => setFieldForm({ ...fieldForm, width: e.target.value })}
                placeholder="e.g., 200px or auto"
              />
            </div>

            {(fieldForm.type === 'master-dropdown') && (
              <>
                <div className="space-y-2">
                  <Label>Master Source *</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    value={fieldForm.masterSource}
                    onChange={(e) => setFieldForm({ ...fieldForm, masterSource: e.target.value })}
                  >
                    <option value="">Select Master</option>
                    {AVAILABLE_MASTERS.map(master => (
                      <option key={master.value} value={master.value}>{master.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Display Field</Label>
                  <Input
                    value={fieldForm.masterDisplayField}
                    onChange={(e) => setFieldForm({ ...fieldForm, masterDisplayField: e.target.value })}
                    placeholder="name, code, etc."
                  />
                </div>
              </>
            )}

            {fieldForm.type === 'calculated' && (
              <div className="space-y-2 col-span-2">
                <Label>Calculation Formula</Label>
                <Input
                  value={fieldForm.calculation}
                  onChange={(e) => setFieldForm({ ...fieldForm, calculation: e.target.value })}
                  placeholder="e.g., quantity * unitPrice"
                />
                <p className="text-xs text-slate-500">Use field names to reference other fields</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Placeholder</Label>
              <Input
                value={fieldForm.placeholder}
                onChange={(e) => setFieldForm({ ...fieldForm, placeholder: e.target.value })}
                placeholder="Enter placeholder text"
              />
            </div>
            <div className="space-y-2">
              <Label>Default Value</Label>
              <Input
                value={fieldForm.defaultValue}
                onChange={(e) => setFieldForm({ ...fieldForm, defaultValue: e.target.value })}
                placeholder="Enter default value"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={fieldForm.required}
                  onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="required" className="cursor-pointer">Required Field</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowFieldDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveField} className="bg-blue-600 hover:bg-blue-700">
              {editingField ? 'Update' : 'Add'} Field
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
