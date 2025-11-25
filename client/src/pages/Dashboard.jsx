import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({ totalHours: 0, contractCount: 0 });
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);

  useEffect(() => {
    if (user) { fetchUserData(); fetchHolidays(); }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [laborRes, contractsRes] = await Promise.all([api.get('/labor'), api.get('/contracts')]);
      const entries = laborRes.data;
      const totalHours = entries.reduce((sum, item) => sum + item.hoursWorked, 0);
      setRecentActivity(entries.slice(0, 3));
      setStats({ totalHours, contractCount: contractsRes.data.length });
    } catch (error) { console.error("Error data"); }
  };

  const fetchHolidays = async () => {
    setLoadingHolidays(true);
    const currentYear = new Date().getFullYear();
    try {
      const response = await fetch('https://www.feriadosapp.com/api/holidays.json');
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      const today = new Date();
      const upcoming = data.data
        .filter(h => h.date.startsWith(currentYear.toString()))
        .filter(h => new Date(h.date + "T00:00:00") >= today)
        .slice(0, 4);
      setHolidays(upcoming.length > 0 ? upcoming : data.data.slice(0, 4));
    } catch (error) {
      setHolidays([
        { date: "2025-05-01", title: "Día del Trabajador" },
        { date: "2025-05-21", title: "Glorias Navales" },
        { date: "2025-09-18", title: "Fiestas Patrias" }
      ]);
    } finally { setLoadingHolidays(false); }
  };

  if (!user) return <div className="p-10 text-center">...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white p-8 rounded-2xl shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">{t('navbar.hello')}, {user.name.split(' ')[0]} 👋</h1>
          <p className="opacity-90">{user.position || t('profile.no_position')}</p>
        </div>
        <div className="mt-4 md:mt-0 bg-white bg-opacity-20 p-3 rounded-lg backdrop-blur-sm text-center">
          <p className="font-bold text-lg">🟢 {t('dashboard.active')}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          {/* ESTADÍSTICAS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-brand-accent">
              <p className="text-gray-500 text-xs font-bold uppercase mb-1">{t('dashboard.stats.hours')}</p>
              <p className="text-4xl font-extrabold text-brand-dark">{stats.totalHours}</p>
              <Link to="/calculator" className="text-xs text-brand-primary hover:underline mt-2 block">{t('dashboard.stats.details')} →</Link>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-purple-500">
              <p className="text-gray-500 text-xs font-bold uppercase mb-1">{t('dashboard.stats.contracts')}</p>
              <p className="text-4xl font-extrabold text-brand-dark">{stats.contractCount}</p>
              <Link to="/profile" className="text-xs text-brand-primary hover:underline mt-2 block">{t('dashboard.stats.manage')} →</Link>
            </div>
          </div>

          {/* NUEVA TARJETA ACCESO VACACIONES */}
          <div className="bg-white p-4 rounded-2xl shadow-md flex justify-between items-center border border-blue-100">
             <div className="flex items-center gap-4">
                <span className="text-3xl">🏖️</span>
                <div>
                    <h3 className="font-bold text-brand-dark">{t('dashboard.stats.vacations')}</h3>
                    <p className="text-xs text-gray-500">{t('dashboard.stats.vacations_desc')}</p>
                </div>
             </div>
             <Link to="/vacations" className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition">{t('dashboard.stats.manage')}</Link>
          </div>

          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-bold text-brand-dark text-lg">{t('dashboard.activity.title')}</h3>
              <Link to="/calculator" className="text-sm text-brand-secondary font-bold hover:underline">{t('dashboard.activity.new')}</Link>
            </div>
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">{t('dashboard.activity.empty')}</div>
            ) : (
              <div className="divide-y">
                {recentActivity.map((item) => (
                  <div key={item._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      <div className="bg-brand-light text-brand-primary w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs">{new Date(item.date).getDate()}</div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">{t('dashboard.activity.type')}</p>
                        <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()} • {item.notes}</p>
                      </div>
                    </div>
                    <span className="font-bold text-brand-primary">+{item.hoursWorked} hrs</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-red-50 p-4 border-b border-red-100">
              <h3 className="font-bold text-red-700 flex items-center gap-2">{t('dashboard.holidays.title')}</h3>
            </div>
            {loadingHolidays ? (
              <div className="p-6 text-center text-gray-400 text-sm animate-pulse">{t('dashboard.holidays.loading')}</div>
            ) : (
              <div className="divide-y">
                {holidays.map((h, index) => (
                  <div key={index} className="p-4 hover:bg-red-50 transition group">
                    <p className="text-xs text-red-400 font-bold uppercase mb-1">{h.date}</p>
                    <p className="font-bold text-gray-800 group-hover:text-red-600 transition">{h.title}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="p-3 bg-gray-50 text-center">
              <a href="https://www.feriados.cl" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-red-500">{t('dashboard.holidays.link')} →</a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">{t('dashboard.ai_card.title')}</h3>
              <p className="text-sm opacity-90 mb-4">{t('dashboard.ai_card.desc')}</p>
              <Link to="/ai-assistant" className="inline-block bg-white text-purple-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-opacity-90 transition shadow">
                {t('dashboard.ai_card.btn')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;