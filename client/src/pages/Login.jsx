import React, { useState } from 'react';
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
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let res;
      if (isRegistering) {
        res = await api.post('/auth/register', { name, email, password });
      } else {
        res = await api.post('/auth/login', { email, password });
      }
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError(isRegistering ? 'Error al registrar' : 'Email o contraseña incorrectos');
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const res = await api.post('/auth/google', {
        name: decoded.name,
        email: decoded.email,
        googleId: decoded.sub,
        photo: decoded.picture
      });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(t('login.error_google'));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-brand-primary mb-2">
            {isRegistering ? t('login.create_account') : t('login.welcome')}
          </h1>
          <p className="text-gray-500 text-sm">
            {isRegistering ? t('login.subtitle_register') : t('login.subtitle_login')}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 text-sm rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleAuth} className="space-y-5">
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.name')}</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-brand-accent outline-none"
                required={isRegistering}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.email')}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-brand-accent outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.password')}</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-brand-accent outline-none"
              required
            />
          </div>

          <button type="submit" className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 rounded-lg transition shadow-md">
            {isRegistering ? t('login.btn_register') : t('login.btn_login')}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <p className="text-gray-600">
            {isRegistering ? t('login.have_account') : t('login.no_account')}
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              className="ml-2 text-brand-secondary font-bold hover:underline focus:outline-none"
            >
              {isRegistering ? t('login.link_login') : t('login.link_register')}
            </button>
          </p>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">{t('login.or_continue')}</span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError(t('login.error_google'))}
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