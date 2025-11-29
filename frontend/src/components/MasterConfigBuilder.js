import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Plus, Trash2, GripVertical, Save, X, Eye, Settings,
  Type, Hash, Calendar, Image, List, CheckSquare, Link as LinkIcon
} from "lucide-react";

const FIELD_TYPES = [
  { id: "text", name: "Text", icon: Type, description: "Single line text" },
  { id: "textarea", name: "Text Area", icon: Type, description: "Multi-line text" },
  { id: "number", name: "Number", icon: Hash, description: "Numeric value" },
  { id: "decimal", name: "Decimal", icon: Hash, description: "Decimal number" },
  { id: "date", name: "Date", icon: Calendar, description: "Date picker" },
  { id: "dropdown", name: "Dropdown", icon: List, description: "Single select" },
  { id: "multiselect", name: "Multi-Select", icon: List, description: "Multiple selection" },
  { id: "checkbox", name: "Checkbox", icon: CheckSquare, description: "Yes/No toggle" },
  { id: "file", name: "File Upload", icon: Image, description: "File/image upload" },
  { id: "relationship", name: "Relationship", icon: LinkIcon, description: "Link to other master" }
];

const CATEGORIES = [
  { id: "production", name: "Production" },
  { id: "material", name: "Material" },
  { id: "quality", name: "Quality" },
  { id: "hr", name: "HR/Resource" },
  { id: "logistics", name: "Logistics" },
  { id: "cost", name: "Cost" },
  { id: "other", name: "Other" }
];

export default function MasterConfigBuilder({ initialConfig, onSave, onCancel }) {
  const [configName, setConfigName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [icon, setIcon] = useState("📋");
  const [enableExcelUpload, setEnableExcelUpload] = useState(true);
  const [enableImageUpload, setEnableImageUpload] = useState(false);
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [draggedField, setDraggedField] = useState(null);

  useEffect(() => {
    if (initialConfig) {
      setConfigName(initialConfig.name);
      setDescription(initialConfig.description || "");
      setCategory(initialConfig.category);
      setIcon(initialConfig.icon || "📋");
      setEnableExcelUpload(initialConfig.enableExcelUpload);
      setEnableImageUpload(initialConfig.enableImageUpload || false);
      setFields(initialConfig.fields || []);
    }
  }, [initialConfig]);

  const addField = (fieldType) => {
    const newField = {
      id: Date.now().toString(),
      name: `field_${fields.length + 1}`,
      label: `Field ${fields.length + 1}`,
      type: fieldType,
      required: false,
      options: fieldType === "dropdown" || fieldType === "multiselect" ? ["Option 1", "Option 2"] : null,
      validation: {},
      placeholder: "",
      helpText: "",
      defaultValue: "",
      order: fields.length
    };
    setFields([...fields, newField]);
    setSelectedField(newField);
  };

  const updateField = (fieldId, updates) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
    if (selectedField && selectedField.id === fieldId) {
      setSelectedField({ ...selectedField, ...updates });
    }
  };

  const deleteField = (fieldId) => {
    setFields(fields.filter(f => f.id !== fieldId));
    if (selectedField && selectedField.id === fieldId) {
      setSelectedField(null);
    }
  };

  const handleDragStart = (e, field) => {
    setDraggedField(field);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, field) => {
    e.preventDefault();
    if (!draggedField || draggedField.id === field.id) return;

    const draggedIndex = fields.findIndex(f => f.id === draggedField.id);
    const targetIndex = fields.findIndex(f => f.id === field.id);

    const newFields = [...fields];
    newFields.splice(draggedIndex, 1);
    newFields.splice(targetIndex, 0, draggedField);

    newFields.forEach((f, idx) => f.order = idx);
    setFields(newFields);
  };

  const handleDragEnd = () => {
    setDraggedField(null);
  };

  const handleSave = () => {
    if (!configName.trim()) {
      toast.error("Please enter master name");
      return;
    }

    if (fields.length === 0) {
      toast.error("Please add at least one field");
      return;
    }

    const configData = {
      name: configName,
      description,
      category,
      icon,
      fields,
      enableExcelUpload,
      enableImageUpload
    };

    if (initialConfig) {
      configData.id = initialConfig.id;
      configData.created_at = initialConfig.created_at;
      configData.created_by = initialConfig.created_by;
    }

    onSave(configData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {initialConfig ? "Edit" : "Create"} Master Configuration
          </h2>
          <p className="text-slate-600 mt-1">Design your custom master with drag-and-drop</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>

      {!previewMode ? (
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Configuration */}
          <div className="col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Master Name *</Label>
                  <Input
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    placeholder="e.g., Machine Master"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <textarea
                    className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Icon (Emoji)</Label>
                  <Input
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="📋"
                    maxLength={2}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="excelUpload"
                    checked={enableExcelUpload}
                    onChange={(e) => setEnableExcelUpload(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="excelUpload" className="cursor-pointer">Enable Excel Upload</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="imageUpload"
                    checked={enableImageUpload}
                    onChange={(e) => setEnableImageUpload(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="imageUpload" className="cursor-pointer">Enable Image Upload</Label>
                </div>
              </CardContent>
            </Card>

            {/* Field Types Palette */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Field Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {FIELD_TYPES.map(fieldType => {
                    const Icon = fieldType.icon;
                    return (
                      <Button
                        key={fieldType.id}
                        variant="outline"
                        className="w-full justify-start text-left"
                        size="sm"
                        onClick={() => addField(fieldType.id)}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        <div>
                          <div className="font-medium">{fieldType.name}</div>
                          <div className="text-xs text-slate-500">{fieldType.description}</div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Panel - Fields Canvas */}
          <div className="col-span-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Fields (Drag to Reorder)</CardTitle>
              </CardHeader>
              <CardContent>
                {fields.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Plus className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p>Add fields from the left panel</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {fields.map(field => {
                      const FieldIcon = FIELD_TYPES.find(t => t.id === field.type)?.icon || Type;
                      return (
                        <div
                          key={field.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, field)}
                          onDragOver={(e) => handleDragOver(e, field)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedField(field)}
                          className={`
                            p-3 border rounded-lg flex items-center gap-3 cursor-move
                            ${selectedField?.id === field.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}
                            ${draggedField?.id === field.id ? "opacity-50" : ""}
                          `}
                        >
                          <GripVertical className="w-4 h-4 text-slate-400" />
                          <FieldIcon className="w-4 h-4 text-slate-600" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{field.label}</div>
                            <div className="text-xs text-slate-500">
                              {field.name} • {field.type}
                              {field.required && " • Required"}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteField(field.id);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Field Properties */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Field Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedField ? (
                  <div className="text-center py-8 text-slate-500">
                    Select a field to edit properties
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>Field Name (Code)</Label>
                      <Input
                        value={selectedField.name}
                        onChange={(e) => updateField(selectedField.id, { name: e.target.value })}
                        placeholder="field_name"
                      />
                    </div>

                    <div>
                      <Label>Display Label</Label>
                      <Input
                        value={selectedField.label}
                        onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                        placeholder="Field Label"
                      />
                    </div>

                    <div>
                      <Label>Placeholder</Label>
                      <Input
                        value={selectedField.placeholder}
                        onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                        placeholder="Enter placeholder..."
                      />
                    </div>

                    <div>
                      <Label>Help Text</Label>
                      <Input
                        value={selectedField.helpText}
                        onChange={(e) => updateField(selectedField.id, { helpText: e.target.value })}
                        placeholder="Additional help text"
                      />
                    </div>

                    {(selectedField.type === "dropdown" || selectedField.type === "multiselect") && (
                      <div>
                        <Label>Options (one per line)</Label>
                        <textarea
                          className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                          value={selectedField.options?.join("\n") || ""}
                          onChange={(e) => updateField(selectedField.id, { 
                            options: e.target.value.split("\n").filter(o => o.trim()) 
                          })}
                          rows={5}
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="required"
                        checked={selectedField.required}
                        onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="required" className="cursor-pointer">Required Field</Label>
                    </div>

                    {(selectedField.type === "number" || selectedField.type === "decimal") && (
                      <>
                        <div>
                          <Label>Min Value</Label>
                          <Input
                            type="number"
                            value={selectedField.validation?.min || ""}
                            onChange={(e) => updateField(selectedField.id, {
                              validation: { ...selectedField.validation, min: e.target.value }
                            })}
                          />
                        </div>
                        <div>
                          <Label>Max Value</Label>
                          <Input
                            type="number"
                            value={selectedField.validation?.max || ""}
                            onChange={(e) => updateField(selectedField.id, {
                              validation: { ...selectedField.validation, max: e.target.value }
                            })}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Preview Mode */
        <Card>
          <CardHeader>
            <CardTitle>Form Preview: {configName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 max-w-4xl">
              {fields.map(field => (
                <div key={field.id} className="space-y-2">
                  <Label>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {field.type === "textarea" ? (
                    <textarea
                      className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                      placeholder={field.placeholder}
                      rows={3}
                      disabled
                    />
                  ) : field.type === "dropdown" ? (
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                      disabled
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === "checkbox" ? (
                    <div className="flex items-center gap-2">
                      <input type="checkbox" disabled className="h-4 w-4" />
                      <span className="text-sm text-slate-600">{field.label}</span>
                    </div>
                  ) : field.type === "file" ? (
                    <Input type="file" disabled />
                  ) : (
                    <Input
                      type={field.type === "number" || field.type === "decimal" ? "number" : field.type}
                      placeholder={field.placeholder}
                      disabled
                    />
                  )}
                  {field.helpText && (
                    <p className="text-xs text-slate-500">{field.helpText}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
