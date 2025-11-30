import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Trash2, Save, Copy, ArrowLeft } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DynamicBOMForm({ onCancel, onSave, mode = 'create', initialData = null }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [headerData, setHeaderData] = useState({});
  const [fabricTables, setFabricTables] = useState([{ id: 1, name: 'BOM Table 1', items: [] }]);
  const [trimsTables, setTrimsTables] = useState([{ id: 1, name: 'Trims Table 1', items: [] }]);
  const [masterData, setMasterData] = useState({});
  const isReadOnly = mode === 'view';

  useEffect(() => {
    loadConfig();
    loadMasterData();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await axios.get(`${API}/bom-form-config`);
      setConfig(response.data);
      initializeFormData(response.data);
    } catch (error) {
      toast.error('Error loading form configuration');
      // Use default config if not found
      const defaultConfig = getDefaultConfig();
      setConfig(defaultConfig);
      initializeFormData(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultConfig = () => ({
    headerFields: [
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'styleNumber', label: 'Style Number', type: 'text', required: true }
    ],
    fabricTableFields: [
      { name: 'srNo', label: 'SR NO', type: 'number', required: true },
      { name: 'comboName', label: 'COMBO NAME', type: 'text', required: true }
    ],
    trimsTableFields: [
      { name: 'srNo', label: 'SR NO', type: 'number', required: true },
      { name: 'itemName', label: 'ITEM NAME', type: 'text', required: true }
    ]
  });

  const initializeFormData = (cfg) => {
    // Initialize header with default values
    const initialHeader = {};
    cfg.headerFields.forEach(field => {
      initialHeader[field.name] = field.defaultValue || '';
    });
    setHeaderData(initialHeader);

    // Initialize first row for fabric table
    const fabricRow = {};
    cfg.fabricTableFields.forEach(field => {
      fabricRow[field.name] = field.defaultValue || '';
    });
    fabricRow.srNo = 1;
    setFabricTables([{ id: 1, name: 'BOM Table 1', items: [fabricRow] }]);

    // Initialize first row for trims table
    const trimsRow = {};
    cfg.trimsTableFields.forEach(field => {
      trimsRow[field.name] = field.defaultValue || '';
    });
    trimsRow.srNo = 1;
    setTrimsTables([{ id: 1, name: 'Trims Table 1', items: [trimsRow] }]);
  };

  const loadMasterData = async () => {
    try {
      const masterSources = [
        'buyers',
        'suppliers',
        'colors',
        'articles',
        'sizes',
        'raw-materials'
      ];

      const promises = masterSources.map(source =>
        axios.get(`${API}/${source}`).catch(() => ({ data: [] }))
      );

      // Load fabric master with dynamic endpoint
      promises.push(
        axios.get(`${API}/dynamic-masters/fabric_master_excel/data`).catch(() => ({ data: [] }))
      );

      const results = await Promise.all(promises);

      const data = {
        buyers: results[0].data,
        suppliers: results[1].data,
        colors: results[2].data,
        articles: results[3].data,
        sizes: results[4].data,
        'raw-materials': results[5].data,
        fabric_master_excel: results[6].data
      };

      setMasterData(data);
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  const handleHeaderChange = (fieldName, value) => {
    setHeaderData({ ...headerData, [fieldName]: value });
  };

  const addFabricRow = (tableId) => {
    const table = fabricTables.find(t => t.id === tableId);
    const newRow = {};
    config.fabricTableFields.forEach(field => {
      newRow[field.name] = field.defaultValue || '';
    });
    newRow.srNo = table.items.length + 1;

    const updatedTables = fabricTables.map(t =>
      t.id === tableId ? { ...t, items: [...t.items, newRow] } : t
    );
    setFabricTables(updatedTables);
  };

  const addNewFabricTable = () => {
    const newId = Math.max(...fabricTables.map(t => t.id), 0) + 1;
    const newRow = {};
    config.fabricTableFields.forEach(field => {
      newRow[field.name] = field.defaultValue || '';
    });
    newRow.srNo = 1;

    const newTable = {
      id: newId,
      name: `BOM Table ${newId}`,
      items: [newRow]
    };
    setFabricTables([...fabricTables, newTable]);

    // Auto-create corresponding TRIMS table
    const newTrimsRow = {};
    config.trimsTableFields.forEach(field => {
      newTrimsRow[field.name] = field.defaultValue || '';
    });
    newTrimsRow.srNo = 1;

    const newTrimsTable = {
      id: newId,
      name: `Trims for BOM Table ${newId}`,
      items: [newTrimsRow]
    };
    setTrimsTables([...trimsTables, newTrimsTable]);

    toast.success('New FABRIC and TRIMS tables added');
  };

  const copyFabricTable = (tableId) => {
    const tableToCopy = fabricTables.find(t => t.id === tableId);
    if (tableToCopy) {
      const newId = Math.max(...fabricTables.map(t => t.id), 0) + 1;
      const copiedTable = {
        id: newId,
        name: `${tableToCopy.name} (Copy)`,
        items: tableToCopy.items.map(item => ({ ...item }))
      };
      setFabricTables([...fabricTables, copiedTable]);

      // Auto-copy corresponding TRIMS table
      const trimsToCopy = trimsTables.find(t => t.id === tableId);
      if (trimsToCopy) {
        const copiedTrimsTable = {
          id: newId,
          name: `Trims for ${tableToCopy.name} (Copy)`,
          items: trimsToCopy.items.map(item => ({ ...item }))
        };
        setTrimsTables([...trimsTables, copiedTrimsTable]);
      }

      toast.success('FABRIC and TRIMS tables copied successfully');
    }
  };

  const deleteFabricTable = (tableId) => {
    if (fabricTables.length === 1) {
      toast.error('Cannot delete the last table');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this FABRIC table and its corresponding TRIMS table?')) return;

    setFabricTables(fabricTables.filter(t => t.id !== tableId));
    setTrimsTables(trimsTables.filter(t => t.id !== tableId));
    toast.success('Tables deleted successfully');
  };

  const addTrimsRow = (tableId) => {
    const table = trimsTables.find(t => t.id === tableId);
    const newRow = {};
    config.trimsTableFields.forEach(field => {
      newRow[field.name] = field.defaultValue || '';
    });
    newRow.srNo = table.items.length + 1;

    const updatedTables = trimsTables.map(t =>
      t.id === tableId ? { ...t, items: [...t.items, newRow] } : t
    );
    setTrimsTables(updatedTables);
  };

  const addNewTrimsTable = () => {
    const newId = Math.max(...trimsTables.map(t => t.id), 0) + 1;
    const newRow = {};
    config.trimsTableFields.forEach(field => {
      newRow[field.name] = field.defaultValue || '';
    });
    newRow.srNo = 1;

    const newTable = {
      id: newId,
      name: `Trims Table ${newId}`,
      items: [newRow]
    };
    setTrimsTables([...trimsTables, newTable]);
    toast.success('New TRIMS table added');
  };

  const copyTrimsTable = (tableId) => {
    const tableToCopy = trimsTables.find(t => t.id === tableId);
    if (tableToCopy) {
      const newId = Math.max(...trimsTables.map(t => t.id), 0) + 1;
      const copiedTable = {
        id: newId,
        name: `${tableToCopy.name} (Copy)`,
        items: tableToCopy.items.map(item => ({ ...item }))
      };
      setTrimsTables([...trimsTables, copiedTable]);
      toast.success('TRIMS table copied successfully');
    }
  };

  const deleteTrimsTable = (tableId) => {
    if (trimsTables.length === 1) {
      toast.error('Cannot delete the last table');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this TRIMS table?')) return;

    setTrimsTables(trimsTables.filter(t => t.id !== tableId));
    toast.success('Table deleted successfully');
  };

  const updateFabricItem = (tableId, rowIndex, fieldName, value) => {
    const updatedTables = fabricTables.map(table => {
      if (table.id === tableId) {
        const updatedItems = table.items.map((item, idx) => {
          if (idx === rowIndex) {
            const updatedItem = { ...item, [fieldName]: value };
            // Handle calculated fields
            const field = config.fabricTableFields.find(f => f.name === fieldName);
            if (field && field.type === 'calculated') {
              updatedItem[fieldName] = evaluateCalculation(field.calculation, updatedItem);
            }
            return updatedItem;
          }
          return item;
        });
        return { ...table, items: updatedItems };
      }
      return table;
    });
    setFabricTables(updatedTables);
  };

  const updateTrimsItem = (tableId, rowIndex, fieldName, value) => {
    const updatedTables = trimsTables.map(table => {
      if (table.id === tableId) {
        const updatedItems = table.items.map((item, idx) => {
          if (idx === rowIndex) {
            const updatedItem = { ...item, [fieldName]: value };
            // Handle calculated fields
            const field = config.trimsTableFields.find(f => f.name === fieldName);
            if (field && field.type === 'calculated') {
              updatedItem[fieldName] = evaluateCalculation(field.calculation, updatedItem);
            }
            return updatedItem;
          }
          return item;
        });
        return { ...table, items: updatedItems };
      }
      return table;
    });
    setTrimsTables(updatedTables);
  };

  const evaluateCalculation = (formula, item) => {
    try {
      // Replace field names with values
      let expression = formula;
      Object.keys(item).forEach(key => {
        const value = parseFloat(item[key]) || 0;
        expression = expression.replace(new RegExp(key, 'g'), value.toString());
      });
      // Evaluate the expression
      return eval(expression) || 0;
    } catch (error) {
      return 0;
    }
  };

  const deleteFabricRow = (tableId, rowIndex) => {
    const updatedTables = fabricTables.map(table => {
      if (table.id === tableId) {
        const updatedItems = table.items.filter((_, idx) => idx !== rowIndex);
        // Renumber rows
        updatedItems.forEach((item, idx) => item.srNo = idx + 1);
        return { ...table, items: updatedItems };
      }
      return table;
    });
    setFabricTables(updatedTables);
  };

  const deleteTrimsRow = (tableId, rowIndex) => {
    const updatedTables = trimsTables.map(table => {
      if (table.id === tableId) {
        const updatedItems = table.items.filter((_, idx) => idx !== rowIndex);
        // Renumber rows
        updatedItems.forEach((item, idx) => item.srNo = idx + 1);
        return { ...table, items: updatedItems };
      }
      return table;
    });
    setTrimsTables(updatedTables);
  };

  const handleSave = async () => {
    // Validate required header fields
    const missingFields = config.headerFields
      .filter(f => f.required && !headerData[f.name])
      .map(f => f.label);

    if (missingFields.length > 0) {
      toast.error(`Please fill required fields: ${missingFields.join(', ')}`);
      return;
    }

    const bomData = {
      header: headerData,
      fabricTables: fabricTables,
      trimsTables: trimsTables,
      config: config
    };

    onSave(bomData);
  };

  const renderFormField = (field, value, onChange) => {
    switch (field.type) {
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadOnly}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={isReadOnly}
            className="h-9 text-sm"
          />
        );

      case 'textarea':
        return (
          <textarea
            className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            disabled={isReadOnly}
          />
        );

      case 'dropdown':
        return (
          <select
            className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadOnly}
          >
            <option value="">Select...</option>
            <option value="kg">Kg</option>
            <option value="meter">Meter</option>
            <option value="pcs">Pcs</option>
          </select>
        );

      case 'master-dropdown':
        const masterOptions = masterData[field.masterSource] || [];
        return (
          <select
            className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadOnly}
          >
            <option value="">Select {field.label}</option>
            {masterOptions.map((option, idx) => (
              <option key={option.id || idx} value={option.id || option[field.masterDisplayField]}>
                {option[field.masterDisplayField] || option.name || 'Unknown'}
              </option>
            ))}
          </select>
        );

      case 'calculated':
        return (
          <Input
            type="number"
            value={value}
            disabled
            className="bg-slate-100"
          />
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={isReadOnly}
            className="w-5 h-5"
          />
        );

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={isReadOnly}
          />
        );
    }
  };

  if (loading || !config) {
    return <div className="flex items-center justify-center h-64">Loading form...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 -m-8">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-full px-6 py-4">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={onCancel}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to BOM Management
            </Button>
            {!isReadOnly && (
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Save BOM
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-full px-6 py-6 space-y-6">

        {/* Header Section */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-2xl">DYEING BOM SHEET</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {config.headerFields.map(field => (
              <div key={field.name} className="space-y-2">
                <Label>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderFormField(
                  field,
                  headerData[field.name] || '',
                  (value) => handleHeaderChange(field.name, value)
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="fabric" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 bg-white border">
          <TabsTrigger value="fabric" className="text-lg font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            📦 FABRIC
          </TabsTrigger>
          <TabsTrigger value="trims" className="text-lg font-semibold data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            ✂️ TRIMS
          </TabsTrigger>
        </TabsList>

        {/* Fabric Tab */}
        <TabsContent value="fabric" className="space-y-6">
          {/* Table Management Buttons */}
          {!isReadOnly && (
            <div className="flex gap-3 mb-4">
              <Button onClick={addNewFabricTable} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Table
              </Button>
            </div>
          )}

          {fabricTables.map(table => (
            <Card key={table.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Input
                    value={table.name}
                    onChange={(e) => {
                      const updatedTables = fabricTables.map(t =>
                        t.id === table.id ? { ...t, name: e.target.value } : t
                      );
                      setFabricTables(updatedTables);
                    }}
                    className="font-semibold text-lg border-none shadow-none w-auto"
                    disabled={isReadOnly}
                  />
                  {!isReadOnly && (
                    <div className="flex gap-2">
                      <Button onClick={() => copyFabricTable(table.id)} variant="outline" size="sm">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Table
                      </Button>
                      <Button onClick={() => addFabricRow(table.id)} className="bg-green-600 hover:bg-green-700" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Row
                      </Button>
                      {fabricTables.length > 1 && (
                        <Button onClick={() => deleteFabricTable(table.id)} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Table
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-slate-100">
                        {config.fabricTableFields.map(field => (
                          <TableHead 
                            key={field.name} 
                            style={{ 
                              minWidth: field.width || '150px',
                              maxWidth: field.width || 'auto'
                            }}
                            className="text-xs font-semibold whitespace-nowrap px-2 py-3"
                          >
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </TableHead>
                        ))}
                        {!isReadOnly && <TableHead className="w-20 text-center text-xs font-semibold px-2 py-3">ACTIONS</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table.items.map((item, rowIndex) => (
                        <TableRow key={rowIndex} className="hover:bg-slate-50">
                          {config.fabricTableFields.map(field => (
                            <TableCell key={field.name} className="px-2 py-2">
                              <div style={{ minWidth: field.width || '150px' }}>
                                {renderFormField(
                                  field,
                                  item[field.name] || '',
                                  (value) => updateFabricItem(table.id, rowIndex, field.name, value)
                                )}
                              </div>
                            </TableCell>
                          ))}
                          {!isReadOnly && (
                            <TableCell className="text-center px-2 py-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteFabricRow(table.id, rowIndex)}
                                className="text-red-600 h-8 w-8 p-0"
                                disabled={table.items.length === 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Trims Tab */}
        <TabsContent value="trims" className="space-y-6">
          {/* Table Management Buttons */}
          {!isReadOnly && (
            <div className="flex gap-3 mb-4">
              <Button onClick={addNewTrimsTable} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Table
              </Button>
            </div>
          )}

          {trimsTables.map(table => (
            <Card key={table.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Input
                    value={table.name}
                    onChange={(e) => {
                      const updatedTables = trimsTables.map(t =>
                        t.id === table.id ? { ...t, name: e.target.value } : t
                      );
                      setTrimsTables(updatedTables);
                    }}
                    className="font-semibold text-lg border-none shadow-none w-auto"
                    disabled={isReadOnly}
                  />
                  {!isReadOnly && (
                    <div className="flex gap-2">
                      <Button onClick={() => copyTrimsTable(table.id)} variant="outline" size="sm">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Table
                      </Button>
                      <Button onClick={() => addTrimsRow(table.id)} className="bg-purple-600 hover:bg-purple-700" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Row
                      </Button>
                      {trimsTables.length > 1 && (
                        <Button onClick={() => deleteTrimsTable(table.id)} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Table
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-slate-100">
                        {config.trimsTableFields.map(field => (
                          <TableHead 
                            key={field.name} 
                            style={{ 
                              minWidth: field.width || '150px',
                              maxWidth: field.width || 'auto'
                            }}
                            className="text-xs font-semibold whitespace-nowrap px-2 py-3"
                          >
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </TableHead>
                        ))}
                        {!isReadOnly && <TableHead className="w-20 text-center text-xs font-semibold px-2 py-3">ACTIONS</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table.items.map((item, rowIndex) => (
                        <TableRow key={rowIndex} className="hover:bg-slate-50">
                          {config.trimsTableFields.map(field => (
                            <TableCell key={field.name} className="px-2 py-2">
                              <div style={{ minWidth: field.width || '150px' }}>
                                {renderFormField(
                                  field,
                                  item[field.name] || '',
                                  (value) => updateTrimsItem(table.id, rowIndex, field.name, value)
                                )}
                              </div>
                            </TableCell>
                          ))}
                          {!isReadOnly && (
                            <TableCell className="text-center px-2 py-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTrimsRow(table.id, rowIndex)}
                                className="text-red-600 h-8 w-8 p-0"
                                disabled={table.items.length === 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
