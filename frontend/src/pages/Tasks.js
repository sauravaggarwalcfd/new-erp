import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    department: 'cutting',
    priority: 'medium',
    due_date: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchWorkers();
  }, [filterStatus]);

  const fetchTasks = async () => {
    try {
      const url = filterStatus ? `${API}/tasks?status=${filterStatus}` : `${API}/tasks`;
      const response = await axios.get(url);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchWorkers = async () => {
    try {
      const response = await axios.get(`${API}/workers?active=true`);
      setWorkers(response.data);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/tasks`, formData);
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        assigned_to: '',
        department: 'cutting',
        priority: 'medium',
        due_date: ''
      });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API}/tasks/${id}`);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      await axios.put(`${API}/tasks/${id}?status=${status}`);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getWorkerName = (workerId) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'Unknown';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge badge-pending',
      in_progress: 'badge badge-in-progress',
      completed: 'badge badge-completed'
    };
    return badges[status] || 'badge';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'badge bg-gray-200 text-gray-800',
      medium: 'badge badge-in-progress',
      high: 'badge bg-orange-200 text-orange-800',
      urgent: 'badge badge-urgent'
    };
    return badges[priority] || 'badge';
  };

  const departments = ['cutting', 'stitching', 'finishing', 'qc', 'packaging', 'admin'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Tasks & Communication</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
          data-testid="create-task-button"
        >
          {showForm ? 'Cancel' : '+ Create Task'}
        </button>
      </div>

      {/* Filter by Status */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</label>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-4 py-2 rounded-lg transition ${filterStatus === '' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            data-testid="filter-all-tasks"
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg transition ${filterStatus === 'pending' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            data-testid="filter-pending-tasks"
          >
            Pending
          </button>
          <button
            onClick={() => setFilterStatus('in_progress')}
            className={`px-4 py-2 rounded-lg transition ${filterStatus === 'in_progress' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            data-testid="filter-in-progress-tasks"
          >
            In Progress
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-lg transition ${filterStatus === 'completed' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            data-testid="filter-completed-tasks"
          >
            Completed
          </button>
        </div>
      </div>

      {/* Create Task Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6" data-testid="task-form">
          <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="task-title"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="task-description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  required
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  data-testid="task-assign-to"
                >
                  <option value="">Select Worker</option>
                  {workers.map(worker => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name} - {worker.department}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  data-testid="task-department"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  data-testid="task-priority"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  data-testid="task-due-date"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
              data-testid="submit-task-button"
            >
              Create Task
            </button>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-lg shadow p-6 card-hover" data-testid={`task-card-${task.id}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{task.title}</h3>
                  <span className={getPriorityBadge(task.priority)}>{task.priority.toUpperCase()}</span>
                  <span className={getStatusBadge(task.status)}>{task.status.replace('_', ' ')}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>👤 <strong>Assigned:</strong> {getWorkerName(task.assigned_to)}</span>
                  <span>🏭 <strong>Dept:</strong> {task.department.toUpperCase()}</span>
                  {task.due_date && (
                    <span>📅 <strong>Due:</strong> {task.due_date}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(task.id)}
                className="text-red-600 hover:text-red-800 ml-4"
                data-testid={`delete-task-${task.id}`}
              >
                🗑️
              </button>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <select
                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                value={task.status}
                className="text-sm border rounded px-3 py-1"
                data-testid={`task-status-select-${task.id}`}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      {tasks.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500" data-testid="no-tasks-message">
          {filterStatus 
            ? `No ${filterStatus.replace('_', ' ')} tasks found.` 
            : 'No tasks yet. Create your first task!'}
        </div>
      )}
    </div>
  );
};

export default Tasks;