import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  // --- ESTADOS ---
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({ totalHours: 0, contractCount: 0 });
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);

  // --- EFECTOS ---
  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchHolidays();
    }
  }, [user]);

  // 1. RESUMEN: Horas Extra + Contratos
  const fetchUserData = async () => {
    try {
      const [laborRes, contractsRes] = await Promise.all([
        api.get('/labor'),
        api.get('/contracts')
      ]);

      const entries = laborRes.data;
      const contracts = contractsRes.data;

      const totalHours = entries.reduce((sum, item) => sum + item.hoursWorked, 0);

      setRecentActivity(entries.slice(0, 3)); // últimas 3 actividades

      setStats({
        totalHours,
        contractCount: contracts.length
      });

    } catch (error) {
      console.error("Error cargando resumen del usuario");
    }
  };

  // 2. Feriados (respaldo si API falla)
  const fetchHolidays = async () => {
    setLoadingHolidays(true);
    const currentYear = new Date().getFullYear();

    try {
      const response = await fetch('https://www.feriadosapp.com/api/holidays.json');
      if (!response.ok) throw new Error();

      const data = await response.json();
      const allHolidays = data.data;

      const today = new Date();

      const upcoming = allHolidays
        .filter(h => h.date.startsWith(currentYear.toString()))
        .filter(h => new Date(h.date + "T00:00:00") >= today)
        .slice(0, 4);

      setHolidays(upcoming.length > 0 ? upcoming : allHolidays.slice(0, 4));

    } catch (error) {
      console.warn("API falló, usando respaldo local");
      setHolidays([
        { date: "2025-01-01", title: "Año Nuevo", extra: "Irrenunciable" },
        { date: "2025-04-18", title: "Viernes Santo", extra: "Religioso" },
        { date: "2025-05-01", title: "Día del Trabajador", extra: "Irrenunciable" },
        { date: "2025-05-21", title: "Glorias Navales", extra: "Civil" }
      ]);
    } finally {
      setLoadingHolidays(false);
    }
  };

  if (!user) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white p-8 rounded-2xl shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">
            {t('navbar.hello')}, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="opacity-90 text-sm md:text-base">
            {user.position ? `Cargo: ${user.position}` : "Bienvenido a tu panel de gestión laboral."}
          </p>
        </div>

        <div className="mt-4 md:mt-0 bg-white bg-opacity-20 p-3 rounded-lg backdrop-blur-sm text-center">
          <p className="text-xs uppercase font-bold tracking-wider">Estado</p>
          <p className="font-bold text-lg">🟢 Activo</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">

        {/* COLUMNA IZQUIERDA */}
        <div className="md:col-span-2 space-y-8">

          {/* TARJETAS RESUMEN */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-brand-accent">
              <p className="text-gray-500 text-xs font-bold uppercase mb-1">Horas Extra Totales</p>
              <p className="text-4xl font-extrabold text-brand-dark">{stats.totalHours}</p>
              <Link to="/calculator" className="text-xs text-brand-primary hover:underline mt-2 block">
                Ver detalles →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-purple-500">
              <p className="text-gray-500 text-xs font-bold uppercase mb-1">Contratos Vigentes</p>
              <p className="text-4xl font-extrabold text-brand-dark">{stats.contractCount}</p>
              <Link to="/profile" className="text-xs text-brand-primary hover:underline mt-2 block">
                Gestionar →
              </Link>
            </div>
          </div>

          {/* ACTIVIDAD RECIENTE */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-bold text-brand-dark text-lg">⏱️ Última Actividad</h3>
              <Link to="/calculator" className="text-sm text-brand-secondary font-bold hover:underline">
                Registrar Nuevo
              </Link>
            </div>

            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No has registrado horas extra recientemente.
              </div>
            ) : (
              <div className="divide-y">
                {recentActivity.map((item) => (
                  <div key={item._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      <div className="bg-brand-light text-brand-primary w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs">
                        {new Date(item.date).getDate()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">Turno Extra Registrado</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.date).toLocaleDateString()} • {item.notes || "Sin nota"}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-brand-primary">+{item.hoursWorked} hrs</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-8">

          {/* FERIADOS */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-red-50 p-4 border-b border-red-100">
              <h3 className="font-bold text-red-700 flex items-center gap-2">
                📅 Próximos Feriados
              </h3>
            </div>

            {loadingHolidays ? (
              <div className="p-6 text-center text-gray-400 text-sm animate-pulse">
                Cargando calendario...
              </div>
            ) : (
              <div className="divide-y">
                {holidays.map((h, index) => (
                  <div key={index} className="p-4 hover:bg-red-50 transition group">
                    <p className="text-xs text-red-400 font-bold uppercase mb-1">{h.date}</p>
                    <p className="font-bold text-gray-800 group-hover:text-red-600">
                      {h.title}
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full uppercase tracking-wide">
                      {h.extra}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 bg-gray-50 text-center">
              <a href="https://www.feriados.cl/" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-red-500">
                Ver calendario completo →
              </a>
            </div>
          </div>

          {/* ACCESO IA */}
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">¿Dudas Legales?</h3>
              <p className="text-sm opacity-90 mb-4">
                Nuestra IA analiza contratos y responde preguntas laborales.
              </p>
              <Link
                to="/profile"
                className="inline-block bg-white text-purple-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-opacity-90 transition shadow"
              >
                Consultar Ahora
              </Link>
            </div>

            <div className="absolute -right-4 -bottom-4 text-9xl opacity-20 group-hover:scale-110 transition duration-500">
              ⚖️
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;
