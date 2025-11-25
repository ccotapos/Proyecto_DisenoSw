import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const VacationPlanner = () => {
  const { t } = useTranslation();

  const [yearsWorked, setYearsWorked] = useState(0);
  const [legalDays, setLegalDays] = useState({ 
    base: 15, 
    progressive: 0, 
    totalAnual: 15,
    maxAccumulation: 30 
  });
  const [holidays, setHolidays] = useState([]);
  const [plannedVacations, setPlannedVacations] = useState([]);
  const [dateRange, setDateRange] = useState(new Date());

  useEffect(() => {
    fetchHolidays();
    fetchPlannedVacations();
  }, []);

  const calculateLegal = (years) => {
    const y = parseInt(years) || 0;
    setYearsWorked(y);

    const base = 15;
    let progressive = 0;
    if (y > 13) progressive = Math.floor((y - 10) / 3);

    const totalAnual = base + progressive;
    const maxAccumulation = totalAnual * 2;
    setLegalDays({ base, progressive, totalAnual, maxAccumulation });
  };

  const fetchHolidays = async () => {
    try {
      const res = await fetch('https://www.feriadosapp.com/api/holidays.json');
      const data = await res.json();
      setHolidays(data.data.map(h => ({ date: h.date, title: h.title })));
    } catch (err) {
      setHolidays([
        { date: "2025-01-01", title: t('home.cards.holidays_title') },
        { date: "2025-04-18", title: "Viernes Santo" },
        { date: "2025-05-01", title: "Día del Trabajador" },
        { date: "2025-05-21", title: "Glorias Navales" },
        { date: "2025-09-18", title: "Fiestas Patrias" },
        { date: "2025-09-19", title: "Glorias del Ejército" },
        { date: "2025-12-25", title: "Navidad" }
      ]);
    }
  };

  const fetchPlannedVacations = async () => {
    try {
      const res = await api.get('/vacations');
      setPlannedVacations(res.data);
    } catch (error) {
      console.error("Error cargando vacaciones");
    }
  };

  const handleSaveVacation = async () => {
    if (!Array.isArray(dateRange)) {
      alert(t('calculator.years_placeholder'));
      return;
    }

    const [start, end] = dateRange;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    try {
      const res = await api.post('/vacations', {
        startDate: start,
        endDate: end,
        daysTaken: diffDays
      });
      setPlannedVacations([...plannedVacations, res.data]);
      alert(t('calculator.calculate'));
    } catch (error) {
      alert(t('overtime.error_saving'));
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/vacations/${id}`);
      setPlannedVacations(plannedVacations.filter(v => v._id !== id));
    } catch (error) {
      alert(t('overtime.error_delete'));
    }
  };

  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const holiday = holidays.find(h => h.date === dateStr);
      if (holiday) return <p className="text-[8px] text-red-500 font-bold truncate">🔴 {holiday.title}</p>;

      const isVacation = plannedVacations.some(v => {
        const start = new Date(v.startDate);
        const end = new Date(v.endDate);
        return date >= new Date(start.setHours(0,0,0,0)) && date <= new Date(end.setHours(23,59,59,999));
      });
      if (isVacation) return <p className="text-[10px]">🏖️</p>;
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 grid md:grid-cols-3 gap-8">

      <div className="md:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-brand-secondary">
          <h2 className="text-xl font-bold text-brand-dark mb-4">📊 {t('calculator.title')}</h2>

          <div className="mb-4">
            <label className="text-xs font-bold text-gray-500">{t('calculator.years_label')}</label>
            <input 
              type="number" 
              className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-brand-accent outline-none" 
              placeholder={t('calculator.years_placeholder')}
              onChange={(e) => calculateLegal(e.target.value)}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-3 text-blue-800">
            <div className="flex justify-between">
              <span>{t('calculator.base')}:</span>
              <span className="font-bold">{legalDays.base}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('calculator.progressive')}:</span>
              <span className="font-bold">+{legalDays.progressive}</span>
            </div>
            <div className="border-t border-blue-200 pt-2 flex justify-between font-extrabold text-lg">
              <span>{t('calculator.total')}:</span>
              <span>{legalDays.totalAnual} {t('calculator.days')}</span>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mt-4">
            <h4 className="font-bold text-orange-800 text-xs uppercase mb-1">⚠️ {t('calculator.your_days')}</h4>
            <p className="text-xs text-orange-700 mb-2">{t('calculator.days_habiles')}</p>
            <div className="flex justify-between text-sm font-bold text-orange-900">
              <span>{t('calculator.total')}:</span>
              <span>{legalDays.maxAccumulation} {t('calculator.days')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="font-bold text-brand-dark mb-4">{t('home.cards.vacations_title')}</h3>
          {plannedVacations.length === 0 ? (
            <p className="text-sm text-gray-400">{t('overtime.no_entries')}</p>
          ) : (
            <ul className="space-y-3">
              {plannedVacations.map(v => (
                <li key={v._id} className="text-sm border-l-4 border-green-400 pl-3 py-1 flex justify-between">
                  <div>
                    <p className="font-bold text-gray-700">
                      {new Date(v.startDate).toLocaleDateString()} - {new Date(v.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">{v.daysTaken} {t('calculator.days')}</p>
                  </div>
                  <button onClick={() => handleDelete(v._id)} className="text-red-400 hover:text-red-600">✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-brand-primary">📅 {t('calculator.title')}</h2>
            <button 
              onClick={handleSaveVacation}
              className="bg-brand-accent text-brand-dark px-4 py-2 rounded-lg font-bold shadow hover:opacity-80 transition"
            >
              {t('calculator.calculate')}
            </button>
          </div>
          <div className="calendar-container flex justify-center">
            <Calendar
              onChange={setDateRange}
              value={dateRange}
              selectRange={true}
              tileContent={getTileContent}
              className="shadow-sm border-none rounded-lg w-full p-4"
            />
          </div>

          <div className="mt-6 flex gap-4 text-xs justify-center">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-full"></span> {t('home.cards.holidays_title')}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#ffff76] rounded-full"></span> {t('overtime.new_entry')}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 border border-green-500 bg-white rounded-full"></span> {t('home.cards.vacations_title')}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default VacationPlanner;
