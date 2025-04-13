import React, { useEffect, useState } from 'react';
import socket from '../utils/socket';

type Message = {
  sender: string;
  content: string;
};

const CollabRoom: React.FC = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [userId, setUserId] = useState<string | null>(null); 
  const [roomName, setRoomName] =useState<string >("");

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      console.log('✅ Connected to collab namespace');
    });

    socket.on('room-created', (roomId) => {
      console.log('Room created:', roomId);
      setRoomId(roomId);
    });

    socket.on('receive-message', (update: any) => {
      setMessages((prev) => [...prev, update]);
    });

    socket.on('user-joined', ({ userId }) => {
      console.log(`👤 User joined: ${userId}`);
    });

    socket.on('user-left-room', ({ userId }) => {
      console.log(`👋 User left: ${userId}`);
    });

    socket.on('song-streamed', ({ songId, userId }) => {
      console.log(`🎵 User ${userId} streamed song ${songId}`);
    });

    socket.on('Error', (msg) => {
      alert(msg);
    });

    return () => {
      socket.disconnect();
      console.log('❌ Disconnected from socket');
    };
  }, []);

  const createRoom = () => {
    socket.emit('create-room',  roomName);
  };

  const joinRoom = () => {
    if (roomId) {
      socket.emit('join-room', roomId);
    }
  };

  const sendMessage = () => {
    if (!messageInput || !roomId) return;
    const msg = { sender: userId || 'You', content: messageInput };
    socket.emit('send-message', msg, roomId);
    setMessages((prev) => [...prev, msg]);
    setMessageInput('');
  };

  const streamSong = () => {
    const fakeSongId = 'song_123'; // Replace with actual
    if (!roomId) return;
    socket.emit('stream-song', {
      roomId,
      songId: fakeSongId,
      userId: userId || 'test-user',
    });
  };

  const leaveRoom = () => {
    if (roomId) {
      socket.emit('leave-room', roomId);
      setRoomId(null);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🎤 Collab Room</h2>


      <div className="mb-4">
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="px-3 py-2 border rounded w-3/4 mr-2"
          placeholder="Type a name ..."
        />
        <button onClick={createRoom} className="px-4 py-2 bg-blue-600 text-white rounded">Create Room</button>
        </div>

      <div className="space-x-3 mb-4">
        <button onClick={joinRoom} className="px-4 py-2 bg-green-600 text-white rounded">Join Room</button>
        <button onClick={leaveRoom} className="px-4 py-2 bg-red-600 text-white rounded">Leave Room</button>
        <button onClick={streamSong} className="px-4 py-2 bg-purple-600 text-white rounded">Stream Song</button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="px-3 py-2 border rounded w-3/4 mr-2"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="px-4 py-2 bg-black text-white rounded">Send</button>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">💬 Messages</h3>
        <div className="bg-gray-100 p-3 rounded h-64 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div key={idx} className="mb-2">
              <strong>{msg.sender}:</strong> {msg.content}
            </div>
          ))}
        </div>
      </div>

      {roomId && (
        <p className="mt-4 text-green-700">✅ Connected to Room ID: {roomId}</p>
      )}
    </div>
  );
};

export default CollabRoom;
