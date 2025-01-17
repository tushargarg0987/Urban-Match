import React, { useEffect, useState } from "react";
import api from "../../utils/api";

const ChatScreen = () => {
  const [users, setUsers] = useState([]); // List of all users
  const [selectedUser, setSelectedUser] = useState(null); // Currently selected user
  const [allMessages, setAllMessages] = useState({}); // All messages grouped by user ID
  const [messages, setMessages] = useState([]); // Messages for the selected user
  const [newMessage, setNewMessage] = useState(""); // Current input message
  const [loading, setLoading] = useState(false); // Loading state for incoming message
  const [error, setError] = useState(""); // Error handling

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        setUsers(response.data);
      } catch (err) {
        setError("Failed to fetch users");
      }
    };
    fetchUsers();
  }, []);

  // Load messages for the selected user
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setMessages(allMessages[user.id] || []); // Load messages from allMessages or an empty array
  };

  // Send the user's message and fetch the response
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userId = selectedUser.id;

    // Show the user's message immediately
    const sentMessage = { sender: "You", text: newMessage };
    const updatedMessages = [...(allMessages[userId] || []), sentMessage];
    setAllMessages((prevAllMessages) => ({ ...prevAllMessages, [userId]: updatedMessages }));
    setMessages(updatedMessages); // Update current messages view
    setNewMessage(""); // Clear input

    // Show loading indicator for response
    setLoading(true);
    try {
      const response = await api.get("/get-response", {
        params: {
          message: sentMessage.text,
          user_id: userId,
        },
      });
      const receivedMessage = { sender: selectedUser.name, text: response.data };
      const finalMessages = [...updatedMessages, receivedMessage];
      setAllMessages((prevAllMessages) => ({ ...prevAllMessages, [userId]: finalMessages }));
      setMessages(finalMessages); // Update current messages view
    } catch (err) {
      setError("Failed to fetch response");
    } finally {
      setLoading(false); // Remove loading indicator
    }
  };

  // Send message on pressing Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[87vh]">
      {/* Left Side - Users List */}
      <div className="w-1/3 bg-gray-100 border-r overflow-y-auto">
        <h2 className="text-xl font-bold p-4 border-b">Users</h2>
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => handleUserSelect(user)}
            className={`p-4 cursor-pointer ${
              selectedUser?.id === user.id ? "bg-blue-200" : "hover:bg-gray-200"
            }`}
          >
            {user.name}
          </div>
        ))}
        {error && <p className="text-red-500 p-4">{error}</p>}
      </div>

      {/* Right Side - Chat Interface */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-gray-200 border-b">
              <h2 className="text-xl font-bold">{selectedUser.name}</h2>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    message.sender === "You"
                      ? "text-right ml-40"
                      : "text-left mr-40"
                  }`}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-lg ${
                      message.sender === "You"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    <strong>{message.sender}: </strong>
                    {message.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="text-left mr-40 mb-4">
                  <div className="inline-block px-4 py-2 rounded-lg bg-gray-200">
                    <strong>{selectedUser.name}: </strong>
                    <span className="animate-pulse">Typing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 border rounded-lg p-2"
                />
                <button
                  onClick={handleSendMessage}
                  className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-lg">Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatScreen;
