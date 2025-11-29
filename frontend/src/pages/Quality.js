import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Quality = () => {
  const [qualityChecks, setQualityChecks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    order_id: '',
    stage: 'cutting',
    inspector_id: '',
    defects_found: [''],
    notes: ''
  });

  useEffect(() => {
    fetchQualityChecks();
    fetchOrders();
    fetchWorkers();
  }, []);

  const fetchQualityChecks = async () => {
    try {
      const response = await axios.get(`${API}/quality-checks`);
      setQualityChecks(response.data);
    } catch (error) {
      console.error('Error fetching quality checks:', error);
    }
  };

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
      const response = await axios.get(`${API}/workers?department=qc`);
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
        defects_found: formData.defects_found.filter(d => d.trim() !== '')
      };
      await axios.post(`${API}/quality-checks`, cleanedData);
      setShowForm(false);
      setFormData({
        order_id: '',
        stage: 'cutting',
        inspector_id: '',
        defects_found: [''],
        notes: ''
      });
      fetchQualityChecks();
    } catch (error) {
      console.error('Error creating quality check:', error);
    }
  };

  const addDefectField = () => {
    setFormData({
      ...formData,
      defects_found: [...formData.defects_found, '']
    });
  };

  const updateDefect = (index, value) => {
    const newDefects = [...formData.defects_found];
    newDefects[index] = value;
    setFormData({ ...formData, defects_found: newDefects });
  };

  const getOrderDetails = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    return order ? `${order.style_number} - ${order.customer_name}` : orderId.substring(0, 8);
  };

  const getWorkerName = (workerId) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'Unknown';
  };

  const getStatusBadge = (status) => {
    const badges = {
      passed: 'badge badge-completed',
      failed: 'badge badge-failed',
      pending: 'badge badge-pending'
    };
    return badges[status] || 'badge';
  };

  const passRate = qualityChecks.length > 0 
    ? ((qualityChecks.filter(qc => qc.status === 'passed').length / qualityChecks.length) * 100).toFixed(1)
    : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quality Control</h1>
          <p className="text-gray-600 mt-1">Pass Rate: <span className="font-bold text-green-600">{passRate}%</span></p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
          data-testid="add-qc-button"
        >
          {showForm ? 'Cancel' : '+ New QC Check'}
        </button>
      </div>

      {/* QC Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6" data-testid="qc-form">
          <h2 className="text-xl font-semibold mb-4">New Quality Check</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Order</label>
                <select
                  required
                  value={formData.order_id}
                  onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                  data-testid="qc-order-select"
                >
                  <option value="">Select Order</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.style_number} - {order.customer_name}
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
                  data-testid="qc-stage-select"
                >
                  <option value="cutting">Cutting</option>
                  <option value="stitching">Stitching</option>
                  <option value="finishing">Finishing</option>
                  <option value="packaging">Packaging</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inspector</label>
                <select
                  required
                  value={formData.inspector_id}
                  onChange={(e) => setFormData({ ...formData, inspector_id: e.target.value })}
                  data-testid="qc-inspector-select"
                >
                  <option value="">Select Inspector</option>
                  {workers.map(worker => (
                    <option key={worker.id} value={worker.id}>{worker.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Defects Found (leave empty if passed)</label>
              {formData.defects_found.map((defect, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder="e.g., Loose stitching, Color mismatch"
                  value={defect}
                  onChange={(e) => updateDefect(index, e.target.value)}
                  className="mb-2"
                  data-testid={`qc-defect-${index}`}
                />
              ))}
              <button
                type="button"
                onClick={addDefectField}
                className="text-blue-600 text-sm hover:underline"
                data-testid="add-defect-field"
              >
                + Add Defect
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                rows="2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                data-testid="qc-notes"
              />
            </div>

            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
              data-testid="submit-qc-button"
            >
              Submit QC Check
            </button>
          </form>
        </div>
      )}

      {/* QC Checks List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Stage</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Inspector</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Defects</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Checked At</th>
              <th className="px-6 py-3 text-xs uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody>
            {qualityChecks.map((qc) => (
              <tr key={qc.id} className="border-t" data-testid={`qc-row-${qc.id}`}>
                <td className="px-6 py-4 text-sm">{getOrderDetails(qc.order_id)}</td>
                <td className="px-6 py-4 text-sm">{qc.stage.replace('_', ' ')}</td>
                <td className="px-6 py-4 text-sm">{getWorkerName(qc.inspector_id)}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={getStatusBadge(qc.status)}>{qc.status}</span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {qc.defects_found.length === 0 ? (
                    <span className="text-green-600">None</span>
                  ) : (
                    <ul className="list-disc list-inside text-xs text-red-600">
                      {qc.defects_found.map((defect, idx) => (
                        <li key={idx}>{defect}</li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  {new Date(qc.checked_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">{qc.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {qualityChecks.length === 0 && (
          <div className="text-center py-8 text-gray-500" data-testid="no-qc-message">
            No quality checks yet. Create your first QC check!
          </div>
        )}
      </div>
    </div>
  );
};

export default Quality;