import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [selectedTaskCompletion, setSelectedTaskCompletion] = useState(null);
  const [completionForm, setCompletionForm] = useState({
    actual_hours: '',
    completion_notes: '',
    completion_status: 'completed',
    completion_attachments: []
  });
  const currentUser = { id: '1202fa63-f5e0-430d-9d17-f59ee91ec49f', name: 'John Smith' }; // Use actual worker ID

  useEffect(() => {
    fetchNotifications();
  }, [showOnlyUnread]);

  const fetchNotifications = async () => {
    try {
      const url = showOnlyUnread 
        ? `${API}/notifications?user_id=${currentUser.id}&unread_only=true`
        : `${API}/notifications?user_id=${currentUser.id}`;
      const response = await axios.get(url);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API}/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleQuickAction = async (notificationId, action) => {
    try {
      await axios.put(`${API}/notifications/${notificationId}/action?action=${action}`);
      markAsRead(notificationId);
    } catch (error) {
      console.error('Error updating notification action:', error);
    }
  };

  const openTaskCompletion = (notification) => {
    setSelectedTaskCompletion(notification);
    setCompletionForm({
      actual_hours: '',
      completion_notes: '',
      completion_status: 'completed',
      completion_attachments: []
    });
  };

  const submitTaskCompletion = async () => {
    if (!selectedTaskCompletion || !completionForm.completion_notes.trim()) {
      alert('Please fill in completion notes.');
      return;
    }

    try {
      const completionData = {
        task_id: selectedTaskCompletion.task_id,
        completed_by: currentUser.id,
        completed_by_name: currentUser.name,
        actual_hours: completionForm.actual_hours ? parseFloat(completionForm.actual_hours) : null,
        completion_notes: completionForm.completion_notes,
        completion_status: completionForm.completion_status,
        completion_attachments: completionForm.completion_attachments
      };

      await axios.post(`${API}/tasks/${selectedTaskCompletion.task_id}/complete`, completionData);
      
      // Mark notification as read and action taken
      await handleQuickAction(selectedTaskCompletion.id, 'completed');
      
      setSelectedTaskCompletion(null);
      alert('✅ Task completed successfully!');
      
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Error completing task. Please try again.');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      task_created: '🆕',
      task_reminder: '⏰',
      task_completed: '✅',
      task_overdue: '🚨',
      task_updated: '📝'
    };
    return icons[type] || '📋';
  };

  const getNotificationColor = (type, read) => {
    const baseColors = {
      task_created: read ? 'bg-blue-50 border-blue-200' : 'bg-blue-100 border-blue-300',
      task_reminder: read ? 'bg-yellow-50 border-yellow-200' : 'bg-yellow-100 border-yellow-300',
      task_completed: read ? 'bg-green-50 border-green-200' : 'bg-green-100 border-green-300',
      task_overdue: read ? 'bg-red-50 border-red-200' : 'bg-red-100 border-red-300',
      task_updated: read ? 'bg-purple-50 border-purple-200' : 'bg-purple-100 border-purple-300'
    };
    return baseColors[type] || (read ? 'bg-gray-50 border-gray-200' : 'bg-gray-100 border-gray-300');
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Task Notifications</h1>
          <p className="text-gray-600 mt-1">Interactive notifications for task management</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            className={`px-4 py-2 rounded-lg transition ${
              showOnlyUnread ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
            data-testid="filter-unread-button"
          >
            {showOnlyUnread ? '📬 Showing Unread Only' : '📭 Show Unread Only'}
          </button>
          <button
            onClick={fetchNotifications}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            data-testid="refresh-notifications-button"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`rounded-xl border p-6 transition hover:shadow-md ${
              getNotificationColor(notification.notification_type, notification.read)
            }`}
            data-testid={`notification-${notification.id}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getNotificationIcon(notification.notification_type)}</span>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{notification.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!notification.read && (
                  <span className="w-3 h-3 bg-blue-500 rounded-full" title="Unread"></span>
                )}
                <span className="text-xs text-gray-500">
                  {formatDateTime(notification.created_at)}
                </span>
              </div>
            </div>

            {/* Task Details */}
            <div className="bg-white/60 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Task:</span>
                  <p className="font-medium">{notification.task_data.title}</p>
                </div>
                <div>
                  <span className="text-gray-500">Priority:</span>
                  <p className="font-medium capitalize">{notification.task_data.priority}</p>
                </div>
                <div>
                  <span className="text-gray-500">Department:</span>
                  <p className="font-medium capitalize">{notification.task_data.department}</p>
                </div>
                <div>
                  <span className="text-gray-500">Due Date:</span>
                  <p className="font-medium">{notification.task_data.due_date || 'Not set'}</p>
                </div>
                {notification.task_data.estimated_hours && (
                  <div>
                    <span className="text-gray-500">Estimated:</span>
                    <p className="font-medium">{notification.task_data.estimated_hours}h</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Status:</span>
                  <p className="font-medium capitalize">{notification.task_data.status?.replace('_', ' ')}</p>
                </div>
              </div>
              
              {notification.task_data.description && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-gray-500 text-sm">Description:</span>
                  <p className="text-sm mt-1">{notification.task_data.description}</p>
                </div>
              )}
              
              {/* Task Attachments */}
              {notification.attachments && notification.attachments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-gray-500 text-sm">Attachments:</span>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {notification.attachments.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                      >
                        📎 {att.file_name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              {notification.notification_type === 'task_created' && (
                <>
                  <button
                    onClick={() => openTaskCompletion(notification)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    data-testid={`complete-task-${notification.id}`}
                  >
                    ✅ Complete Task
                  </button>
                  <button
                    onClick={() => handleQuickAction(notification.id, 'viewed')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    👁️ Mark as Viewed
                  </button>
                </>
              )}
              
              {notification.notification_type === 'task_reminder' && (
                <>
                  <button
                    onClick={() => openTaskCompletion(notification)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    data-testid={`complete-reminder-${notification.id}`}
                  >
                    ✅ Complete Now
                  </button>
                  <button
                    onClick={() => handleQuickAction(notification.id, 'snoozed')}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition"
                  >
                    ⏰ Snooze 1 Hour
                  </button>
                </>
              )}
              
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                >
                  ✓ Mark as Read
                </button>
              )}
            </div>
          </div>
        ))}
        
        {notifications.length === 0 && (
          <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500" data-testid="no-notifications">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-medium mb-2">
              {showOnlyUnread ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-sm">
              {showOnlyUnread 
                ? 'All caught up! Check back later.' 
                : 'Task notifications will appear here when created.'}
            </p>
          </div>
        )}
      </div>

      {/* Task Completion Modal */}
      {selectedTaskCompletion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="completion-modal">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Complete Task</h2>
              <button
                onClick={() => setSelectedTaskCompletion(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Task Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                {selectedTaskCompletion.task_data.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {selectedTaskCompletion.task_data.description}
              </p>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>🏭 {selectedTaskCompletion.task_data.department}</span>
                <span>⚡ {selectedTaskCompletion.task_data.priority}</span>
                {selectedTaskCompletion.task_data.estimated_hours && (
                  <span>⏱️ Est: {selectedTaskCompletion.task_data.estimated_hours}h</span>
                )}
              </div>
            </div>

            {/* Completion Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Completion Status *</label>
                <select
                  value={completionForm.completion_status}
                  onChange={(e) => setCompletionForm({ ...completionForm, completion_status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  data-testid="completion-status"
                >
                  <option value="completed">✅ Fully Completed</option>
                  <option value="partially_completed">⏳ Partially Completed</option>
                  <option value="blocked">🚫 Blocked/Cannot Complete</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Hours Spent</label>
                <input
                  type="number"
                  step="0.5"
                  value={completionForm.actual_hours}
                  onChange={(e) => setCompletionForm({ ...completionForm, actual_hours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 3.5"
                  data-testid="actual-hours"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Completion Notes *</label>
                <textarea
                  rows="4"
                  required
                  value={completionForm.completion_notes}
                  onChange={(e) => setCompletionForm({ ...completionForm, completion_notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Describe what was completed, any issues encountered, results, etc."
                  data-testid="completion-notes"
                />
              </div>

              {/* Completion Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Completion Evidence (Photos/Files)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  data-testid="completion-attachments"
                />
                <p className="text-xs text-gray-500 mt-1">Upload photos or documents showing task completion</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-6 border-t mt-6">
              <button
                onClick={submitTaskCompletion}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                data-testid="submit-completion"
              >
                ✅ Submit Completion
              </button>
              <button
                onClick={() => setSelectedTaskCompletion(null)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;