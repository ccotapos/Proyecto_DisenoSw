
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// Exportación nombrada del Hook (Esto es lo que Vite estaba reclamando)
export const useAuth = () => {
  return useContext(AuthContext);
};

// Exportación nombrada del Componente
export const AuthProvider = ({ children }) => {
  // Inicializamos leyendo del localStorage para persistencia
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token); 
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};