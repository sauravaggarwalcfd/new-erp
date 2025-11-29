import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Employees = () => {
  const [workers, setWorkers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    department: 'cutting',
    phone: '',
    skills: ['']
  });

  useEffect(() => {
    fetchWorkers();
  }, [filterDepartment]);

  const fetchWorkers = async () => {
    try {
      const url = filterDepartment 
        ? `${API}/workers?department=${filterDepartment}&active=true` 
        : `${API}/workers?active=true`;
      const response = await axios.get(url);
      setWorkers(response.data);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanedData = {
        ...formData,
        skills: formData.skills.filter(s => s.trim() !== '')
      };
      await axios.post(`${API}/workers`, cleanedData);
      setShowForm(false);
      setFormData({
        name: '',
        department: 'cutting',
        phone: '',
        skills: ['']
      });
      fetchWorkers();
    } catch (error) {
      console.error('Error creating worker:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      try {
        await axios.delete(`${API}/workers/${id}`);
        fetchWorkers();
      } catch (error) {
        console.error('Error deleting worker:', error);
      }
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await axios.put(`${API}/workers/${id}?active=${!currentStatus}`);
      fetchWorkers();
    } catch (error) {
      console.error('Error updating worker status:', error);
    }
  };

  const addSkillField = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, '']
    });
  };

  const updateSkill = (index, value) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
    setFormData({ ...formData, skills: newSkills });
  };

  const getDepartmentIcon = (dept) => {
    const icons = {
      cutting: '✂️',
      stitching: '🧵',
      finishing: '✨',
      qc: '✅',
      packaging: '📦',
      admin: '💼'
    };
    return icons[dept] || '👤';
  };

  const departments = ['cutting', 'stitching', 'finishing', 'qc', 'packaging', 'admin'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Employee Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          data-testid="add-employee-button"
        >
          {showForm ? 'Cancel' : '+ Add Employee'}
        </button>
      </div>

      {/* Filter by Department */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Department:</label>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterDepartment('')}
            className={`px-4 py-2 rounded-lg transition ${filterDepartment === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            data-testid="filter-all"
          >
            All
          </button>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setFilterDepartment(dept)}
              className={`px-4 py-2 rounded-lg transition ${filterDepartment === dept ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              data-testid={`filter-${dept}`}
            >
              {getDepartmentIcon(dept)} {dept.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Add Employee Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6" data-testid="employee-form">
          <h2 className="text-xl font-semibold mb-4">Add New Employee</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="employee-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  data-testid="employee-department"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="employee-phone"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              {formData.skills.map((skill, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder="e.g., Industrial sewing, Pattern making"
                  value={skill}
                  onChange={(e) => updateSkill(index, e.target.value)}
                  className="mb-2"
                  data-testid={`employee-skill-${index}`}
                />
              ))}
              <button
                type="button"
                onClick={addSkillField}
                className="text-blue-600 text-sm hover:underline"
                data-testid="add-skill-field"
              >
                + Add Skill
              </button>
            </div>

            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
              data-testid="submit-employee-button"
            >
              Add Employee
            </button>
          </form>
        </div>
      )}

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workers.map((worker) => (
          <div key={worker.id} className="bg-white rounded-lg shadow p-6 card-hover" data-testid={`employee-card-${worker.id}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <span className="text-3xl mr-3">{getDepartmentIcon(worker.department)}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{worker.name}</h3>
                  <p className="text-sm text-gray-600 uppercase">{worker.department}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(worker.id)}
                className="text-red-600 hover:text-red-800"
                data-testid={`delete-employee-${worker.id}`}
              >
                🗑️
              </button>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm">
                <span className="font-medium">📞 Phone:</span> {worker.phone}
              </p>
              <p className="text-sm">
                <span className="font-medium">📅 Joined:</span> {new Date(worker.joined_date).toLocaleDateString()}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Skills:</p>
              <div className="flex flex-wrap gap-2">
                {worker.skills.map((skill, index) => (
                  <span key={index} className="badge badge-in-progress text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <span className={`badge ${worker.active ? 'badge-completed' : 'badge-failed'}`}>
                {worker.active ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={() => toggleActive(worker.id, worker.active)}
                className="text-sm text-blue-600 hover:text-blue-800"
                data-testid={`toggle-active-${worker.id}`}
              >
                {worker.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
      {workers.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500" data-testid="no-employees-message">
          {filterDepartment 
            ? `No employees in ${filterDepartment} department.` 
            : 'No employees found. Add your first employee!'}
        </div>
      )}
    </div>
  );
};

export default Employees;