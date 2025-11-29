import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [workers, setWorkers] = useState([]);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState('');
  const currentUser = { id: '1202fa63-f5e0-430d-9d17-f59ee91ec49f', name: 'John Smith' }; // Use actual worker ID

  useEffect(() => {
    fetchWorkers();
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchWorkers = async () => {
    try {
      const response = await axios.get(`${API}/workers?active=true`);
      setWorkers(response.data);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API}/conversations?user_id=${currentUser.id}`);
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(`${API}/conversations/${conversationId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const startNewConversation = async () => {
    if (!selectedWorker) return;
    
    const worker = workers.find(w => w.id === selectedWorker);
    if (!worker) return;

    try {
      const response = await axios.post(`${API}/conversations`, {
        participant1_id: currentUser.id,
        participant1_name: currentUser.name,
        participant2_id: worker.id,
        participant2_name: worker.name
      });
      
      setSelectedConversation(response.data);
      setShowNewConversation(false);
      setSelectedWorker('');
      fetchConversations();
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await axios.post(`${API}/conversations/${selectedConversation.id}/messages`, {
        conversation_id: selectedConversation.id,
        sender_id: currentUser.id,
        sender_name: currentUser.name,
        content: newMessage,
        message_type: 'text'
      });

      setNewMessage('');
      fetchMessages(selectedConversation.id);
      fetchConversations(); // Update conversation list
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participant1_id === currentUser.id 
      ? { id: conversation.participant2_id, name: conversation.participant2_name }
      : { id: conversation.participant1_id, name: conversation.participant1_name };
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
      {/* Conversations Sidebar */}
      <div className="w-1/3 bg-white rounded-l-lg shadow border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-800">Messages</h2>
            <button
              onClick={() => setShowNewConversation(!showNewConversation)}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              data-testid="new-conversation-button"
            >
              💬 New Chat
            </button>
          </div>

          {showNewConversation && (
            <div className="bg-blue-50 p-3 rounded-lg mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start chat with:</label>
              <div className="flex gap-2">
                <select
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  data-testid="worker-select-conversation"
                >
                  <option value="">Select Worker</option>
                  {workers.filter(w => w.id !== currentUser.id).map(worker => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name} - {worker.department}
                    </option>
                  ))}
                </select>
                <button
                  onClick={startNewConversation}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  data-testid="start-conversation-button"
                >
                  Start
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Conversation List */}
        <div className="overflow-y-auto h-full">
          {conversations.map((conversation) => {
            const otherPerson = getOtherParticipant(conversation);
            return (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                data-testid={`conversation-${conversation.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{otherPerson.name}</p>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.last_message || 'No messages yet'}
                    </p>
                  </div>
                  {conversation.last_message_at && (
                    <span className="text-xs text-gray-400">
                      {formatTime(conversation.last_message_at)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {conversations.length === 0 && (
            <div className="p-8 text-center text-gray-500" data-testid="no-conversations">
              <div className="text-4xl mb-2">💬</div>
              <p>No conversations yet</p>
              <p className="text-sm">Start a new chat!</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-r-lg shadow flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  👤
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">
                    {getOtherParticipant(selectedConversation).name}
                  </h3>
                  <p className="text-sm text-gray-600">Active in factory</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="messages-container">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender_id === currentUser.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_id === currentUser.id ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {formatTime(message.sent_at)}
                    </p>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">💭</div>
                  <p>No messages yet</p>
                  <p className="text-sm">Send your first message!</p>
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
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  data-testid="message-input"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition"
                  data-testid="send-message-button"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
              <p className="text-sm">Choose a conversation from the left or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;