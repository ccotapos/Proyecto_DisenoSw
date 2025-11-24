import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Estilos por defecto del calendario
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const VacationPlanner = () => {
  const { t } = useTranslation();

  // --- ESTADOS ---
  const [yearsWorked, setYearsWorked] = useState(0);
  const [legalDays, setLegalDays] = useState({ 
    base: 15, 
    progressive: 0, 
    totalAnual: 15,
    maxAccumulation: 30 
  });
  
  const [holidays, setHolidays] = useState([]);
  const [plannedVacations, setPlannedVacations] = useState([]);
  
  // Selección de fechas en calendario (Rango)
  const [dateRange, setDateRange] = useState(new Date());
  
  // --- EFECTOS ---
  useEffect(() => {
    fetchHolidays();
    fetchPlannedVacations();
  }, []);

  // --- LÓGICA DE NEGOCIO ---

  // 1. Calculadora Legal Chilena
  const calculateLegal = (years) => {
    const y = parseInt(years) || 0;
    setYearsWorked(y);
    
    const base = 15; // 15 días hábiles por año
    let progressive = 0;
    // Ley: Después de 10 años, se suma 1 día cada 3 años nuevos
    if (y > 13) {
      progressive = Math.floor((y - 10) / 3);
    }

    const totalAnual = base + progressive;
    const maxAccumulation = totalAnual * 2;
    setLegalDays({ base, progressive, totalAnual, maxAccumulation });
  };

  // 2. Obtener Feriados (API o Respaldo)
  const fetchHolidays = async () => {
    try {
      const res = await fetch('https://www.feriadosapp.com/api/holidays.json');
      const data = await res.json();
      // Guardamos solo fecha y titulo para usarlos en el calendario
      setHolidays(data.data.map(h => ({ date: h.date, title: h.title })));
    } catch (err) {
      console.log("Usando feriados respaldo");
      // Respaldo manual 2025 por si falla la API
      setHolidays([
        { date: "2025-01-01", title: "Año Nuevo" },
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
    } catch (error) { console.error("Error cargando vacaciones"); }
  };

  // 3. Guardar Planificación
  const handleSaveVacation = async () => {
    if (!Array.isArray(dateRange)) {
      alert("Por favor selecciona un rango de fechas (clic en inicio, clic en fin)");
      return;
    }
    
    const [start, end] = dateRange;
    // Calculo simple de días (diferencia en milisegundos / ms por dia)
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 

    try {
      const res = await api.post('/vacations', {
        startDate: start,
        endDate: end,
        daysTaken: diffDays // Ojo: Esto cuenta corridos, para hábiles se requiere lógica compleja
      });
      setPlannedVacations([...plannedVacations, res.data]);
      alert("Vacaciones planificadas exitosamente");
    } catch (error) {
      alert("Error al guardar");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/vacations/${id}`);
      setPlannedVacations(plannedVacations.filter(v => v._id !== id));
    } catch (error) { alert("Error borrando"); }
  };

  // 4. Personalización Visual del Calendario (Tile Content)
  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      
      // Buscar si es feriado
      const holiday = holidays.find(h => h.date === dateStr);
      if (holiday) {
        return <p className="text-[8px] text-red-500 font-bold truncate">🔴 {holiday.title}</p>;
      }

      // Buscar si es vacación planificada
      const isVacation = plannedVacations.some(v => {
        const start = new Date(v.startDate);
        const end = new Date(v.endDate);
        // Ajuste de zona horaria simple para comparación visual
        return date >= new Date(start.setHours(0,0,0,0)) && date <= new Date(end.setHours(23,59,59,999));
      });
      
      if (isVacation) return <p className="text-[10px]">🏖️</p>;
    }
    return null;
  };

 return (
    <div className="max-w-6xl mx-auto py-8 px-4 grid md:grid-cols-3 gap-8">
      
      {/* COLUMNA IZQUIERDA: Calculadora */}
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-brand-secondary">
          <h2 className="text-xl font-bold text-brand-dark mb-4">📊 Derecho a Vacaciones</h2>
          
          <div className="mb-4">
            <label className="text-xs font-bold text-gray-500">Años de Antigüedad Laboral</label>
            <input 
              type="number" 
              className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-brand-accent outline-none" 
              placeholder="Ej: 13"
              onChange={(e) => calculateLegal(e.target.value)}
            />
            <p className="text-[10px] text-gray-400 mt-1">
              * Se requieren 13 años (10 base + 3 empresa) para el primer día progresivo.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-3 text-blue-800">
            <div className="flex justify-between">
              <span>Días Base (Anual):</span>
              <span className="font-bold">{legalDays.base}</span>
            </div>
            <div className="flex justify-between">
              <span>Días Progresivos:</span>
              <span className="font-bold">+{legalDays.progressive}</span>
            </div>
            <div className="border-t border-blue-200 pt-2 flex justify-between font-extrabold text-lg">
              <span>Total por Año:</span>
              <span>{legalDays.totalAnual} días</span>
            </div>
          </div>

          {/* ALERTA DE ACUMULACIÓN */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mt-4">
            <h4 className="font-bold text-orange-800 text-xs uppercase mb-1">⚠️ Límite Legal (Art. 70)</h4>
            <p className="text-xs text-orange-700 mb-2">
              La ley prohíbe acumular más de 2 períodos. Si no tomas vacaciones, podrías perder los días que excedan este tope.
            </p>
            <div className="flex justify-between text-sm font-bold text-orange-900">
              <span>Tu Tope Máximo:</span>
              <span>{legalDays.maxAccumulation} días</span>
            </div>
          </div>
        </div>

        {/* Lista de Vacaciones Planificadas */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="font-bold text-brand-dark mb-4">Mis Descansos</h3>
          {plannedVacations.length === 0 ? (
            <p className="text-sm text-gray-400">No hay vacaciones agendadas.</p>
          ) : (
            <ul className="space-y-3">
              {plannedVacations.map(v => (
                <li key={v._id} className="text-sm border-l-4 border-green-400 pl-3 py-1 flex justify-between">
                  <div>
                    <p className="font-bold text-gray-700">
                      {new Date(v.startDate).toLocaleDateString()} - {new Date(v.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">{v.daysTaken} días corridos aprox.</p>
                  </div>
                  <button onClick={() => handleDelete(v._id)} className="text-red-400 hover:text-red-600">✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* COLUMNA DERECHA: Calendario Interactivo */}
      <div className="md:col-span-2">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-brand-primary">📅 Planificador de Descanso</h2>
            <button 
              onClick={handleSaveVacation}
              className="bg-brand-accent text-brand-dark px-4 py-2 rounded-lg font-bold shadow hover:opacity-80 transition"
            >
              Guardar Selección
            </button>
          </div>

          {/* COMPONENTE CALENDARIO */}
          <div className="calendar-container flex justify-center">
            <Calendar
              onChange={setDateRange}
              value={dateRange}
              selectRange={true} // Permite seleccionar rango
              tileContent={getTileContent} // Pinta feriados y vacaciones
              className="shadow-sm border-none rounded-lg w-full p-4"
            />
          </div>

          <div className="mt-6 flex gap-4 text-xs justify-center">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-full"></span> Feriado</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#ffff76] rounded-full"></span> Selección</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 border border-green-500 bg-white rounded-full"></span> Tu Vacación</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default VacationPlanner;