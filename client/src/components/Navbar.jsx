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

        {/* LOGO */}
        <Link to="/" className="text-2xl font-extrabold text-white tracking-tight hover:text-brand-accent transition">
          {t("navbar.brand")}
        </Link>

        {/* MENÚ CENTRAL */}
        <div className="hidden md:flex items-center space-x-8 font-medium text-brand-light">

          {user && (
            <>
              <Link to="/dashboard" className="hover:text-brand-accent transition">
                {t("navbar.dashboard")}
              </Link>

              <Link to="/calculator" className="hover:text-brand-accent transition">
                {t("navbar.calculator")}
              </Link>

              <Link to="/profile" className="hover:text-brand-accent transition">
                {t("navbar.profile")}
              </Link>

              <Link to="/ai-assistant" className="hover:text-brand-accent transition">
                IA Legal
              </Link>

              <Link to="/vacations" className="hover:text-brand-accent transition">
                {t("home.cards.vacations_title")}
              </Link>
            </>
          )}

        </div>

        {/* BOTONES DERECHA */}
        <div className="flex items-center space-x-4">

          {/* Selector de idioma */}
          <div className="flex space-x-2 bg-brand-dark bg-opacity-20 p-1 rounded-lg">
            <button
              onClick={() => changeLanguage('es')}
              className={`px-3 py-1 rounded-md text-sm font-bold transition 
              ${isActiveLang('es') ? 'bg-brand-secondary text-white' : 'text-brand-light hover:bg-brand-secondary hover:bg-opacity-50'}`}
            >
              ES
            </button>

            <button
              onClick={() => changeLanguage('en')}
              className={`px-3 py-1 rounded-md text-sm font-bold transition 
              ${isActiveLang('en') ? 'bg-brand-secondary text-white' : 'text-brand-light hover:bg-brand-secondary hover:bg-opacity-50'}`}
            >
              EN
            </button>
          </div>

          {/* LOGIN / LOGOUT */}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-white text-sm hidden md:block">
                {t("navbar.hello")}, {user.name.split(" ")[0]}
              </span>

              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg font-bold text-sm transition shadow"
              >
                {t("navbar.logout")}
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-brand-accent text-brand-dark hover:bg-white px-4 py-1.5 rounded-lg font-bold text-sm transition shadow"
            >
              {t("navbar.login")}
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
