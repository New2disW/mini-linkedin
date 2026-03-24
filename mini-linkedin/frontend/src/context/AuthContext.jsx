import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('ml_user');
        return stored ? JSON.parse(stored) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('ml_token') || null);

    const login = (userData, tokenStr) => {
        localStorage.setItem('ml_user', JSON.stringify(userData));
        localStorage.setItem('ml_token', tokenStr);
        setUser(userData);
        setToken(tokenStr);
    };

    const logout = () => {
        localStorage.removeItem('ml_user');
        localStorage.removeItem('ml_token');
        setUser(null);
        setToken(null);
    };

    const updateUser = (updated) => {
        const merged = { ...user, ...updated };
        localStorage.setItem('ml_user', JSON.stringify(merged));
        setUser(merged);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
