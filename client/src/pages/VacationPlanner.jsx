import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const VacationPlanner = () => {
  const { t } = useTranslation();

  const [yearsWorked, setYearsWorked] = useState(0);
  const [legalDays, setLegalDays] = useState({ base: 15, progressive: 0, totalAnual: 15, maxAccumulation: 30 });
  const [holidays, setHolidays] = useState([]);
  const [plannedVacations, setPlannedVacations] = useState([]);
  const [dateRange, setDateRange] = useState(new Date());

  // Estado derivado
  const daysUsed = plannedVacations.reduce((sum, v) => sum + v.daysTaken, 0);
  const daysRemaining = legalDays.totalAnual - daysUsed;

  useEffect(() => {
    fetchHolidays();
    fetchPlannedVacations();
  }, []);

  // 1. Calculadora Legal
  const calculateLegal = (years) => {
    const y = parseInt(years) || 0;
    setYearsWorked(y);

    const base = 15;
    let progressive = 0;
    if (y >= 13) progressive = Math.floor((y - 10) / 3);

    const totalAnual = base + progressive;
    const maxAccumulation = totalAnual * 2;

    setLegalDays({ base, progressive, totalAnual, maxAccumulation });
  };

  // 2. Obtener Feriados
  const fetchHolidays = async () => {
    try {
      const res = await fetch('https://www.feriadosapp.com/api/holidays.json');
      const data = await res.json();
      setHolidays(data.data.map(h => ({ date: h.date, title: h.title })));
    } catch {
      // Respaldo manual 2025
      setHolidays([
        { date: "2025-01-01", title: t('home.cards.holidays_title') },
        { date: "2025-04-18", title: "Viernes Santo" },
        { date: "2025-05-01", title: "Día del Trabajador" },
        { date: "2025-05-21", title: "Glorias Navales" },
        { date: "2025-06-20", title: "Día de los Pueblos Indígenas" },
        { date: "2025-07-16", title: "Virgen del Carmen" },
        { date: "2025-08-15", title: "Asunción de la Virgen" },
        { date: "2025-09-18", title: "Fiestas Patrias" },
        { date: "2025-09-19", title: "Glorias del Ejército" },
        { date: "2025-10-31", title: "Día de las Iglesias Evangélicas" },
        { date: "2025-11-01", title: "Día de Todos los Santos" },
        { date: "2025-12-08", title: "Inmaculada Concepción" },
        { date: "2025-12-25", title: "Navidad" }
      ]);
    }
  };

  const fetchPlannedVacations = async () => {
    try {
      const res = await api.get('/vacations');
      setPlannedVacations(res.data);
    } catch {
      console.error("Error cargando vacaciones");
    }
  };

  // 3. Contar Días Hábiles
  const countBusinessDays = (start, end) => {
    let count = 0;
    let curDate = new Date(start);
    const endDate = new Date(end);
    while (curDate <= endDate) {
      const dayOfWeek = curDate.getDay();
      const dateString = curDate.toISOString().split('T')[0];
      const isHoliday = holidays.some(h => h.date === dateString);
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday) count++;
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  };

  // 4. Guardar vacaciones
  const handleSaveVacation = async () => {
    if (!Array.isArray(dateRange)) {
      alert("Por favor selecciona un rango de fechas (inicio -> fin)");
      return;
    }

    const [start, end] = dateRange;
    const businessDays = countBusinessDays(start, end);

    if (businessDays === 0) {
      alert("El rango seleccionado no tiene días hábiles (solo fines de semana o feriados).");
      return;
    }

    if (businessDays > daysRemaining) {
      alert(`⚠️ Intentas pedir ${businessDays} días, pero solo quedan ${daysRemaining} disponibles.`);
      return;
    }

    try {
      const res = await api.post('/vacations', {
        startDate: start,
        endDate: end,
        daysTaken: businessDays
      });
      setPlannedVacations([...plannedVacations, res.data]);
      alert(`✅ Vacaciones agendadas: ${businessDays} días hábiles.`);
    } catch {
      alert(t('overtime.error_saving'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Borrar esta solicitud?")) return;
    try {
      await api.delete(`/vacations/${id}`);
      setPlannedVacations(plannedVacations.filter(v => v._id !== id));
    } catch {
      alert(t('overtime.error_delete'));
    }
  };

  // Calendario personalizado
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
      {/* Columna izquierda: calculadora y saldo */}
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-brand-secondary">
          <h2 className="text-xl font-bold text-brand-dark mb-4">📊 Mi Saldo de Vacaciones</h2>
          <div className="mb-4">
            <label className="text-xs font-bold text-gray-500">Años de Antigüedad</label>
            <input 
              type="number"
              className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-brand-accent outline-none"
              placeholder="Ej: 5"
              onChange={(e) => calculateLegal(e.target.value)}
            />
          </div>

          <div className={`p-4 rounded-xl border-2 text-center ${daysRemaining < 0 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1">Días Disponibles</p>
            <p className="text-4xl font-extrabold">{Math.max(0, daysRemaining)}</p>
            <p className="text-xs mt-2 opacity-80">de {legalDays.totalAnual} totales anuales</p>
          </div>

          <div className="text-xs text-gray-500 space-y-1 mt-4 bg-gray-50 p-3 rounded">
            <div className="flex justify-between"><span>Días Base:</span> <strong>{legalDays.base}</strong></div>
            <div className="flex justify-between"><span>Días Progresivos:</span> <strong>+{legalDays.progressive}</strong></div>
            <div className="flex justify-between text-red-500"><span>Usados/Planificados:</span> <strong>-{daysUsed}</strong></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="font-bold text-brand-dark mb-4">{t('home.cards.vacations_title')}</h3>
          {plannedVacations.length === 0 ? (
            <p className="text-sm text-gray-400">{t('overtime.no_entries')}</p>
          ) : (
            <ul className="space-y-3">
              {plannedVacations.map(v => (
                <li key={v._id} className="text-sm border-l-4 border-green-400 pl-3 py-2 bg-gray-50 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-700">
                      {new Date(v.startDate).toLocaleDateString()} - {new Date(v.endDate).toLocaleDateString()}
                    </p>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-bold">
                      {v.daysTaken} hábiles
                    </span>
                  </div>
                  <button onClick={() => handleDelete(v._id)} className="text-red-400 hover:text-red-600 px-2">🗑️</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Columna derecha: Calendario */}
      <div className="md:col-span-2">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-brand-primary">📅 Planificador Inteligente</h2>
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
              className="shadow-sm border-none rounded-lg w-full p-4 custom-calendar"
            />
          </div>

          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="text-sm font-bold text-blue-900 mb-2">ℹ️ Cómo funciona el cálculo:</h4>
            <ul className="text-xs text-blue-800 space-y-1 list-disc pl-4">
              <li>Selecciona un rango de fechas en el calendario (inicio y fin).</li>
              <li>El sistema <strong>excluye automáticamente</strong> sábados, domingos y feriados.</li>
              <li>Si intentas pedir más días de los que tienes disponibles, te avisará.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacationPlanner;
