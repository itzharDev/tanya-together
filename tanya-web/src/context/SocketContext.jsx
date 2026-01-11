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
    if (!currentUser) return;

    // Fetch initial members count (from Parse _User count) based on logic in SocketioCubit
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

    // Initialize Socket
    const newSocket = io('https://tanya.dvarmalchus.co.il', {
      transports: ['websocket'],
      autoConnect: true,
      query: { user: currentUser.id } // Use objectId
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
  }, [currentUser]);

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
