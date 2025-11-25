import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Profile from './pages/Profile';
import VacationPlanner from './pages/VacationPlanner';
import ProtectedRoute from './components/ProtectedRoute';
import AiAssistant from './pages/AiAssistant';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* Rutas Privadas (Protegidas por el Guardia) */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calculator" 
              element={
                <ProtectedRoute>
                  <Calculator />
                </ProtectedRoute>
              } 
            />
            <Route 
  path="/ai-assistant" 
  element={
    <ProtectedRoute>
      <AiAssistant />
    </ProtectedRoute>
  } 
/>
            <Route 
              path="/vacations" 
              element={
                <ProtectedRoute>
                  <VacationPlanner />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;