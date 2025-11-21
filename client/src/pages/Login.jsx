import React from 'react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import api from '../services/api';

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Estado para saber si el usuario quiere Loguearse (false) o Registrarse (true)
  const [isRegistering, setIsRegistering] = useState(false);

  const [name, setName] = useState(''); // Solo para registro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Lógica unificada para Login y Registro
  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      let res;
      if (isRegistering) {
        // 1. Si está registrándose, llamamos a la ruta de registro
        res = await api.post('/auth/register', { name, email, password });
      } else {
        // 2. Si está logueándose, llamamos a la ruta de login
        res = await api.post('/auth/login', { email, password });
      }

      // Ambos endpoints devuelven lo mismo (token + user), así que esto sirve para los dos
      login(res.data.user, res.data.token);
      navigate('/dashboard');
      
    } catch (err) {
      // Mensaje de error personalizado según el caso
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError(isRegistering ? 'Error al registrar usuario' : 'Email o contraseña incorrectos');
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const res = await api.post('/auth/google', {
        name: decoded.name,
        email: decoded.email,
        googleId: decoded.sub
      });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Falló la autenticación con Google');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Encabezado Dinámico */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-brand-primary mb-2">
            {isRegistering ? 'Crear Cuenta' : 'Bienvenido'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isRegistering 
              ? 'Ingresa tus datos para comenzar' 
              : 'Ingresa para gestionar tus horas'}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 text-sm rounded">
            {error}
          </div>
        )}
        
        {/* Formulario Único */}
        <form onSubmit={handleAuth} className="space-y-5">
          
          {/* Campo Nombre: Solo aparece si está Registrándose */}
          {isRegistering && (
            <div className="animate-fade-in-down">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-brand-accent outline-none"
                placeholder="Juan Pérez"
                required={isRegistering} // Solo obligatorio si se registra
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-brand-accent outline-none"
              placeholder="nombre@ejemplo.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-brand-accent outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 rounded-lg transition shadow-md">
            {isRegistering ? 'Registrarse' : t('login_btn')}
          </button>
        </form>

        {/* Toggle para cambiar entre Login y Registro */}
        <div className="mt-4 text-center text-sm">
          <p className="text-gray-600">
            {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(''); // Limpiar errores al cambiar
              }}
              className="ml-2 text-brand-secondary font-bold hover:underline focus:outline-none"
            >
              {isRegistering ? 'Inicia Sesión aquí' : 'Regístrate aquí'}
            </button>
          </p>
        </div>

        {/* Separador */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">O continúa con</span>
          </div>
        </div>

        {/* Botón Google */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Falló el inicio de sesión con Google')}
            theme="outline"
            size="large"
            shape="pill"
            width="300"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;