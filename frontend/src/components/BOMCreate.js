import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function BOMCreate({ onCancel, onSave }) {
  const [articles, setArticles] = useState([]);
  const [colors, setColors] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [buyers, setBuyers] = useState([]);

  // Header data
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

  // BOM Items
  const [bomItems, setBomItems] = useState([
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
  ]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [articlesRes, colorsRes, fabricsRes, buyersRes] = await Promise.all([
        axios.get(`${API}/articles`),
        axios.get(`${API}/colors`),
        axios.get(`${API}/fabrics`),
        axios.get(`${API}/buyers`)
      ]);
      setArticles(articlesRes.data);
      setColors(colorsRes.data);
      setFabrics(fabricsRes.data);
      setBuyers(buyersRes.data);
    } catch (error) {
      toast.error("Error fetching master data");
    }
  };

  const addRow = () => {
    setBomItems([
      ...bomItems,
      {
        srNo: bomItems.length + 1,
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
    ]);
  };

  const deleteRow = (index) => {
    const newItems = bomItems.filter((_, i) => i !== index);
    // Renumber
    newItems.forEach((item, i) => {
      item.srNo = i + 1;
    });
    setBomItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...bomItems];
    newItems[index][field] = value;

    // Auto-calculate fields
    if (["orderPcs", "extraPcs", "wastagePcs", "planRat"].includes(field)) {
      const item = newItems[index];
      const order = parseFloat(item.orderPcs) || 0;
      const extra = parseFloat(item.extraPcs) || 0;
      const wastage = parseFloat(item.wastagePcs) || 0;
      const planRat = parseFloat(item.planRat) || 0;

      const totalPcs = order + extra + wastage;
      const readyFabric = (totalPcs * planRat).toFixed(2);
      
      item.readyFabricNeed = readyFabric;
      item.greigeFabricNeed = (parseFloat(readyFabric) * 1.05).toFixed(2); // 5% buffer
      item.shortage = (parseFloat(item.greigeFabricNeed) - parseFloat(item.readyFabricNeed)).toFixed(2);
    }

    setBomItems(newItems);
  };

  const handleColorSelect = (index, colorId) => {
    const color = colors.find(c => c.id === colorId);
    if (color) {
      updateItem(index, "colourId", color.id);
      updateItem(index, "colourCode", color.code);
      updateItem(index, "colour", color.name);
    }
  };

  const handleFabricSelect = (index, fabricId) => {
    const fabric = fabrics.find(f => f.id === fabricId);
    if (fabric) {
      updateItem(index, "fabricQuality", fabric.final_item || fabric.fabric_name);
      updateItem(index, "gsm", fabric.gsm || "");
    }
  };

  const handleSave = () => {
    if (!headerData.artNo || !headerData.styleNumber) {
      toast.error("Please fill Art No and Style Number");
      return;
    }

    if (bomItems.length === 0) {
      toast.error("Please add at least one BOM item");
      return;
    }

    const bomData = {
      ...headerData,
      items: bomItems
    };

    onSave(bomData);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-2xl">DYEING BOM SHEET</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={headerData.date}
                onChange={(e) => setHeaderData({ ...headerData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Image Reference</Label>
              <Input
                value={headerData.imageReference}
                onChange={(e) => setHeaderData({ ...headerData, imageReference: e.target.value })}
                placeholder="SUMMER-2026"
              />
            </div>
            <div className="space-y-2">
              <Label>Art No *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                value={headerData.artNo}
                onChange={(e) => setHeaderData({ ...headerData, artNo: e.target.value })}
              >
                <option value="">Select Article</option>
                {articles.map((art) => (
                  <option key={art.id} value={art.code}>
                    {art.code} - {art.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Plan Qty</Label>
              <Input
                type="number"
                value={headerData.planQty}
                onChange={(e) => setHeaderData({ ...headerData, planQty: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Set No</Label>
              <Input
                value={headerData.setNo}
                onChange={(e) => setHeaderData({ ...headerData, setNo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Buyer</Label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                value={headerData.buyer}
                onChange={(e) => setHeaderData({ ...headerData, buyer: e.target.value })}
              >
                <option value="">Select Buyer</option>
                {buyers.map((buyer) => (
                  <option key={buyer.id} value={buyer.name}>
                    {buyer.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Style Number *</Label>
              <Input
                value={headerData.styleNumber}
                onChange={(e) => setHeaderData({ ...headerData, styleNumber: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Input
                value={headerData.remarks}
                onChange={(e) => setHeaderData({ ...headerData, remarks: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BOM Items Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>BOM Items</CardTitle>
            <Button onClick={addRow} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Row
            </Button>
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
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bomItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-center font-medium">{item.srNo}</TableCell>
                    <TableCell>
                      <Input
                        value={item.comboName}
                        onChange={(e) => updateItem(index, "comboName", e.target.value)}
                        className="min-w-[180px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.lotNo}
                        onChange={(e) => updateItem(index, "lotNo", e.target.value)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.lotCount}
                        onChange={(e) => updateItem(index, "lotCount", e.target.value)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm min-w-[120px]"
                        value={item.colourId}
                        onChange={(e) => handleColorSelect(index, e.target.value)}
                      >
                        <option value="">Select Color</option>
                        {colors.map((color) => (
                          <option key={color.id} value={color.id}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <select
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm min-w-[200px]"
                        onChange={(e) => handleFabricSelect(index, e.target.value)}
                      >
                        <option value="">Select Fabric</option>
                        {fabrics.map((fabric) => (
                          <option key={fabric.id} value={fabric.id}>
                            {fabric.fabric_name}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.fcNo}
                        onChange={(e) => updateItem(index, "fcNo", e.target.value)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.planRat}
                        onChange={(e) => updateItem(index, "planRat", e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.gsm}
                        onChange={(e) => updateItem(index, "gsm", e.target.value)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.priority}
                        onChange={(e) => updateItem(index, "priority", e.target.value)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.component}
                        onChange={(e) => updateItem(index, "component", e.target.value)}
                        className="min-w-[180px]"
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                        value={item.avgUnit}
                        onChange={(e) => updateItem(index, "avgUnit", e.target.value)}
                      >
                        <option value="kg">kg</option>
                        <option value="Pcs">Pcs</option>
                        <option value="Meter">Meter</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.orderPcs}
                        onChange={(e) => updateItem(index, "orderPcs", e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.extraPcs}
                        onChange={(e) => updateItem(index, "extraPcs", e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.wastagePcs}
                        onChange={(e) => updateItem(index, "wastagePcs", e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.readyFabricNeed}
                        readOnly
                        className="w-24 bg-slate-50"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.shortage}
                        readOnly
                        className="w-24 bg-slate-50"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.greigeFabricNeed}
                        readOnly
                        className="w-24 bg-slate-50"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRow(index)}
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
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          Save BOM
        </Button>
      </div>
    </div>
  );
}
