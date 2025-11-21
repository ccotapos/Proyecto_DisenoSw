import React from 'react';
import { useState, useEffect } from 'react';
import { getFeriados } from '../services/externalApi';
import { useTranslation } from 'react-i18next'; // Para multilenguaje

const Dashboard = () => {
  const { t } = useTranslation();
  const [feriados, setFeriados] = useState([]);
  const [year, setYear] = useState(2025); // Año por defecto

  useEffect(() => {
    const fetchFeriados = async () => {
      const data = await getFeriados(year);
      setFeriados(data);
    };
    fetchFeriados();
  }, [year]); // Se ejecuta cada vez que cambias el año

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">
        {t('dashboard_title', 'Panel de Control Laboral')}
      </h1>

      {/* Selector de Año (Cumple requisito de parámetro de usuario) */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <label className="mr-2 font-bold">Consultar Feriados Año:</label>
        <input 
          type="number" 
          value={year} 
          onChange={(e) => setYear(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Tabla Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feriados.length > 0 ? (
          feriados.map((feriado, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="font-bold text-lg text-red-500">{feriado.title}</h3>
              <p className="text-gray-600">{feriado.date}</p>
              <p className="text-sm text-gray-400">{feriado.extra}</p>
            </div>
          ))
        ) : (
          <p>Cargando feriados o no hay datos para este año...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;