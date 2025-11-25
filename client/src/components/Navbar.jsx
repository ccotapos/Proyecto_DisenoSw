import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveLang = (lng) => i18n.language === lng;

  return (
    <nav className="bg-brand-primary py-4 shadow-lg">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold text-white tracking-tight hover:text-brand-accent transition">
          {t('navbar.brand')}
        </Link>
        
        {/* Menú Central - Visible solo si hay usuario */}
        <div className="hidden md:flex items-center space-x-6 font-medium text-brand-light text-sm">
          {user && (
            <>
              <Link to="/dashboard" className="hover:text-brand-accent transition">
                {t('navbar.dashboard')}
              </Link>
              
              <Link to="/calculator" className="hover:text-brand-accent transition">
                {t('navbar.calculator')}
              </Link>
              
              <Link to="/profile" className="hover:text-brand-accent transition">
                {t('navbar.profile')}
              </Link>

              <Link to="/ai-assistant" className="hover:text-brand-accent transition">
                {t('navbar.ai')}
              </Link>

              {/* --- AQUÍ ESTABA EL ERROR --- */}
              <Link to="/vacations" className="hover:text-brand-accent transition">
                {t('navbar.vacations')}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Botones de Idioma */}
          <div className="flex space-x-1 bg-brand-dark bg-opacity-20 p-1 rounded-lg">
            <button 
              onClick={() => changeLanguage('es')} 
              className={`px-2 py-1 rounded text-xs font-bold transition ${isActiveLang('es') ? 'bg-brand-secondary text-white' : 'text-brand-light hover:bg-brand-secondary hover:bg-opacity-50'}`}
            >ES</button>
            <button 
              onClick={() => changeLanguage('en')} 
              className={`px-2 py-1 rounded text-xs font-bold transition ${isActiveLang('en') ? 'bg-brand-secondary text-white' : 'text-brand-light hover:bg-brand-secondary hover:bg-opacity-50'}`}
            >EN</button>
          </div>

          {/* Botón Dinámico: Login / Logout */}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-white text-xs hidden lg:block">
                {t('navbar.hello')}, {user.name.split(' ')[0]}
              </span>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition shadow"
              >
                {t('navbar.logout')}
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              className="bg-brand-accent text-brand-dark hover:bg-white px-4 py-1.5 rounded-lg font-bold text-sm transition shadow"
            >
              {t('navbar.login')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;