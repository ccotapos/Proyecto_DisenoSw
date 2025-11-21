
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // CORRECCIÓN: Inicializamos el estado LEYENDO directamente del localStorage.
  // Así, si recargas la página, React arranca ya sabiendo quién eres.
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Guardar token en axios interceptor si es necesario, 
  // pero por ahora aseguramos que el estado visual se mantenga.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && user) {
      // Si hay usuario pero no token (caso raro), limpiar
      setUser(null);
    }
  }, []);

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