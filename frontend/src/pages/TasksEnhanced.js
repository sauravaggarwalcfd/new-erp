import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TaskCreateForm from '../components/TaskCreateForm';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TasksEnhanced = () => {
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCreatedTask, setLastCreatedTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    department: 'cutting',
    priority: 'medium',
    due_date: '',
    tags: [],
    estimated_hours: '',
    frequency: 'once',
    recurrence_pattern: '',
    start_date: '',
    specific_dates: [],
    reminder_enabled: false,
    reminder_before_hours: 24
  });

  // Task detail modal states
  const [comments, setComments] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [totalHours, setTotalHours] = useState(0);

  // Form states
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [newTag, setNewTag] = useState('');
  const [timeLogHours, setTimeLogHours] = useState('');
  const [timeLogDesc, setTimeLogDesc] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  const departments = ['cutting', 'stitching', 'finishing', 'qc', 'packaging', 'admin'];
  const currentUser = { id: '1202fa63-f5e0-430d-9d17-f59ee91ec49f', name: 'John Smith' }; // Use actual worker ID

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

  const handleSubmit = async (taskData) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting task data:', {
        ...taskData,
        initial_attachments: taskData.initial_attachments?.map(att => ({
          ...att,
          file_url: att.file_url ? `${att.file_url.substring(0, 50)}... (${att.file_url.length} chars)` : 'No URL'
        }))
      });
      
      // Create task with extended timeout for file uploads
      const response = await axios.post(`${API}/tasks`, taskData, {
        timeout: 60000, // 60 second timeout for 6MB file uploads
        maxContentLength: 50 * 1024 * 1024, // 50MB max request size
        maxBodyLength: 50 * 1024 * 1024 // 50MB max body size
      });
      
      console.log('Task created successfully:', response.data);
      
      setLastCreatedTask(response.data);
      setShowForm(false);
      await fetchTasks(); // Refresh task list
      
      // Show success message
      setTimeout(() => {
        alert(`✅ SUCCESS! Task "${taskData.title}" has been created and saved!${taskData.initial_attachments?.length ? ` (${taskData.initial_attachments.length} files attached)` : ''}`);
      }, 500);
      
    } catch (error) {
      console.error('Error creating task:', error);
      console.error('Error details:', error.response?.data);
      
      let errorMessage = 'Unknown error occurred';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Files might be too large.';
      } else if (error.response?.status === 413) {
        errorMessage = 'Request too large. Please use smaller images or fewer attachments.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid data format. Check your attachments.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert('❌ Error creating task: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTaskDetail = async (task) => {
    setSelectedTask(task);
    await fetchTaskDetails(task.id);
  };

  const fetchTaskDetails = async (taskId) => {
    try {
      const [commentsRes, subtasksRes, attachmentsRes, timeLogsRes, activitiesRes, totalHoursRes] = await Promise.all([
        axios.get(`${API}/tasks/${taskId}/comments`),
        axios.get(`${API}/tasks/${taskId}/subtasks`),
        axios.get(`${API}/tasks/${taskId}/attachments`),
        axios.get(`${API}/tasks/${taskId}/time-logs`),
        axios.get(`${API}/tasks/${taskId}/activities`),
        axios.get(`${API}/tasks/${taskId}/total-hours`)
      ]);
      
      setComments(commentsRes.data);
      setSubtasks(subtasksRes.data);
      setAttachments(attachmentsRes.data);
      setTimeLogs(timeLogsRes.data);
      setActivities(activitiesRes.data);
      setTotalHours(totalHoursRes.data.total_hours);
    } catch (error) {
      console.error('Error fetching task details:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post(`${API}/tasks/${selectedTask.id}/comments`, {
        task_id: selectedTask.id,
        user_id: currentUser.id,
        user_name: currentUser.name,
        comment: newComment
      });
      setNewComment('');
      fetchTaskDetails(selectedTask.id);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;
    try {
      await axios.post(`${API}/tasks/${selectedTask.id}/subtasks`, {
        task_id: selectedTask.id,
        title: newSubtask
      });
      setNewSubtask('');
      fetchTaskDetails(selectedTask.id);
    } catch (error) {
      console.error('Error adding subtask:', error);
    }
  };

  const toggleSubtask = async (subtaskId, completed) => {
    try {
      await axios.put(`${API}/tasks/${selectedTask.id}/subtasks/${subtaskId}?completed=${!completed}`);
      fetchTaskDetails(selectedTask.id);
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const handleAddTimeLog = async () => {
    if (!timeLogHours) return;
    try {
      await axios.post(`${API}/tasks/${selectedTask.id}/time-logs`, {
        task_id: selectedTask.id,
        user_id: currentUser.id,
        user_name: currentUser.name,
        hours: parseFloat(timeLogHours),
        description: timeLogDesc
      });
      setTimeLogHours('');
      setTimeLogDesc('');
      fetchTaskDetails(selectedTask.id);
    } catch (error) {
      console.error('Error adding time log:', error);
    }
  };

  const handleAddAttachment = async () => {
    if (!attachmentUrl.trim() || !attachmentName.trim()) return;
    try {
      await axios.post(`${API}/tasks/${selectedTask.id}/attachments`, {
        task_id: selectedTask.id,
        file_name: attachmentName,
        file_url: attachmentUrl,
        file_type: 'link',
        uploaded_by: currentUser.name
      });
      setAttachmentUrl('');
      setAttachmentName('');
      fetchTaskDetails(selectedTask.id);
    } catch (error) {
      console.error('Error adding attachment:', error);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim() || !selectedTask) return;
    const updatedTags = [...(selectedTask.tags || []), newTag];
    try {
      await axios.put(`${API}/tasks/${selectedTask.id}/tags`, updatedTags);
      setNewTag('');
      setSelectedTask({ ...selectedTask, tags: updatedTags });
      fetchTasks();
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    const updatedTags = selectedTask.tags.filter(tag => tag !== tagToRemove);
    try {
      await axios.put(`${API}/tasks/${selectedTask.id}/tags`, updatedTags);
      setSelectedTask({ ...selectedTask, tags: updatedTags });
      fetchTasks();
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      await axios.put(`${API}/tasks/${id}?status=${status}`);
      fetchTasks();
      if (selectedTask && selectedTask.id === id) {
        setSelectedTask({ ...selectedTask, status });
        fetchTaskDetails(id);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API}/tasks/${id}`);
        fetchTasks();
        if (selectedTask && selectedTask.id === id) {
          setSelectedTask(null);
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getWorkerName = (workerId) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'Unknown';
  };

  const getFrequencyIcon = (frequency) => {
    const icons = {
      once: '⏱️',
      daily: '📅',
      weekly: '📆',
      monthly: '🗓️',
      specific_dates: '📌'
    };
    return icons[frequency] || '⏱️';
  };

  const getFrequencyLabel = (task) => {
    if (task.frequency === 'once') return 'One-time';
    if (task.frequency === 'daily') return 'Daily';
    if (task.frequency === 'weekly') return `Weekly (${task.recurrence_pattern})`;
    if (task.frequency === 'monthly') return `Monthly (${task.recurrence_pattern}th)`;
    if (task.frequency === 'specific_dates') return `${task.specific_dates?.length || 0} dates`;
    return 'One-time';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium',
      in_progress: 'px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium',
      completed: 'px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium'
    };
    return badges[status] || 'px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium',
      medium: 'px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium',
      high: 'px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium',
      urgent: 'px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium'
    };
    return badges[priority] || 'px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-8">
      {/* Header */}
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

      {/* Success Banner */}
      {lastCreatedTask && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-medium text-green-800">Task Created Successfully!</p>
              <p className="text-sm text-green-600">"{lastCreatedTask.title}" has been saved and is now visible in the task list.</p>
            </div>
          </div>
          <button
            onClick={() => setLastCreatedTask(null)}
            className="text-green-600 hover:text-green-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Filter by Status */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</label>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-4 py-2 rounded-lg transition ${filterStatus === '' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg transition ${filterStatus === 'pending' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterStatus('in_progress')}
            className={`px-4 py-2 rounded-lg transition ${filterStatus === 'in_progress' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-lg transition ${filterStatus === 'completed' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Create Task Form */}
      {showForm && (
        <TaskCreateForm 
          workers={workers}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          currentUser={currentUser}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Tasks List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Cards */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className="bg-white rounded-lg shadow p-5 hover:shadow-lg transition cursor-pointer"
              onClick={() => openTaskDetail(task)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{task.title}</h3>
                    <span className={getPriorityBadge(task.priority)}>{task.priority.toUpperCase()}</span>
                    <span className={getStatusBadge(task.status)}>{task.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                  <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
                    <span>👤 {getWorkerName(task.assigned_to)}</span>
                    <span>🏭 {task.department.toUpperCase()}</span>
                    {task.due_date && <span>📅 {task.due_date}</span>}
                    <span className="flex items-center gap-1">
                      {getFrequencyIcon(task.frequency)}
                      <span>{getFrequencyLabel(task)}</span>
                    </span>
                    {task.reminder_enabled && <span>🔔 Reminder ON</span>}
                  </div>
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {task.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(task.id);
                  }}
                  className="text-red-600 hover:text-red-800 ml-2"
                >
                  🗑️
                </button>
              </div>
              <div className="flex gap-2 pt-3 border-t">
                <select
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateTaskStatus(task.id, e.target.value);
                  }}
                  value={task.status}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              {filterStatus 
                ? `No ${filterStatus.replace('_', ' ')} tasks found.` 
                : 'No tasks yet. Create your first task!'}
            </div>
          )}
        </div>

        {/* Task Detail Panel */}
        {selectedTask && (
          <div className="bg-white rounded-lg shadow p-6 sticky top-8 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedTask.title}</h2>
                <div className="flex gap-2 mb-3">
                  <span className={getPriorityBadge(selectedTask.priority)}>{selectedTask.priority}</span>
                  <span className={getStatusBadge(selectedTask.status)}>{selectedTask.status.replace('_', ' ')}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-sm text-gray-600">{selectedTask.description}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Assigned to:</span>
                  <p className="font-medium">{getWorkerName(selectedTask.assigned_to)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Department:</span>
                  <p className="font-medium">{selectedTask.department}</p>
                </div>
                <div>
                  <span className="text-gray-500">Due Date:</span>
                  <p className="font-medium">{selectedTask.due_date || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Time:</span>
                  <p className="font-medium">
                    {totalHours.toFixed(1)}h / {selectedTask.estimated_hours || '—'}h
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Frequency:</span>
                  <p className="font-medium">{getFrequencyIcon(selectedTask.frequency)} {getFrequencyLabel(selectedTask)}</p>
                </div>
                {selectedTask.reminder_enabled && (
                  <div>
                    <span className="text-gray-500">Reminder:</span>
                    <p className="font-medium">🔔 {selectedTask.reminder_before_hours}h before</p>
                  </div>
                )}
                {selectedTask.start_date && (
                  <div>
                    <span className="text-gray-500">Start Date:</span>
                    <p className="font-medium">{selectedTask.start_date}</p>
                  </div>
                )}
                {selectedTask.specific_dates && selectedTask.specific_dates.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Scheduled Dates:</span>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {selectedTask.specific_dates.map((date, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          {date}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Tags</h3>
                <div className="flex gap-2 flex-wrap mb-2">
                  {selectedTask.tags && selectedTask.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs flex items-center gap-1">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:text-purple-900">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Subtasks */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Subtasks ({subtasks.filter(s => s.completed).length}/{subtasks.length})</h3>
                <div className="space-y-2 mb-3">
                  {subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => toggleSubtask(subtask.id, subtask.completed)}
                        className="w-4 h-4"
                      />
                      <span className={`text-sm ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add subtask"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                  />
                  <button
                    onClick={handleAddSubtask}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Time Logs */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Time Tracking</h3>
                <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                  {timeLogs.map((log) => (
                    <div key={log.id} className="text-xs bg-gray-50 p-2 rounded">
                      <div className="flex justify-between">
                        <span className="font-medium">{log.user_name}</span>
                        <span className="text-blue-600 font-bold">{log.hours}h</span>
                      </div>
                      {log.description && <p className="text-gray-600 mt-1">{log.description}</p>}
                      <p className="text-gray-400 text-xs mt-1">{formatDate(log.logged_at)}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.5"
                      value={timeLogHours}
                      onChange={(e) => setTimeLogHours(e.target.value)}
                      placeholder="Hours"
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      value={timeLogDesc}
                      onChange={(e) => setTimeLogDesc(e.target.value)}
                      placeholder="Description (optional)"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <button
                    onClick={handleAddTimeLog}
                    className="w-full px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Log Time
                  </button>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Attachments ({attachments.length})</h3>
                <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="text-xs bg-gray-50 p-2 rounded flex justify-between items-center">
                      <div>
                        <a href={attachment.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                          📎 {attachment.file_name}
                        </a>
                        <p className="text-gray-400 text-xs mt-1">By {attachment.uploaded_by} • {formatDate(attachment.uploaded_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    placeholder="File name"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="File URL or link"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <button
                    onClick={handleAddAttachment}
                    className="w-full px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                  >
                    Add Attachment
                  </button>
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Comments ({comments.length})</h3>
                <div className="space-y-3 mb-3 max-h-64 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">{comment.user_name}</span>
                        <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.comment}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    rows="3"
                  />
                  <button
                    onClick={handleAddComment}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Add Comment
                  </button>
                </div>
              </div>

              {/* Activity Log */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Activity Log</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activities.map((activity) => (
                    <div key={activity.id} className="text-xs bg-blue-50 p-2 rounded">
                      <div className="flex justify-between">
                        <span className="font-medium text-blue-800">{activity.user_name}</span>
                        <span className="text-gray-400">{formatDate(activity.created_at)}</span>
                      </div>
                      <p className="text-gray-600 mt-1">
                        <span className="font-medium">{activity.action}</span>: {activity.details}
                      </p>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No activities yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksEnhanced;