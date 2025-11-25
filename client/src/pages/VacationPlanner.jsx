import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const VacationPlanner = () => {
  const { t } = useTranslation();


  const [yearsWorked, setYearsWorked] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(15); 
  const [legalInfo, setLegalInfo] = useState({ base: 15, progressive: 0 });
  const [holidays, setHolidays] = useState([]);
  const [plannedVacations, setPlannedVacations] = useState([]);
  const [dateRange, setDateRange] = useState(new Date());

  const daysUsed = plannedVacations.reduce((sum, v) => sum + v.daysTaken, 0);
  const daysRemaining = totalAvailable - daysUsed;

  useEffect(() => {
    fetchHolidays();
    fetchPlannedVacations();
  }, []);

 
  const calculateLegal = (val) => {
    const y = parseInt(val) || 0;
    setYearsWorked(y);
    
    const base = 15;
    let progressive = 0;
    if (y >= 13) {
      progressive = Math.floor((y - 10) / 3);
    }
    const calculatedTotal = base + progressive;
    setLegalInfo({ base, progressive });
    setTotalAvailable(calculatedTotal);
  };

  const fetchHolidays = async () => {
    try {
      const res = await fetch('https://www.feriadosapp.com/api/holidays.json');
      const data = await res.json();
      setHolidays(data.data.map(h => ({ date: h.date, title: h.title })));
    } catch (err) {
      setHolidays([
        { date: "2025-01-01", title: "Año Nuevo" },
        { date: "2025-05-01", title: "Día del Trabajador" },
        { date: "2025-09-18", title: "Fiestas Patrias" }
      ]);
    }
  };

  const fetchPlannedVacations = async () => {
    try {
      const res = await api.get('/vacations');
      setPlannedVacations(res.data);
    } catch (error) { console.error("Error"); }
  };

  const countBusinessDays = (start, end) => {
    let count = 0;
    let curDate = new Date(start);
    const endDate = new Date(end);
    
    while (curDate <= endDate) {
      const dayOfWeek = curDate.getDay();
      const dateString = curDate.toISOString().split('T')[0];
      const isHoliday = holidays.some(h => h.date === dateString);

      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday) {
        count++;
      }
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  };

  const handleSaveVacation = async () => {
    if (!Array.isArray(dateRange)) {
      alert(t('vacations.alerts.select_range'));
      return;
    }
    
    const [start, end] = dateRange;
    const businessDays = countBusinessDays(start, end);

    if (businessDays === 0) {
      alert(t('vacations.alerts.no_business_days'));
      return;
    }

    if (businessDays > daysRemaining) {
      alert(t('vacations.alerts.limit_exceeded'));
      return;
    }

    try {
      const res = await api.post('/vacations', {
        startDate: start,
        endDate: end,
        daysTaken: businessDays
      });
      setPlannedVacations([...plannedVacations, res.data]);
      alert(t('vacations.alerts.success'));
    } catch (error) {
      alert("Error");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm(t('profile.danger_zone.confirm_1'))) return;
    try {
      await api.delete(`/vacations/${id}`);
      setPlannedVacations(plannedVacations.filter(v => v._id !== id));
    } catch (error) { alert("Error"); }
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
      
      {/* COLUMNA IZQUIERDA */}
      <div className="md:col-span-1 space-y-6">
        
        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-brand-primary">
          <h2 className="text-xl font-bold text-brand-dark mb-4">{t('vacations.calculator_title')}</h2>
          
          <div className="mb-6 border-b pb-4">
            <label className="text-xs font-bold text-gray-500">{t('vacations.years_label')}</label>
            <div className="flex gap-2 items-center mt-1">
              <input 
                type="number" 
                className="w-full border p-2 rounded text-sm" 
                placeholder="0"
                onChange={(e) => calculateLegal(e.target.value)}
              />
              <span className="text-xs text-gray-400 whitespace-nowrap">
                ({t('vacations.base_days')}: {legalInfo.base})
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{t('vacations.years_note')}</p>
          </div>

          <div className="mb-2">
            <label className="text-sm font-bold text-brand-primary flex justify-between">
              {t('vacations.manual_title')}
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 rounded">Edit</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">{t('vacations.manual_note')}</p>
            <input 
              type="number" 
              className="w-full border-2 border-brand-secondary p-3 rounded-lg text-xl font-bold text-center text-brand-dark focus:outline-none focus:border-brand-accent"
              value={totalAvailable}
              onChange={(e) => setTotalAvailable(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className={`p-6 rounded-2xl border-2 text-center shadow-md transition-colors ${daysRemaining < 0 ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">{t('vacations.balance_title')}</p>
          <p className={`text-5xl font-extrabold ${daysRemaining < 0 ? 'text-red-600' : 'text-green-700'}`}>
            {daysRemaining}
          </p>
          <p className="text-sm mt-2 font-medium text-gray-500">
            {t('vacations.balance_subtitle')}
          </p>
          {daysRemaining < 0 && (
            <p className="text-xs text-red-500 mt-2 font-bold">{t('vacations.limit_warning')}</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="font-bold text-brand-dark mb-4 flex justify-between">
            {t('vacations.my_breaks')} <span className="text-red-500 text-sm">(-{daysUsed})</span>
          </h3>
          {plannedVacations.length === 0 ? (
            <p className="text-sm text-gray-400">{t('vacations.empty_breaks')}</p>
          ) : (
            <ul className="space-y-3 max-h-60 overflow-y-auto">
              {plannedVacations.map(v => (
                <li key={v._id} className="text-sm border-l-4 border-green-400 pl-3 py-2 bg-gray-50 flex justify-between items-center rounded-r">
                  <div>
                    <p className="font-bold text-gray-700">
                      {new Date(v.startDate).toLocaleDateString()}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(v.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-brand-primary">-{v.daysTaken}</span>
                    <button onClick={() => handleDelete(v._id)} className="text-red-300 hover:text-red-600">✕</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* COLUMNA DERECHA */}
      <div className="md:col-span-2">
        <div className="bg-white p-6 rounded-2xl shadow-lg h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-brand-primary">{t('vacations.planner_title')}</h2>
            <button 
              onClick={handleSaveVacation}
              className="bg-brand-accent text-brand-dark px-6 py-2 rounded-lg font-bold shadow hover:opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={daysRemaining <= 0}
            >
              {daysRemaining <= 0 ? t('vacations.btn_no_balance') : t('vacations.btn_save')}
            </button>
          </div>

          <div className="calendar-container flex-1 flex justify-center">
            <Calendar
              onChange={setDateRange}
              value={dateRange}
              selectRange={true}
              tileContent={getTileContent}
              className="shadow-sm border-none rounded-lg w-full p-4 custom-calendar"
            />
          </div>

          <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-xs text-yellow-800">
            {t('vacations.info_note')}
          </div>
        </div>
      </div>

    </div>
  );
};

export default VacationPlanner;
