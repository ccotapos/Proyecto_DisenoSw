import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const isActiveLang = (lng) => i18n.language === lng;

  return (
    <nav className="bg-brand-primary py-4 shadow-lg">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo / Título */}
        <Link to="/" className="text-2xl font-extrabold text-white tracking-tight hover:text-brand-accent transition">
          Gestor Laboral
        </Link>
        
        {/* Enlaces de Navegación (Desktop) */}
        <div className="hidden md:flex items-center space-x-8 font-medium text-brand-light">
          <Link to="/dashboard" className="hover:text-brand-accent transition">Dashboard</Link>
          <Link to="/calculator" className="hover:text-brand-accent transition">Calculadora</Link>
          <Link to="/profile" className="hover:text-brand-accent transition">Perfil</Link>
        </div>

        {/* Botones de Idioma Estilizados */}
        <div className="flex space-x-2 bg-brand-dark bg-opacity-20 p-1 rounded-lg">
          <button 
            onClick={() => changeLanguage('es')} 
            className={`px-3 py-1 rounded-md text-sm font-bold transition ${
              isActiveLang('es') 
                ? 'bg-brand-secondary text-white shadow-sm' 
                : 'text-brand-light hover:bg-brand-secondary hover:text-white hover:bg-opacity-50'
            }`}
          >ES</button>
          <button 
            onClick={() => changeLanguage('en')} 
            className={`px-3 py-1 rounded-md text-sm font-bold transition ${
              isActiveLang('en') 
                ? 'bg-brand-secondary text-white shadow-sm' 
                : 'text-brand-light hover:bg-brand-secondary hover:text-white hover:bg-opacity-50'
            }`}
          >EN</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;