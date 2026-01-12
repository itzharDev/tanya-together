import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import Parse from '../services/parse';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [connections, setConnections] = useState(0);
  const [members, setMembers] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Fetch initial members count (from Parse _User count) - works for all users
    const fetchMemberCount = async () => {
      try {
        const query = new Parse.Query(Parse.User);
        const count = await query.count();
        setMembers(count);
      } catch (error) {
        console.error("Error fetching member count:", error);
      }
    };

    fetchMemberCount();

    // Initialize Socket for both authenticated and anonymous users
    const newSocket = io('https://tanya.dvarmalchus.co.il', {
      transports: ['websocket'],
      autoConnect: true,
      query: { user: currentUser?.id || 'anonymous' } // Use objectId or anonymous
    });

    newSocket.on('connect', () => {
      // Socket connected
    });

    newSocket.on('message', (data) => {
      if (data && data.type === 'connectionsCounter') {
        setConnections(data.value);
      }
    });

    newSocket.on('disconnect', () => {
      // Socket disconnected
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []); // Run once on mount

  const value = {
    connections,
    members,
    socket
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
