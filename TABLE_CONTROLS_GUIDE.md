# Table Controls - Universal Filtering, Sorting & Grouping

## 📋 Overview

The `TableControls` component provides enterprise-grade filtering, sorting, and grouping capabilities for ANY data table in your application.

---

## 🚀 Quick Start

### 1. Import the Component

```javascript
import TableControls from "@/components/TableControls";
```

### 2. Define Your Columns

```javascript
const columns = [
  { name: 'machineName', label: 'Machine Name', type: 'text' },
  { name: 'department', label: 'Department', type: 'dropdown' },
  { name: 'capacity', label: 'Capacity', type: 'number' },
  { name: 'status', label: 'Status', type: 'dropdown' },
  { name: 'purchaseDate', label: 'Purchase Date', type: 'date' }
];
```

### 3. Use the Component

```javascript
const MyComponent = () => {
  const [data, setData] = useState([...]); // Your data array

  const { 
    processedData,    // Filtered & sorted data
    groupedData,      // Grouped data (if grouping is active)
    isGrouped,        // Boolean: is grouping active?
    sortConfig,       // Current sort configuration
    handleSort,       // Function to handle column header clicks
    renderControls    // Function to render the controls UI
  } = TableControls({ data, columns });

  return (
    <div>
      {/* Render controls above your table */}
      {renderControls()}

      {/* Your table here */}
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => (
              <TableHead 
                key={col.name}
                onClick={() => handleSort(col.name)}
                className="cursor-pointer"
              >
                {col.label}
                {/* Add sort indicators */}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {processedData.map(item => (
            <TableRow key={item.id}>
              {/* Render your data */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
```

---

## 📖 Complete Examples

### Example 1: Simple Master Data Table

```javascript
import React, { useState, useEffect } from "react";
import axios from "axios";
import TableControls from "@/components/TableControls";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function MachineList() {
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    const response = await axios.get('/api/machines');
    setMachines(response.data);
  };

  // Define columns
  const columns = [
    { name: 'name', label: 'Machine Name', type: 'text' },
    { name: 'type', label: 'Type', type: 'dropdown' },
    { name: 'capacity', label: 'Capacity', type: 'number' },
    { name: 'department', label: 'Department', type: 'dropdown' },
    { name: 'status', label: 'Status', type: 'dropdown' }
  ];

  // Use TableControls
  const {
    processedData,
    isGrouped,
    groupedData,
    sortConfig,
    handleSort,
    renderControls
  } = TableControls({ data: machines, columns });

  return (
    <div className="space-y-6">
      <h1>Machine Master</h1>

      {/* Render Controls - ALWAYS ABOVE TABLE */}
      {renderControls()}

      {/* Regular Table View */}
      {!isGrouped ? (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => (
                <TableHead 
                  key={col.name}
                  onClick={() => handleSort(col.name)}
                  className="cursor-pointer hover:text-blue-600"
                >
                  {col.label}
                  {sortConfig.field === col.name && (
                    sortConfig.direction === 'asc' ? ' ⬆️' : ' ⬇️'
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedData.map(machine => (
              <TableRow key={machine.id}>
                <TableCell>{machine.name}</TableCell>
                <TableCell>{machine.type}</TableCell>
                <TableCell>{machine.capacity}</TableCell>
                <TableCell>{machine.department}</TableCell>
                <TableCell>{machine.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        /* Grouped View */
        <div className="space-y-4">
          {Object.keys(groupedData).map(groupValue => (
            <div key={groupValue} className="border rounded-lg">
              <div className="bg-slate-100 px-4 py-2 font-medium">
                {groupValue} ({groupedData[groupValue].length})
              </div>
              <Table>
                <TableBody>
                  {groupedData[groupValue].map(machine => (
                    <TableRow key={machine.id}>
                      <TableCell>{machine.name}</TableCell>
                      <TableCell>{machine.type}</TableCell>
                      <TableCell>{machine.capacity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Example 2: With Actions Column

```javascript
const {
  processedData,
  renderControls
} = TableControls({ data: employees, columns });

return (
  <div>
    {renderControls()} {/* Controls always on top */}

    <Table>
      <TableHeader>
        <TableRow>
          {columns.map(col => (
            <TableHead key={col.name}>{col.label}</TableHead>
          ))}
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {processedData.map(employee => (
          <TableRow key={employee.id}>
            <TableCell>{employee.name}</TableCell>
            <TableCell>{employee.department}</TableCell>
            <TableCell>
              <Button onClick={() => handleEdit(employee)}>Edit</Button>
              <Button onClick={() => handleDelete(employee.id)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
```

### Example 3: Custom Styling

```javascript
// Override default styles
const {
  processedData,
  renderControls
} = TableControls({ 
  data: products, 
  columns,
  // Can be extended with custom props in future
});

return (
  <div>
    {/* Controls automatically styled and positioned */}
    {renderControls()}

    {/* Your custom table */}
    <div className="custom-table">
      {processedData.map(product => (
        <div key={product.id} className="custom-row">
          {product.name}
        </div>
      ))}
    </div>
  </div>
);
```

---

## 🎯 Column Definition

Each column object should have:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Field name in your data object |
| `label` | string | Yes | Display label for the column |
| `type` | string | Yes | Data type: 'text', 'number', 'date', 'dropdown', 'checkbox' |

**Example:**
```javascript
const columns = [
  { name: 'employeeId', label: 'Employee ID', type: 'text' },
  { name: 'fullName', label: 'Full Name', type: 'text' },
  { name: 'salary', label: 'Salary', type: 'number' },
  { name: 'joinDate', label: 'Join Date', type: 'date' },
  { name: 'department', label: 'Department', type: 'dropdown' },
  { name: 'isActive', label: 'Active', type: 'checkbox' }
];
```

---

## 🎨 Features Included

### 1. Global Search
- Searches across all columns
- Real-time filtering
- Case-insensitive

### 2. Advanced Filters
- Per-column filtering
- Expandable panel
- Multiple filters can be combined
- Shows active filter count

### 3. Sorting
- Click column headers to sort
- Ascending/Descending toggle
- Dropdown to select sort field
- Visual indicators (⬆️⬇️)

### 4. Grouping
- Group by any dropdown or text field
- Shows record count per group
- Maintains sorting within groups

### 5. Clear All
- One-click reset
- Clears all filters, sorting, and grouping

### 6. Record Counter
- Shows filtered count
- Shows original count when filtered
- Updates in real-time

---

## 📊 Return Values

| Property | Type | Description |
|----------|------|-------------|
| `processedData` | Array | Filtered and sorted data (flat array) |
| `groupedData` | Object | Data grouped by selected field `{ groupValue: [items] }` |
| `isGrouped` | Boolean | True if grouping is active |
| `sortConfig` | Object | Current sort state `{ field, direction }` |
| `handleSort` | Function | Call with field name to sort |
| `renderControls` | Function | Renders the controls UI |

---

## 🔧 Integration Checklist

For any new table component:

- [ ] Import `TableControls`
- [ ] Define `columns` array with name, label, type
- [ ] Call `TableControls({ data, columns })`
- [ ] Call `renderControls()` **ABOVE** your table
- [ ] Use `processedData` instead of original data
- [ ] Handle grouped view if needed (check `isGrouped`)
- [ ] Add sort indicators to column headers (optional)

---

## 🎓 Best Practices

1. **Always position controls above the table:**
   ```javascript
   {renderControls()}
   <Table>...</Table>
   ```

2. **Use processedData for rendering:**
   ```javascript
   {processedData.map(...)} // ✅ Correct
   {data.map(...)}          // ❌ Wrong
   ```

3. **Handle grouped view:**
   ```javascript
   {!isGrouped ? (
     <Table>...</Table>
   ) : (
     <GroupedView data={groupedData} />
   )}
   ```

4. **Make columns sortable:**
   ```javascript
   <TableHead 
     onClick={() => handleSort(col.name)}
     className="cursor-pointer"
   >
     {col.label}
   </TableHead>
   ```

---

## 🚀 Future Tables

**For ANY new table you create:**

1. Copy column definition from example
2. Update field names to match your data
3. Add `renderControls()` above table
4. Use `processedData` in table

**That's it!** All filtering, sorting, and grouping will work automatically.

---

## 📍 Current Usage

Already integrated in:
- ✅ Dynamic Master Manager (all custom masters)
- ✅ Machine Master
- ✅ Employee Master
- ✅ Any master created via Master Builder

**Next: Add to existing components:**
- Masters.js (Buyers, Suppliers, Fabrics, etc.)
- BOM Management tables
- MRP Management tables
- Any other data tables

---

## 💡 Example: Adding to Existing Component

**Before:**
```javascript
export default function BuyerList() {
  const [buyers, setBuyers] = useState([]);

  return (
    <Table>
      <TableBody>
        {buyers.map(buyer => (
          <TableRow key={buyer.id}>
            <TableCell>{buyer.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**After:**
```javascript
import TableControls from "@/components/TableControls";

export default function BuyerList() {
  const [buyers, setBuyers] = useState([]);

  const columns = [
    { name: 'name', label: 'Buyer Name', type: 'text' },
    { name: 'contact', label: 'Contact', type: 'text' },
    { name: 'country', label: 'Country', type: 'dropdown' }
  ];

  const { processedData, renderControls } = TableControls({ 
    data: buyers, 
    columns 
  });

  return (
    <div>
      {renderControls()} {/* ADD THIS */}
      
      <Table>
        <TableBody>
          {processedData.map(buyer => ( {/* USE processedData */}
            <TableRow key={buyer.id}>
              <TableCell>{buyer.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

## 🎯 Summary

**One Component. Infinite Tables. Zero Effort.**

Just add these 3 lines to ANY table:
```javascript
const { processedData, renderControls } = TableControls({ data, columns });
{renderControls()}
{processedData.map(...)}
```

All future tables will automatically have:
✅ Search
✅ Filters  
✅ Sorting
✅ Grouping
✅ Record Counter

**No additional code needed!** 🚀
