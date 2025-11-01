import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Save, Copy, FileText } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function BOMCreate({ onCancel, onSave, onEdit, mode = "create", initialData = null }) {
  const [articles, setArticles] = useState([]);
  const [colors, setColors] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isEditMode, setIsEditMode] = useState(mode === "edit");

  // Header data (shared across all tabs)
  const [headerData, setHeaderData] = useState({
    date: new Date().toISOString().split('T')[0],
    imageReference: "",
    artNo: "",
    planQty: "",
    setNo: "",
    buyer: "",
    remarks: "",
    styleNumber: ""
  });

  // FABRIC Tab - Multiple BOM tables
  const [bomTables, setBomTables] = useState([
    {
      id: 1,
      name: "BOM Table 1",
      items: [
        {
          srNo: 1,
          comboName: "",
          lotNo: "",
          lotCount: "",
          colourId: "",
          colourCode: "",
          colour: "",
          fabricQuality: "",
          fcNo: "",
          planRat: "",
          gsm: "",
          priority: "",
          component: "",
          avgUnit: "kg",
          orderPcs: "",
          extraPcs: "",
          wastagePcs: "",
          readyFabricNeed: "",
          shortage: "",
          greigeFabricNeed: ""
        }
      ]
    }
  ]);

  // TRIMS Tab - Multiple tables synchronized with FABRIC tables
  const [trimsTables, setTrimsTables] = useState([
    {
      id: 1,
      name: "Trims for BOM Table 1",
      items: [
        {
          srNo: 1,
          comboName: "", // From corresponding FABRIC tab
          trimType: "",
          itemName: "",
          itemCode: "",
          color: "",
          size: "",
          quantity: "",
          supplier: "",
          unitPrice: "",
          totalCost: ""
        }
      ]
    }
  ]);

  // OPERATIONS Tab - Operations routing
  const [operationsItems, setOperationsItems] = useState([
    {
      srNo: 1,
      sequenceType: "Fixed",
      operationName: "",
      department: "",
      machineType: "",
      sam: "",
      workers: "",
      outputPerHour: "",
      costPerPiece: "",
      remarks: ""
    }
  ]);

  useEffect(() => {
    fetchMasterData();
    
    // Load initial data if in view/edit mode
    if (initialData) {
      loadInitialData(initialData);
    }
  }, []);

  useEffect(() => {
    // Update edit mode when mode prop changes
    setIsEditMode(mode === "edit");
  }, [mode]);

  const loadInitialData = (data) => {
    if (data.header) {
      setHeaderData(data.header);
    }
    if (data.fabricTables) {
      setBomTables(data.fabricTables);
    }
    if (data.trimsTables) {
      setTrimsTables(data.trimsTables);
    }
    if (data.operations) {
      setOperationsItems(data.operations);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [articlesRes, colorsRes, fabricsRes, buyersRes, suppliersRes] = await Promise.all([
        axios.get(`${API}/articles`),
        axios.get(`${API}/colors`),
        axios.get(`${API}/fabrics`),
        axios.get(`${API}/buyers`),
        axios.get(`${API}/suppliers`)
      ]);
      setArticles(articlesRes.data);
      setColors(colorsRes.data);
      setFabrics(fabricsRes.data);
      setBuyers(buyersRes.data);
      setSuppliers(suppliersRes.data);
    } catch (error) {
      toast.error("Error fetching master data");
    }
  };

  // Get combo names from a specific FABRIC table
  const getComboNamesFromTable = (tableId) => {
    const fabricTable = bomTables.find(t => t.id === tableId);
    if (!fabricTable) return [];
    const comboNames = [];
    fabricTable.items.forEach(item => {
      if (item.comboName && !comboNames.includes(item.comboName)) {
        comboNames.push(item.comboName);
      }
    });
    return comboNames;
  };

  // ===== FABRIC TAB FUNCTIONS =====
  const addNewTable = () => {
    const newId = Math.max(...bomTables.map(t => t.id)) + 1;
    const newTable = {
      id: newId,
      name: `BOM Table ${newId}`,
      items: [{ srNo: 1, comboName: "", lotNo: "", lotCount: "", colourId: "", colourCode: "", colour: "", fabricQuality: "", fcNo: "", planRat: "", gsm: "", priority: "", component: "", avgUnit: "kg", orderPcs: "", extraPcs: "", wastagePcs: "", readyFabricNeed: "", shortage: "", greigeFabricNeed: "" }]
    };
    setBomTables([...bomTables, newTable]);
    
    // Auto-create corresponding TRIMS table
    const newTrimsTable = {
      id: newId,
      name: `Trims for BOM Table ${newId}`,
      items: [{ srNo: 1, comboName: "", trimType: "", itemName: "", itemCode: "", color: "", size: "", quantity: "", supplier: "", unitPrice: "", totalCost: "" }]
    };
    setTrimsTables([...trimsTables, newTrimsTable]);
    
    toast.success("New FABRIC and TRIMS tables added");
  };

  const copyTable = (tableId) => {
    const tableToCopy = bomTables.find(t => t.id === tableId);
    if (tableToCopy) {
      const newId = Math.max(...bomTables.map(t => t.id)) + 1;
      const copiedTable = {
        id: newId,
        name: `${tableToCopy.name} (Copy)`,
        items: tableToCopy.items.map(item => ({ ...item }))
      };
      setBomTables([...bomTables, copiedTable]);
      
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
      
      toast.success("FABRIC and TRIMS tables copied successfully");
    }
  };

  const deleteTable = (tableId) => {
    if (bomTables.length === 1) {
      toast.error("Cannot delete the last table");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this FABRIC table and its corresponding TRIMS table?")) return;
    
    setBomTables(bomTables.filter(t => t.id !== tableId));
    setTrimsTables(trimsTables.filter(t => t.id !== tableId));
    
    toast.success("FABRIC and TRIMS tables deleted");
  };

  const addRow = (tableId) => {
    setBomTables(bomTables.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          items: [...table.items, { srNo: table.items.length + 1, comboName: "", lotNo: "", lotCount: "", colourId: "", colourCode: "", colour: "", fabricQuality: "", fcNo: "", planRat: "", gsm: "", priority: "", component: "", avgUnit: "kg", orderPcs: "", extraPcs: "", wastagePcs: "", readyFabricNeed: "", shortage: "", greigeFabricNeed: "" }]
        };
      }
      return table;
    }));
  };

  const deleteRow = (tableId, rowIndex) => {
    setBomTables(bomTables.map(table => {
      if (table.id === tableId) {
        const newItems = table.items.filter((_, i) => i !== rowIndex);
        newItems.forEach((item, i) => { item.srNo = i + 1; });
        return { ...table, items: newItems };
      }
      return table;
    }));
  };

  const copyRow = (tableId, rowIndex) => {
    setBomTables(bomTables.map(table => {
      if (table.id === tableId) {
        const itemToCopy = { ...table.items[rowIndex] };
        const newItem = { ...itemToCopy, srNo: table.items.length + 1 };
        return { ...table, items: [...table.items, newItem] };
      }
      return table;
    }));
    toast.success("Row copied successfully");
  };

  const updateItem = (tableId, rowIndex, field, value) => {
    setBomTables(bomTables.map(table => {
      if (table.id === tableId) {
        const newItems = [...table.items];
        newItems[rowIndex][field] = value;

        if (["orderPcs", "extraPcs", "wastagePcs", "planRat"].includes(field)) {
          const item = newItems[rowIndex];
          const order = parseFloat(item.orderPcs) || 0;
          const extra = parseFloat(item.extraPcs) || 0;
          const wastage = parseFloat(item.wastagePcs) || 0;
          const planRat = parseFloat(item.planRat) || 0;
          const totalPcs = order + extra + wastage;
          const readyFabric = (totalPcs * planRat).toFixed(2);
          item.readyFabricNeed = readyFabric;
          item.greigeFabricNeed = (parseFloat(readyFabric) * 1.05).toFixed(2);
          item.shortage = (parseFloat(item.greigeFabricNeed) - parseFloat(item.readyFabricNeed)).toFixed(2);
        }

        return { ...table, items: newItems };
      }
      return table;
    }));
  };

  const handleColorSelect = (tableId, rowIndex, colorId) => {
    const color = colors.find(c => c.id === colorId);
    if (color) {
      updateItem(tableId, rowIndex, "colourId", color.id);
      updateItem(tableId, rowIndex, "colourCode", color.code);
      updateItem(tableId, rowIndex, "colour", color.name);
    }
  };

  const handleFabricSelect = (tableId, rowIndex, fabricId) => {
    const fabric = fabrics.find(f => f.id === fabricId);
    if (fabric) {
      updateItem(tableId, rowIndex, "fabricQuality", fabric.final_item || fabric.fabric_name);
      updateItem(tableId, rowIndex, "gsm", fabric.gsm || "");
    }
  };

  // ===== TRIMS TAB FUNCTIONS =====
  const addTrimsRow = (tableId) => {
    setTrimsTables(trimsTables.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          items: [...table.items, { srNo: table.items.length + 1, comboName: "", trimType: "", itemName: "", itemCode: "", color: "", size: "", quantity: "", supplier: "", unitPrice: "", totalCost: "" }]
        };
      }
      return table;
    }));
  };

  const deleteTrimsRow = (tableId, rowIndex) => {
    setTrimsTables(trimsTables.map(table => {
      if (table.id === tableId) {
        const newItems = table.items.filter((_, i) => i !== rowIndex);
        newItems.forEach((item, i) => { item.srNo = i + 1; });
        return { ...table, items: newItems };
      }
      return table;
    }));
  };

  const copyTrimsRow = (tableId, rowIndex) => {
    setTrimsTables(trimsTables.map(table => {
      if (table.id === tableId) {
        const itemToCopy = { ...table.items[rowIndex] };
        const newItem = { ...itemToCopy, srNo: table.items.length + 1 };
        return { ...table, items: [...table.items, newItem] };
      }
      return table;
    }));
    toast.success("Trim row copied");
  };

  const updateTrimsItem = (tableId, rowIndex, field, value) => {
    setTrimsTables(trimsTables.map(table => {
      if (table.id === tableId) {
        const newItems = [...table.items];
        newItems[rowIndex][field] = value;

        if (field === "quantity" || field === "unitPrice") {
          const qty = parseFloat(newItems[rowIndex].quantity) || 0;
          const price = parseFloat(newItems[rowIndex].unitPrice) || 0;
          newItems[rowIndex].totalCost = (qty * price).toFixed(2);
        }

        return { ...table, items: newItems };
      }
      return table;
    }));
  };

  // ===== OPERATIONS TAB FUNCTIONS =====
  const addOperationsRow = () => {
    setOperationsItems([...operationsItems, {
      srNo: operationsItems.length + 1,
      sequenceType: "Fixed",
      operationName: "",
      department: "",
      machineType: "",
      sam: "",
      workers: "",
      outputPerHour: "",
      costPerPiece: "",
      remarks: ""
    }]);
  };

  const deleteOperationsRow = (index) => {
    const newItems = operationsItems.filter((_, i) => i !== index);
    newItems.forEach((item, i) => { item.srNo = i + 1; });
    setOperationsItems(newItems);
  };

  const copyOperationsRow = (index) => {
    const itemToCopy = { ...operationsItems[index] };
    const newItem = { ...itemToCopy, srNo: operationsItems.length + 1 };
    setOperationsItems([...operationsItems, newItem]);
    toast.success("Operation row copied");
  };

  const updateOperationsItem = (index, field, value) => {
    const newItems = [...operationsItems];
    newItems[index][field] = value;

    if (field === "sam") {
      const sam = parseFloat(value) || 0;
      if (sam > 0) {
        newItems[index].outputPerHour = (60 / sam).toFixed(2);
      }
    }

    setOperationsItems(newItems);
  };

  const handleSave = () => {
    if (!headerData.artNo || !headerData.styleNumber) {
      toast.error("Please fill Art No and Style Number");
      return;
    }

    const bomData = {
      header: headerData,
      fabricTables: bomTables,
      trimsTables: trimsTables,
      operations: operationsItems
    };

    onSave(bomData);
  };

  const isReadOnly = mode === "view";

  return (
    <div className="space-y-6">
      {/* Header Section - Common for all tabs */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-2xl">DYEING BOM SHEET</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={headerData.date} onChange={(e) => setHeaderData({ ...headerData, date: e.target.value })} disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label>Image Reference</Label>
              <Input value={headerData.imageReference} onChange={(e) => setHeaderData({ ...headerData, imageReference: e.target.value })} placeholder="SUMMER-2026" disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label>Art No *</Label>
              <select className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={headerData.artNo} onChange={(e) => setHeaderData({ ...headerData, artNo: e.target.value })} disabled={isReadOnly}>
                <option value="">Select Article</option>
                {articles.map((art) => (<option key={art.id} value={art.code}>{art.code} - {art.name}</option>))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Plan Qty</Label>
              <Input type="number" value={headerData.planQty} onChange={(e) => setHeaderData({ ...headerData, planQty: e.target.value })} disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label>Set No</Label>
              <Input value={headerData.setNo} onChange={(e) => setHeaderData({ ...headerData, setNo: e.target.value })} disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label>Buyer</Label>
              <select className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={headerData.buyer} onChange={(e) => setHeaderData({ ...headerData, buyer: e.target.value })} disabled={isReadOnly}>
                <option value="">Select Buyer</option>
                {buyers.map((buyer) => (<option key={buyer.id} value={buyer.name}>{buyer.name}</option>))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Style Number *</Label>
              <Input value={headerData.styleNumber} onChange={(e) => setHeaderData({ ...headerData, styleNumber: e.target.value })} required disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Input value={headerData.remarks} onChange={(e) => setHeaderData({ ...headerData, remarks: e.target.value })} disabled={isReadOnly} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TABS: FABRIC | TRIMS | OPERATIONS ROUTING */}
      <Tabs defaultValue="fabric" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 h-14 bg-white border">
          <TabsTrigger value="fabric" className="text-lg font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            📦 FABRIC
          </TabsTrigger>
          <TabsTrigger value="trims" className="text-lg font-semibold data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            ✂️ TRIMS
          </TabsTrigger>
          <TabsTrigger value="operations" className="text-lg font-semibold data-[state=active]:bg-green-600 data-[state=active]:text-white">
            ⚙️ OPERATIONS ROUTING
          </TabsTrigger>
        </TabsList>

        {/* FABRIC TAB CONTENT */}
        <TabsContent value="fabric" className="space-y-6">
          {bomTables.map((table) => (
            <Card key={table.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{table.name}</CardTitle>
                  {!isReadOnly && (
                    <div className="flex gap-2">
                      <Button onClick={() => addRow(table.id)} className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />Add Row
                      </Button>
                      <Button onClick={() => copyTable(table.id)} className="bg-blue-600 hover:bg-blue-700">
                        <Copy className="w-4 h-4 mr-2" />Copy Table
                      </Button>
                      {bomTables.length > 1 && (
                        <Button onClick={() => deleteTable(table.id)} variant="outline" className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />Delete Table
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-100">
                        <TableHead className="w-12">SR NO</TableHead>
                        <TableHead className="min-w-[200px]">COMBO NAME</TableHead>
                        <TableHead>LOT NO</TableHead>
                        <TableHead>LOT COUNT</TableHead>
                        <TableHead>COLOUR</TableHead>
                        <TableHead className="min-w-[250px]">FABRIC QUALITY</TableHead>
                        <TableHead>FC NO</TableHead>
                        <TableHead>PLAN RAT</TableHead>
                        <TableHead>GSM</TableHead>
                        <TableHead>PRIORITY</TableHead>
                        <TableHead className="min-w-[200px]">COMPONENT</TableHead>
                        <TableHead>AVG UNIT</TableHead>
                        <TableHead>ORDER (PCS)</TableHead>
                        <TableHead>EXTRA PCS</TableHead>
                        <TableHead>WASTAGE PCS</TableHead>
                        <TableHead>READY FABRIC</TableHead>
                        <TableHead>SHORTAGE</TableHead>
                        <TableHead>GREIGE FABRIC</TableHead>
                        {!isReadOnly && <TableHead className="w-24 text-center">ACTIONS</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table.items.map((item, rowIndex) => (
                        <TableRow key={rowIndex}>
                          <TableCell className="text-center font-medium">{item.srNo}</TableCell>
                          <TableCell><Input value={item.comboName} onChange={(e) => updateItem(table.id, rowIndex, "comboName", e.target.value)} className="min-w-[180px]" disabled={isReadOnly} /></TableCell>
                          <TableCell><Input value={item.lotNo} onChange={(e) => updateItem(table.id, rowIndex, "lotNo", e.target.value)} className="w-20" disabled={isReadOnly} /></TableCell>
                          <TableCell><Input type="number" value={item.lotCount} onChange={(e) => updateItem(table.id, rowIndex, "lotCount", e.target.value)} className="w-20" disabled={isReadOnly} /></TableCell>
                          <TableCell>
                            <select className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm min-w-[120px]" value={item.colourId} onChange={(e) => handleColorSelect(table.id, rowIndex, e.target.value)} disabled={isReadOnly}>
                              <option value="">Select Color</option>
                              {colors.map((color) => (<option key={color.id} value={color.id}>{color.name}</option>))}
                            </select>
                          </TableCell>
                          <TableCell>
                            <select className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm min-w-[200px]" onChange={(e) => handleFabricSelect(table.id, rowIndex, e.target.value)} disabled={isReadOnly}>
                              <option value="">Select Fabric</option>
                              {fabrics.map((fabric) => (<option key={fabric.id} value={fabric.id}>{fabric.fabric_name}</option>))}
                            </select>
                          </TableCell>
                          <TableCell><Input value={item.fcNo} onChange={(e) => updateItem(table.id, rowIndex, "fcNo", e.target.value)} className="w-20" disabled={isReadOnly} /></TableCell>
                          <TableCell><Input type="number" step="0.01" value={item.planRat} onChange={(e) => updateItem(table.id, rowIndex, "planRat", e.target.value)} className="w-24" disabled={isReadOnly} /></TableCell>
                          <TableCell><Input value={item.gsm} onChange={(e) => updateItem(table.id, rowIndex, "gsm", e.target.value)} className="w-20" disabled={isReadOnly} /></TableCell>
                          <TableCell><Input value={item.priority} onChange={(e) => updateItem(table.id, rowIndex, "priority", e.target.value)} className="w-20" disabled={isReadOnly} /></TableCell>
                          <TableCell><Input value={item.component} onChange={(e) => updateItem(table.id, rowIndex, "component", e.target.value)} className="min-w-[180px]" disabled={isReadOnly} /></TableCell>
                          <TableCell>
                            <select className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={item.avgUnit} onChange={(e) => updateItem(table.id, rowIndex, "avgUnit", e.target.value)} disabled={isReadOnly}>
                              <option value="kg">kg</option><option value="Pcs">Pcs</option><option value="Meter">Meter</option>
                            </select>
                          </TableCell>
                          <TableCell><Input type="number" value={item.orderPcs} onChange={(e) => updateItem(table.id, rowIndex, "orderPcs", e.target.value)} className="w-24" disabled={isReadOnly} /></TableCell>
                          <TableCell><Input type="number" value={item.extraPcs} onChange={(e) => updateItem(table.id, rowIndex, "extraPcs", e.target.value)} className="w-24" disabled={isReadOnly} /></TableCell>
                          <TableCell><Input type="number" value={item.wastagePcs} onChange={(e) => updateItem(table.id, rowIndex, "wastagePcs", e.target.value)} className="w-24" disabled={isReadOnly} /></TableCell>
                          <TableCell><Input value={item.readyFabricNeed} readOnly className="w-24 bg-slate-50" /></TableCell>
                          <TableCell><Input value={item.shortage} readOnly className="w-24 bg-slate-50" /></TableCell>
                          <TableCell><Input value={item.greigeFabricNeed} readOnly className="w-24 bg-slate-50" /></TableCell>
                          {!isReadOnly && (
                            <TableCell>
                              <div className="flex gap-1 justify-center">
                                <Button variant="ghost" size="sm" onClick={() => copyRow(table.id, rowIndex)} className="text-blue-600 hover:bg-blue-50" title="Copy Row"><Copy className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => deleteRow(table.id, rowIndex)} className="text-red-600 hover:bg-red-50" title="Delete Row"><Trash2 className="w-4 h-4" /></Button>
                              </div>
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
          {!isReadOnly && (
            <div className="flex justify-center">
              <Button onClick={addNewTable} size="lg" className="bg-purple-600 hover:bg-purple-700">
                <FileText className="w-5 h-5 mr-2" />Add New Empty Table
              </Button>
            </div>
          )}
        </TabsContent>

        {/* TRIMS TAB CONTENT */}
        <TabsContent value="trims" className="space-y-6">
          {trimsTables.map((table) => (
            <Card key={table.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-purple-700">{table.name}</CardTitle>
                  {!isReadOnly && (
                    <Button onClick={() => addTrimsRow(table.id)} className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />Add Trim Row
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-100">
                        <TableHead className="w-12">SR NO</TableHead>
                        <TableHead>COMBO NAME</TableHead>
                        <TableHead>TRIM TYPE</TableHead>
                        <TableHead>ITEM NAME</TableHead>
                        <TableHead>ITEM CODE</TableHead>
                        <TableHead>COLOR</TableHead>
                        <TableHead>SIZE</TableHead>
                        <TableHead>QUANTITY</TableHead>
                        <TableHead>SUPPLIER</TableHead>
                        <TableHead>UNIT PRICE</TableHead>
                        <TableHead>TOTAL COST</TableHead>
                        <TableHead className="w-24 text-center">ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table.items.map((item, rowIndex) => (
                        <TableRow key={rowIndex}>
                          <TableCell className="text-center font-medium">{item.srNo}</TableCell>
                          <TableCell>
                            <select className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm min-w-[150px]" value={item.comboName} onChange={(e) => updateTrimsItem(table.id, rowIndex, "comboName", e.target.value)}>
                              <option value="">Select Combo</option>
                              {getComboNamesFromTable(table.id).map((name, i) => (<option key={i} value={name}>{name}</option>))}
                            </select>
                          </TableCell>
                          <TableCell><Input value={item.trimType} onChange={(e) => updateTrimsItem(table.id, rowIndex, "trimType", e.target.value)} placeholder="Button/Zipper/Label" className="min-w-[150px]" /></TableCell>
                          <TableCell><Input value={item.itemName} onChange={(e) => updateTrimsItem(table.id, rowIndex, "itemName", e.target.value)} className="min-w-[150px]" /></TableCell>
                          <TableCell><Input value={item.itemCode} onChange={(e) => updateTrimsItem(table.id, rowIndex, "itemCode", e.target.value)} className="w-28" /></TableCell>
                          <TableCell><Input value={item.color} onChange={(e) => updateTrimsItem(table.id, rowIndex, "color", e.target.value)} className="w-24" /></TableCell>
                          <TableCell><Input value={item.size} onChange={(e) => updateTrimsItem(table.id, rowIndex, "size", e.target.value)} className="w-20" /></TableCell>
                          <TableCell><Input type="number" value={item.quantity} onChange={(e) => updateTrimsItem(table.id, rowIndex, "quantity", e.target.value)} className="w-24" /></TableCell>
                          <TableCell>
                            <select className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm min-w-[150px]" value={item.supplier} onChange={(e) => updateTrimsItem(table.id, rowIndex, "supplier", e.target.value)}>
                              <option value="">Select Supplier</option>
                              {suppliers.map((sup) => (<option key={sup.id} value={sup.name}>{sup.name}</option>))}
                            </select>
                          </TableCell>
                          <TableCell><Input type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateTrimsItem(table.id, rowIndex, "unitPrice", e.target.value)} className="w-24" /></TableCell>
                          <TableCell><Input value={item.totalCost} readOnly className="w-24 bg-slate-50" /></TableCell>
                          <TableCell>
                            <div className="flex gap-1 justify-center">
                              <Button variant="ghost" size="sm" onClick={() => copyTrimsRow(table.id, rowIndex)} className="text-blue-600 hover:bg-blue-50" title="Copy Row"><Copy className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteTrimsRow(table.id, rowIndex)} className="text-red-600 hover:bg-red-50" title="Delete Row"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* OPERATIONS ROUTING TAB CONTENT */}
        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>OPERATIONS ROUTING</CardTitle>
                <Button onClick={addOperationsRow} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />Add Operation Row
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-100">
                      <TableHead className="w-12">SR NO</TableHead>
                      <TableHead>SEQUENCE TYPE</TableHead>
                      <TableHead>OPERATION NAME</TableHead>
                      <TableHead>DEPARTMENT</TableHead>
                      <TableHead>MACHINE TYPE</TableHead>
                      <TableHead>SAM (mins)</TableHead>
                      <TableHead>NO. OF WORKERS</TableHead>
                      <TableHead>OUTPUT/HOUR</TableHead>
                      <TableHead>COST/PIECE (₹)</TableHead>
                      <TableHead>REMARKS</TableHead>
                      <TableHead className="w-24 text-center">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operationsItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-center font-medium">{item.srNo}</TableCell>
                        <TableCell>
                          <select className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm min-w-[120px]" value={item.sequenceType} onChange={(e) => updateOperationsItem(index, "sequenceType", e.target.value)}>
                            <option value="Fixed">Fixed</option>
                            <option value="Dependent">Dependent</option>
                          </select>
                        </TableCell>
                        <TableCell><Input value={item.operationName} onChange={(e) => updateOperationsItem(index, "operationName", e.target.value)} placeholder="Cutting/Sewing..." className="min-w-[180px]" /></TableCell>
                        <TableCell>
                          <select className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm min-w-[120px]" value={item.department} onChange={(e) => updateOperationsItem(index, "department", e.target.value)}>
                            <option value="">Select</option>
                            <option value="Cutting">Cutting</option>
                            <option value="Sewing">Sewing</option>
                            <option value="Finishing">Finishing</option>
                            <option value="Packing">Packing</option>
                          </select>
                        </TableCell>
                        <TableCell><Input value={item.machineType} onChange={(e) => updateOperationsItem(index, "machineType", e.target.value)} placeholder="Single Needle..." className="min-w-[150px]" /></TableCell>
                        <TableCell><Input type="number" step="0.1" value={item.sam} onChange={(e) => updateOperationsItem(index, "sam", e.target.value)} className="w-24" /></TableCell>
                        <TableCell><Input type="number" value={item.workers} onChange={(e) => updateOperationsItem(index, "workers", e.target.value)} className="w-20" /></TableCell>
                        <TableCell><Input value={item.outputPerHour} readOnly className="w-24 bg-slate-50" /></TableCell>
                        <TableCell><Input type="number" step="0.01" value={item.costPerPiece} onChange={(e) => updateOperationsItem(index, "costPerPiece", e.target.value)} className="w-24" /></TableCell>
                        <TableCell><Input value={item.remarks} onChange={(e) => updateOperationsItem(index, "remarks", e.target.value)} className="min-w-[150px]" /></TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-center">
                            <Button variant="ghost" size="sm" onClick={() => copyOperationsRow(index)} className="text-blue-600 hover:bg-blue-50"><Copy className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteOperationsRow(index)} className="text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Total SAM:</span>
                  <span>{operationsItems.reduce((sum, item) => sum + (parseFloat(item.sam) || 0), 0).toFixed(2)} minutes/piece</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="font-semibold">Total Labor Cost:</span>
                  <span>₹{operationsItems.reduce((sum, item) => sum + (parseFloat(item.costPerPiece) || 0), 0).toFixed(2)}/piece</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div>
          {mode === "view" && (
            <span className="text-sm text-slate-500 italic">View Mode - Click Edit to make changes</span>
          )}
          {mode === "edit" && (
            <span className="text-sm text-green-600 italic">Edit Mode - Make changes and save</span>
          )}
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onCancel}>
            {mode === "view" ? "Back to List" : "Cancel"}
          </Button>
          {mode === "view" && (
            <Button onClick={onEdit} className="bg-orange-600 hover:bg-orange-700">
              <Save className="w-4 h-4 mr-2" />Edit BOM
            </Button>
          )}
          {(mode === "create" || mode === "edit") && (
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {mode === "edit" ? "Update BOM" : "Save Complete BOM"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
