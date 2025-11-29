import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  LayoutGrid, List, Table as TableIcon, BarChart3, 
  Calendar, Image as ImageIcon, Network, Edit, Trash2 
} from "lucide-react";

const VIEW_TYPES = [
  { id: 'grid', name: 'Grid View', icon: LayoutGrid, description: 'Card-based grid layout' },
  { id: 'list', name: 'List View', icon: List, description: 'Compact list layout' },
  { id: 'table', name: 'Table View', icon: TableIcon, description: 'Spreadsheet-style table' },
  { id: 'kanban', name: 'Kanban Board', icon: BarChart3, description: 'Status-based columns' },
  { id: 'gallery', name: 'Gallery View', icon: ImageIcon, description: 'Image-focused layout' },
  { id: 'timeline', name: 'Timeline View', icon: Calendar, description: 'Chronological display' },
  { id: 'hierarchy', name: 'Hierarchy View', icon: Network, description: 'Tree structure' }
];

export default function MasterViewTypes({ 
  data, 
  config, 
  onEdit, 
  onDelete,
  currentView,
  onViewChange 
}) {
  const [selectedView, setSelectedView] = useState(currentView || 'grid');

  const handleViewChange = (viewId) => {
    setSelectedView(viewId);
    if (onViewChange) onViewChange(viewId);
  };

  // Grid View (Current Default)
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((item) => (
        <Card key={item.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                {item[config.fields[0]?.name] || "Untitled"}
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} className="text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {config.fields.slice(1, 4).map(field => (
                <div key={field.id} className="flex justify-between">
                  <span className="text-slate-500">{field.label}:</span>
                  <span className="font-medium">{item[field.name] || '-'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // List View (Compact)
  const renderListView = () => (
    <div className="space-y-2">
      {data.map((item) => (
        <Card key={item.id} className="hover:bg-slate-50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex items-center gap-4">
                <div className="font-medium text-lg">
                  {item[config.fields[0]?.name] || "Untitled"}
                </div>
                {config.fields.slice(1, 3).map(field => (
                  <div key={field.id} className="text-sm text-slate-600">
                    <span className="text-slate-400">{field.label}:</span> {item[field.name] || '-'}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} className="text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Table View (Spreadsheet)
  const renderTableView = () => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                {config.fields.map(field => (
                  <TableHead key={field.id}>{field.label}</TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  {config.fields.map(field => (
                    <TableCell key={field.id}>
                      {field.type === 'checkbox' 
                        ? (item[field.name] ? '✓' : '✗')
                        : item[field.name] || '-'}
                    </TableCell>
                  ))}
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} className="text-red-600">
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
  );

  // Kanban View (Status-based columns)
  const renderKanbanView = () => {
    // Find status field
    const statusField = config.fields.find(f => 
      f.name.toLowerCase().includes('status') || 
      f.type === 'dropdown'
    );

    if (!statusField) {
      return (
        <div className="text-center py-12 text-slate-500">
          Kanban view requires a status or dropdown field
        </div>
      );
    }

    // Group by status
    const columns = {};
    const statuses = statusField.options || ['Active', 'Inactive', 'Pending'];
    
    statuses.forEach(status => {
      columns[status] = data.filter(item => item[statusField.name] === status);
    });

    return (
      <div className="grid grid-cols-3 gap-4">
        {Object.keys(columns).map(status => (
          <div key={status} className="space-y-3">
            <div className="bg-slate-100 px-4 py-2 rounded-lg font-medium">
              {status} ({columns[status].length})
            </div>
            <div className="space-y-2">
              {columns[status].map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-3">
                    <div className="font-medium mb-2">
                      {item[config.fields[0]?.name]}
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      {config.fields.slice(1, 3).map(field => (
                        <div key={field.id}>
                          {field.label}: {item[field.name] || '-'}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="flex-1">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} className="text-red-600">
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Gallery View (Image-focused)
  const renderGalleryView = () => {
    const imageField = config.fields.find(f => f.type === 'file' || f.name.includes('image'));
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-slate-100 flex items-center justify-center">
              {imageField && item[imageField.name] ? (
                <img 
                  src={item[imageField.name]} 
                  alt={item[config.fields[0]?.name]}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-16 h-16 text-slate-300" />
              )}
            </div>
            <CardContent className="p-3">
              <div className="font-medium mb-1">{item[config.fields[0]?.name]}</div>
              <div className="text-sm text-slate-600 mb-2">
                {item[config.fields[1]?.name] || '-'}
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => onEdit(item)} className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(item.id)} className="text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Timeline View (Date-based)
  const renderTimelineView = () => {
    const dateField = config.fields.find(f => f.type === 'date' || f.name.includes('date'));
    
    if (!dateField) {
      return (
        <div className="text-center py-12 text-slate-500">
          Timeline view requires a date field
        </div>
      );
    }

    // Sort by date
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a[dateField.name] || 0);
      const dateB = new Date(b[dateField.name] || 0);
      return dateB - dateA;
    });

    return (
      <div className="space-y-4">
        {sortedData.map((item, index) => (
          <div key={item.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              {index < sortedData.length - 1 && (
                <div className="w-0.5 h-full bg-slate-200 my-1"></div>
              )}
            </div>
            <Card className="flex-1 hover:shadow-md transition-shadow">
              <CardContent className="py-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-lg">{item[config.fields[0]?.name]}</div>
                    <div className="text-sm text-slate-500">
                      {new Date(item[dateField.name]).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  {config.fields.slice(1, 4).filter(f => f.id !== dateField.id).map(field => (
                    <div key={field.id}>
                      <span className="text-slate-400">{field.label}:</span> {item[field.name] || '-'}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  };

  // Hierarchy View (Tree structure)
  const renderHierarchyView = () => {
    // Find parent-child relationship field
    const parentField = config.fields.find(f => 
      f.name.toLowerCase().includes('parent') || 
      f.name.toLowerCase().includes('category')
    );

    if (!parentField) {
      return (
        <div className="text-center py-12 text-slate-500">
          Hierarchy view requires a parent or category field
        </div>
      );
    }

    // Group by parent
    const hierarchy = {};
    data.forEach(item => {
      const parent = item[parentField.name] || 'Root';
      if (!hierarchy[parent]) hierarchy[parent] = [];
      hierarchy[parent].push(item);
    });

    return (
      <div className="space-y-4">
        {Object.keys(hierarchy).map(parent => (
          <Card key={parent}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                {parent} ({hierarchy[parent].length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {hierarchy[parent].map(item => (
                  <div key={item.id} className="border rounded-lg p-3 hover:bg-slate-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{item[config.fields[0]?.name]}</div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} className="text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600">
                      {config.fields.slice(1, 3).map(field => (
                        <div key={field.id}>
                          {field.label}: {item[field.name] || '-'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (selectedView) {
      case 'grid': return renderGridView();
      case 'list': return renderListView();
      case 'table': return renderTableView();
      case 'kanban': return renderKanbanView();
      case 'gallery': return renderGalleryView();
      case 'timeline': return renderTimelineView();
      case 'hierarchy': return renderHierarchyView();
      default: return renderGridView();
    }
  };

  return (
    <div className="space-y-4">
      {/* View Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-sm text-slate-600 mr-2">Display As:</span>
            {VIEW_TYPES.map(view => {
              const Icon = view.icon;
              return (
                <Button
                  key={view.id}
                  variant={selectedView === view.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleViewChange(view.id)}
                  className="whitespace-nowrap"
                  title={view.description}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {view.name}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Display */}
      {data.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No records found. Add some data to see it displayed here.
        </div>
      ) : (
        renderCurrentView()
      )}
    </div>
  );
}
