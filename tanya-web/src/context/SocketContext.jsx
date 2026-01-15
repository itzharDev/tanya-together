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
    // Skip during SSR
    if (typeof window === 'undefined') return;
    
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

    // Initialize Socket.IO for connection counter (optional feature)
    // Only available in development mode
    let newSocket = null;
    
    if (import.meta.env.DEV) {
      const socketUrl = 'http://localhost:3001';
      
      try {
        newSocket = io(socketUrl, {
          transports: ['websocket'],
          autoConnect: true,
          reconnection: false, // Don't keep trying if server doesn't support it
          timeout: 5000, // 5 second timeout
          query: { user: currentUser?.id || 'anonymous' }
        });

        newSocket.on('connect', () => {
          console.log('Socket.IO connected for live stats');
        });

        newSocket.on('message', (data) => {
          if (data && data.type === 'connectionsCounter') {
            setConnections(data.value);
          }
        });

        newSocket.on('connect_error', (error) => {
          console.warn('Socket.IO not available - live connection stats disabled');
        });

        newSocket.on('disconnect', () => {
          // Socket disconnected
        });

        setSocket(newSocket);
      } catch (error) {
        console.warn('Socket.IO initialization failed:', error);
      }
    }

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
