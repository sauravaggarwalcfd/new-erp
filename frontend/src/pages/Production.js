import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Production = () => {
  const [orders, setOrders] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [stages, setStages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    order_id: '',
    stage: 'cutting',
    assigned_worker_id: '',
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
    fetchWorkers();
    fetchStages();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  const fetchStages = async () => {
    try {
      const response = await axios.get(`${API}/production`);
      setStages(response.data);
    } catch (error) {
      console.error('Error fetching production stages:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/production`, formData);
      setShowForm(false);
      setFormData({
        order_id: '',
        stage: 'cutting',
        assigned_worker_id: '',
        notes: ''
      });
      fetchStages();
    } catch (error) {
      console.error('Error creating production stage:', error);
    }
  };

  const updateStageStatus = async (stageId, status) => {
    try {
      const updateData = { status };
      if (status === 'in_progress') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      await axios.put(`${API}/production/${stageId}?status=${status}&started_at=${updateData.started_at || ''}&completed_at=${updateData.completed_at || ''}`);
      fetchStages();
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  const getStageIcon = (stage) => {
    const icons = {
      cutting: '✂️',
      stitching: '🧵',
      finishing: '✨',
      quality_check: '✅',
      packaging: '📦'
    };
    return icons[stage] || '⚙️';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge badge-pending',
      in_progress: 'badge badge-in-progress',
      completed: 'badge badge-completed'
    };
    return badges[status] || 'badge';
  };

  const getWorkerName = (workerId) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'Unassigned';
  };

  const getOrderDetails = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    return order ? `${order.style_number} - ${order.customer_name}` : orderId.substring(0, 8);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Production Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
          data-testid="start-production-button"
        >
          {showForm ? 'Cancel' : '+ Start Production Stage'}
        </button>
      </div>

      {/* Production Stage Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6" data-testid="production-form">
          <h2 className="text-xl font-semibold mb-4">Start Production Stage</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Order</label>
                <select
                  required
                  value={formData.order_id}
                  onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                  data-testid="production-order-select"
                >
                  <option value="">Select Order</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.style_number} - {order.customer_name} ({order.total_quantity} pcs)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Production Stage</label>
                <select
                  required
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  data-testid="production-stage-select"
                >
                  <option value="cutting">Cutting</option>
                  <option value="stitching">Stitching</option>
                  <option value="finishing">Finishing</option>
                  <option value="quality_check">Quality Check</option>
                  <option value="packaging">Packaging</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Worker</label>
                <select
                  value={formData.assigned_worker_id}
                  onChange={(e) => setFormData({ ...formData, assigned_worker_id: e.target.value })}
                  data-testid="production-worker-select"
                >
                  <option value="">Unassigned</option>
                  {workers.map(worker => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name} - {worker.department}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                rows="2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                data-testid="production-notes"
              />
            </div>

            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
              data-testid="submit-production-button"
            >
              Start Stage
            </button>
          </form>
        </div>
      )}

      {/* Production Stages List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Stage</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Worker</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Started</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Completed</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage) => (
              <tr key={stage.id} className="border-t" data-testid={`production-row-${stage.id}`}>
                <td className="px-6 py-4 text-sm">
                  <span className="text-xl mr-2">{getStageIcon(stage.stage)}</span>
                  {stage.stage.replace('_', ' ').toUpperCase()}
                </td>
                <td className="px-6 py-4 text-sm">{getOrderDetails(stage.order_id)}</td>
                <td className="px-6 py-4 text-sm">{getWorkerName(stage.assigned_worker_id)}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={getStatusBadge(stage.status)}>{stage.status.replace('_', ' ')}</span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {stage.started_at ? new Date(stage.started_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                  {stage.completed_at ? new Date(stage.completed_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <select
                    onChange={(e) => updateStageStatus(stage.id, e.target.value)}
                    value={stage.status}
                    className="text-xs border rounded px-2 py-1"
                    data-testid={`production-status-select-${stage.id}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stages.length === 0 && (
          <div className="text-center py-8 text-gray-500" data-testid="no-production-message">
            No production stages yet. Start a new production stage!
          </div>
        )}
      </div>
    </div>
  );
};

export default Production;