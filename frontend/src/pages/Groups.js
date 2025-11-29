import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    department: '',
    selectedMembers: []
  });
  const currentUser = { id: '1202fa63-f5e0-430d-9d17-f59ee91ec49f', name: 'John Smith' }; // Use actual worker ID
  
  const departments = ['cutting', 'stitching', 'finishing', 'qc', 'packaging', 'admin'];

  useEffect(() => {
    fetchGroups();
    fetchWorkers();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMessages(selectedGroup.id);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API}/groups?user_id=${currentUser.id}`);
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
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

  const fetchGroupMessages = async (groupId) => {
    try {
      const response = await axios.get(`${API}/groups/${groupId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching group messages:', error);
    }
  };

  const createGroup = async () => {
    if (!groupForm.name.trim() || groupForm.selectedMembers.length === 0) {
      alert('Please fill in group name and select at least one member.');
      return;
    }

    try {
      const members = groupForm.selectedMembers.map(workerId => {
        const worker = workers.find(w => w.id === workerId);
        return {
          user_id: workerId,
          user_name: worker.name,
          role: 'member'
        };
      });
      
      // Add creator as admin
      members.unshift({
        user_id: currentUser.id,
        user_name: currentUser.name,
        role: 'admin'
      });

      const response = await axios.post(`${API}/groups`, {
        name: groupForm.name,
        description: groupForm.description,
        department: groupForm.department || null,
        members: members,
        created_by: currentUser.id
      });

      setShowCreateGroup(false);
      setGroupForm({ name: '', description: '', department: '', selectedMembers: [] });
      fetchGroups();
      alert(`✅ Group "${groupForm.name}" created successfully!`);
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Error creating group. Please try again.');
    }
  };

  const sendGroupMessage = async () => {
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      await axios.post(`${API}/groups/${selectedGroup.id}/messages`, {
        group_id: selectedGroup.id,
        sender_id: currentUser.id,
        sender_name: currentUser.name,
        content: newMessage,
        message_type: 'text'
      });

      setNewMessage('');
      fetchGroupMessages(selectedGroup.id);
      fetchGroups(); // Update group list
    } catch (error) {
      console.error('Error sending group message:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex">
      {/* Groups Sidebar */}
      <div className="w-1/3 bg-white rounded-l-lg shadow border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-800">Group Chats</h2>
            <button
              onClick={() => setShowCreateGroup(!showCreateGroup)}
              className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
              data-testid="new-group-button"
            >
              👥 New Group
            </button>
          </div>

          {showCreateGroup && (
            <div className="bg-purple-50 p-4 rounded-lg mb-3">
              <h3 className="font-medium mb-3">Create New Group</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="Group name (e.g., QC Team)"
                  className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                  data-testid="group-name-input"
                />
                <textarea
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  placeholder="Description (optional)"
                  rows="2"
                  className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                />
                <select
                  value={groupForm.department}
                  onChange={(e) => setGroupForm({ ...groupForm, department: e.target.value })}
                  className="w-full px-2 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept.toUpperCase()}</option>
                  ))}
                </select>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Select Members:</label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 rounded p-2">
                    {workers.filter(w => w.id !== currentUser.id).map(worker => (
                      <label key={worker.id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 px-1 rounded">
                        <input
                          type="checkbox"
                          checked={groupForm.selectedMembers.includes(worker.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setGroupForm({ 
                                ...groupForm, 
                                selectedMembers: [...groupForm.selectedMembers, worker.id] 
                              });
                            } else {
                              setGroupForm({ 
                                ...groupForm, 
                                selectedMembers: groupForm.selectedMembers.filter(id => id !== worker.id) 
                              });
                            }
                          }}
                          className="w-3 h-3"
                        />
                        <span className="text-xs">{worker.name} ({worker.department})</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={createGroup}
                    className="flex-1 px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                    data-testid="create-group-button"
                  >
                    Create Group
                  </button>
                  <button
                    onClick={() => setShowCreateGroup(false)}
                    className="px-3 py-2 bg-gray-200 text-gray-800 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Groups List */}
        <div className="overflow-y-auto h-full">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                selectedGroup?.id === group.id ? 'bg-purple-50 border-purple-200' : ''
              }`}
              data-testid={`group-${group.id}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-300 rounded-full flex items-center justify-center text-lg">
                  👥
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{group.name}</p>
                  <p className="text-sm text-gray-600 truncate">
                    {group.last_message || 'No messages yet'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {group.members.length} member(s)
                    {group.department && ` • ${group.department}`}
                  </p>
                </div>
                {group.last_message_at && (
                  <span className="text-xs text-gray-400">
                    {formatTime(group.last_message_at)}
                  </span>
                )}
              </div>
            </div>
          ))}
          {groups.length === 0 && (
            <div className="p-8 text-center text-gray-500" data-testid="no-groups">
              <div className="text-4xl mb-2">👥</div>
              <p>No groups yet</p>
              <p className="text-sm">Create your first group!</p>
            </div>
          )}
        </div>
      </div>

      {/* Group Chat Area */}
      <div className="flex-1 bg-white rounded-r-lg shadow flex flex-col">
        {selectedGroup ? (
          <>
            {/* Group Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-300 rounded-full flex items-center justify-center text-xl">
                  👥
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{selectedGroup.name}</h3>
                  <p className="text-sm text-gray-600">{selectedGroup.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Members: {selectedGroup.members.map(m => m.user_name).join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Group Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="group-messages-container">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${
                    message.sender_id === currentUser.id ? 'text-right' : 'text-left'
                  }`}>
                    {message.sender_id !== currentUser.id && (
                      <p className="text-xs text-gray-500 mb-1">{message.sender_name}</p>
                    )}
                    <div className={`px-4 py-2 rounded-lg ${
                      message.sender_id === currentUser.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === currentUser.id ? 'text-purple-200' : 'text-gray-500'
                      }`}>
                        {formatTime(message.sent_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">💬</div>
                  <p>No messages in this group yet</p>
                  <p className="text-sm">Be the first to send a message!</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendGroupMessage()}
                  placeholder={`Message ${selectedGroup.name}...`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  data-testid="group-message-input"
                />
                <button
                  onClick={sendGroupMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg transition"
                  data-testid="send-group-message-button"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Group Selected */
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-medium mb-2">Select a group</h3>
              <p className="text-sm">Choose a group from the left to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;