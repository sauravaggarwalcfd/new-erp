import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    materials_supplied: ['']
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

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
      const cleanedData = {
        ...formData,
        materials_supplied: formData.materials_supplied.filter(m => m.trim() !== '')
      };
      await axios.post(`${API}/suppliers`, cleanedData);
      setShowForm(false);
      setFormData({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        materials_supplied: ['']
      });
      fetchSuppliers();
    } catch (error) {
      console.error('Error creating supplier:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await axios.delete(`${API}/suppliers/${id}`);
        fetchSuppliers();
      } catch (error) {
        console.error('Error deleting supplier:', error);
      }
    }
  };

  const addMaterialField = () => {
    setFormData({
      ...formData,
      materials_supplied: [...formData.materials_supplied, '']
    });
  };

  const updateMaterial = (index, value) => {
    const newMaterials = [...formData.materials_supplied];
    newMaterials[index] = value;
    setFormData({ ...formData, materials_supplied: newMaterials });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Suppliers Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          data-testid="add-supplier-button"
        >
          {showForm ? 'Cancel' : '+ Add Supplier'}
        </button>
      </div>

      {/* Add Supplier Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6" data-testid="supplier-form">
          <h2 className="text-xl font-semibold mb-4">Add New Supplier</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="supplier-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  required
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  data-testid="supplier-contact-person"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="supplier-phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="supplier-email"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  rows="2"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  data-testid="supplier-address"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Materials Supplied</label>
              {formData.materials_supplied.map((material, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder="e.g., Cotton Fabric, Buttons"
                  value={material}
                  onChange={(e) => updateMaterial(index, e.target.value)}
                  className="mb-2"
                  data-testid={`supplier-material-${index}`}
                />
              ))}
              <button
                type="button"
                onClick={addMaterialField}
                className="text-blue-600 text-sm hover:underline"
                data-testid="add-material-field"
              >
                + Add Material
              </button>
            </div>

            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
              data-testid="submit-supplier-button"
            >
              Add Supplier
            </button>
          </form>
        </div>
      )}

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white rounded-lg shadow p-6 card-hover" data-testid={`supplier-card-${supplier.id}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{supplier.name}</h3>
                <p className="text-sm text-gray-600">{supplier.contact_person}</p>
              </div>
              <button
                onClick={() => handleDelete(supplier.id)}
                className="text-red-600 hover:text-red-800"
                data-testid={`delete-supplier-${supplier.id}`}
              >
                🗑️
              </button>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm">
                <span className="font-medium">📞 Phone:</span> {supplier.phone}
              </p>
              <p className="text-sm">
                <span className="font-medium">✉️ Email:</span> {supplier.email}
              </p>
              <p className="text-sm">
                <span className="font-medium">📍 Address:</span> {supplier.address}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Materials Supplied:</p>
              <div className="flex flex-wrap gap-2">
                {supplier.materials_supplied.map((material, index) => (
                  <span key={index} className="badge badge-in-progress">
                    {material}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {suppliers.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500" data-testid="no-suppliers-message">
          No suppliers found. Add your first supplier!
        </div>
      )}
    </div>
  );
};

export default Suppliers;