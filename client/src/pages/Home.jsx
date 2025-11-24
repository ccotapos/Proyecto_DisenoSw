import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-16 md:py-24">
      
      {/* HERO */}
      <div className="max-w-3xl mx-auto px-4 mb-16">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-brand-dark">
          {t('welcome_title')}
        </h1>

        <p className="text-xl md:text-2xl text-brand-primary opacity-80 mb-10">
          {t('welcome_subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {/* Botón Login */}
          <Link 
            to="/login" 
            className="bg-brand-accent text-brand-dark font-extrabold py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition transform"
          >
            {t('login_btn')}
          </Link>

          {/* Botón Calculadora */}
          <Link 
            to="/calculator" 
            className="bg-brand-secondary text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition transform hover:bg-opacity-90"
          >
            {t('vacation_calc')}
          </Link>
        </div>
      </div>

      {/* TARJETAS INFORMATIVAS */}
      <div className="grid md:grid-cols-3 gap-8 px-4 max-w-6xl mx-auto">

        {/* Tarjeta 1 */}
        <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border-t-4 border-brand-primary text-left group">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📅</div>
          <h3 className="font-bold text-2xl mb-3 text-brand-primary">
            {t('home_cards.holidays_title')}
          </h3>
          <p className="text-brand-dark leading-relaxed">
            {t('home_cards.holidays_desc')}
          </p>
        </div>

        {/* Tarjeta 2 */}
        <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border-t-4 border-brand-accent text-left group">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⚖️</div>
          <h3 className="font-bold text-2xl mb-3 text-brand-dark">
            {t('home_cards.ai_title')}
          </h3>
          <p className="text-brand-dark leading-relaxed">
            {t('home_cards.ai_desc')}
          </p>
        </div>

        {/* Tarjeta 3 */}
        <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border-t-4 border-brand-secondary text-left group">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏖️</div>
          <h3 className="font-bold text-2xl mb-3 text-brand-secondary">
            {t('home_cards.vacations_title')}
          </h3>
          <p className="text-brand-dark leading-relaxed">
            {t('home_cards.vacations_desc')}
          </p>
        </div>

      </div>
    </div>
  );
};

export default Home;