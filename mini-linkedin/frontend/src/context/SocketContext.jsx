import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const socketRef = useRef(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (user) {
            socketRef.current = io('http://localhost:5001');
            socketRef.current.emit('join', user._id);

            socketRef.current.on('notification', (notif) => {
                setNotifications((prev) => [notif, ...prev]);
            });
        }
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [user]);

    const clearNotifications = () => setNotifications([]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, notifications, clearNotifications }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
