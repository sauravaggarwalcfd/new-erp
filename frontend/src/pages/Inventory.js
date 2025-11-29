import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Inventory = () => {
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'fabric',
    unit: 'meters',
    quantity: 0,
    reorder_level: 0,
    supplier_id: '',
    unit_price: 0
  });

  useEffect(() => {
    fetchMaterials();
    fetchSuppliers();
  }, [filterLowStock]);

  const fetchMaterials = async () => {
    try {
      const url = filterLowStock ? `${API}/materials?low_stock=true` : `${API}/materials`;
      const response = await axios.get(url);
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API}/suppliers`);
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/materials`, formData);
      setShowForm(false);
      setFormData({
        name: '',
        category: 'fabric',
        unit: 'meters',
        quantity: 0,
        reorder_level: 0,
        supplier_id: '',
        unit_price: 0
      });
      fetchMaterials();
    } catch (error) {
      console.error('Error creating material:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await axios.delete(`${API}/materials/${id}`);
        fetchMaterials();
      } catch (error) {
        console.error('Error deleting material:', error);
      }
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    try {
      await axios.put(`${API}/materials/${id}?quantity=${newQuantity}`);
      fetchMaterials();
    } catch (error) {
      console.error('Error updating material:', error);
    }
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'N/A';
  };

  const isLowStock = (material) => {
    return material.quantity <= material.reorder_level;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`px-4 py-2 rounded-lg transition ${filterLowStock ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            data-testid="filter-low-stock-button"
          >
            {filterLowStock ? '⚠️ Showing Low Stock' : 'Show Low Stock'}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            data-testid="add-material-button"
          >
            {showForm ? 'Cancel' : '+ Add Material'}
          </button>
        </div>
      </div>

      {/* Add Material Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6" data-testid="material-form">
          <h2 className="text-xl font-semibold mb-4">Add New Material</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="material-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  data-testid="material-category"
                >
                  <option value="fabric">Fabric</option>
                  <option value="thread">Thread</option>
                  <option value="button">Button</option>
                  <option value="zipper">Zipper</option>
                  <option value="label">Label</option>
                  <option value="tag">Tag</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  data-testid="material-unit"
                >
                  <option value="meters">Meters</option>
                  <option value="pieces">Pieces</option>
                  <option value="kg">Kilograms</option>
                  <option value="rolls">Rolls</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                  data-testid="material-quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.reorder_level}
                  onChange={(e) => setFormData({ ...formData, reorder_level: parseFloat(e.target.value) })}
                  data-testid="material-reorder-level"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
                  data-testid="material-unit-price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <select
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  data-testid="material-supplier"
                >
                  <option value="">No Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
              data-testid="submit-material-button"
            >
              Add Material
            </button>
          </form>
        </div>
      )}

      {/* Materials List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Material</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Unit</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Reorder Level</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Unit Price</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Supplier</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material) => (
              <tr 
                key={material.id} 
                className={`border-t ${isLowStock(material) ? 'bg-red-50' : ''}`}
                data-testid={`material-row-${material.id}`}
              >
                <td className="px-6 py-4 text-sm font-medium">
                  {material.name}
                  {isLowStock(material) && <span className="ml-2 text-red-600">⚠️</span>}
                </td>
                <td className="px-6 py-4 text-sm">{material.category}</td>
                <td className="px-6 py-4 text-sm">
                  <input
                    type="number"
                    step="0.01"
                    value={material.quantity}
                    onChange={(e) => updateQuantity(material.id, parseFloat(e.target.value))}
                    className="w-20 px-2 py-1 border rounded"
                    data-testid={`material-quantity-input-${material.id}`}
                  />
                </td>
                <td className="px-6 py-4 text-sm">{material.unit}</td>
                <td className="px-6 py-4 text-sm">{material.reorder_level}</td>
                <td className="px-6 py-4 text-sm">${material.unit_price}</td>
                <td className="px-6 py-4 text-sm">{getSupplierName(material.supplier_id)}</td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="text-red-600 hover:text-red-800"
                    data-testid={`delete-material-${material.id}`}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {materials.length === 0 && (
          <div className="text-center py-8 text-gray-500" data-testid="no-materials-message">
            {filterLowStock ? 'No low stock materials!' : 'No materials found. Add your first material!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;