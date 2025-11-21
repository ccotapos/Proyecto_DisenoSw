import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Calculator = () => {
  const { t } = useTranslation();
  const [antiguedad, setAntiguedad] = useState(0);
  const [resultado, setResultado] = useState(null);

  const calcularVacaciones = () => {
    // Lógica básica Chilena: 15 días hábiles base.
    // Después de 10 años de trabajo, se suma 1 día por cada 3 años trabajados.
    let diasBase = 15;
    let diasProgresivos = 0;

    if (antiguedad > 10) {
      diasProgresivos = Math.floor((antiguedad - 10) / 3);
    }

    setResultado({
      base: diasBase,
      progresivos: diasProgresivos,
      total: diasBase + diasProgresivos
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
            {t('vacations', 'Calculadora de Vacaciones')}
        </h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Años de Antigüedad Laboral
          </label>
          <input
            type="number"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={antiguedad}
            onChange={(e) => setAntiguedad(e.target.value)}
            min="0"
          />
        </div>

        <button
          onClick={calcularVacaciones}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Calcular
        </button>

        {resultado && (
          <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-400">
            <p className="font-bold text-green-800">Tus días legales:</p>
            <ul className="list-disc pl-5 mt-2 text-green-700">
              <li>Base: {resultado.base} días hábiles</li>
              <li>Progresivos: {resultado.progresivos} días</li>
              <li className="font-bold text-xl mt-2">Total: {resultado.total} días</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator;