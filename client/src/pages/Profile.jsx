import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { askLegalAssistant } from '../services/aiService';
import api from '../services/api'; // Importamos nuestra api configurada
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estado para contratos
  const [contracts, setContracts] = useState([]);
  const [newContract, setNewContract] = useState({
    company: '', role: '', startDate: '', type: 'Indefinido'
  });

  // Cargar contratos reales al entrar
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await api.get('/contracts');
        setContracts(res.data);
      } catch (error) {
        console.error("Error cargando contratos", error);
      }
    };
    if (user) fetchContracts();
  }, [user]);

  // Función para guardar contrato
  const handleAddContract = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/contracts', newContract);
      setContracts([res.data, ...contracts]); // Agregarlo a la lista visualmente
      setNewContract({ company: '', role: '', startDate: '', type: 'Indefinido' }); // Limpiar form
    } catch (error) {
      alert("Error al guardar contrato");
    }
  };

  const handleAiConsult = async () => {
    if (!question.trim()) return;
    setLoading(true);
    const answer = await askLegalAssistant(question);
    setAiResponse(answer);
    setLoading(false);
  };

  if (!user) return <p className="text-center mt-10">Debes iniciar sesión.</p>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Encabezado Perfil */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 flex items-center gap-6 border-l-4 border-brand-primary">
        <div className="w-20 h-20 bg-brand-secondary rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-inner">
          {user.name?.charAt(0) || 'U'}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-brand-dark">{user.name}</h2>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* COLUMNA IZQUIERDA: Gestión de Contratos */}
        <div className="space-y-8">
          {/* Formulario de Registro */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-bold mb-4 text-brand-primary">Registrar Nuevo Contrato</h3>
            <form onSubmit={handleAddContract} className="space-y-4">
              <input 
                type="text" placeholder="Empresa" required
                className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-accent outline-none"
                value={newContract.company}
                onChange={e => setNewContract({...newContract, company: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" placeholder="Cargo" required
                  className="w-full border p-2 rounded"
                  value={newContract.role}
                  onChange={e => setNewContract({...newContract, role: e.target.value})}
                />
                <select 
                  className="w-full border p-2 rounded"
                  value={newContract.type}
                  onChange={e => setNewContract({...newContract, type: e.target.value})}
                >
                  <option>Indefinido</option>
                  <option>Plazo Fijo</option>
                  <option>Honorarios</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Fecha de Inicio</label>
                <input 
                  type="date" required
                  className="w-full border p-2 rounded"
                  value={newContract.startDate}
                  onChange={e => setNewContract({...newContract, startDate: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-brand-primary text-white py-2 rounded hover:bg-opacity-90 transition">
                Guardar Contrato
              </button>
            </form>
          </div>

          {/* Lista de Contratos */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-bold mb-4 border-b pb-2">{t('contracts')}</h3>
            {contracts.length === 0 ? (
              <p className="text-gray-400 text-sm">No tienes contratos registrados.</p>
            ) : (
              <ul className="space-y-4">
                {contracts.map(c => (
                  <li key={c._id} className="border-l-4 border-brand-accent pl-4 py-1">
                    <p className="font-bold text-brand-dark">{c.role}</p>
                    <p className="text-sm text-gray-600">{c.company} <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full ml-2">{c.type}</span></p>
                    <p className="text-xs text-gray-400">Desde: {new Date(c.startDate).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Consultor IA */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-purple-100 h-fit">
          <h3 className="text-xl font-bold mb-4 text-purple-700 flex items-center gap-2">
            <span></span> {t('ask_ai')}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            ¿Tienes dudas sobre tu contrato recién ingresado? Pregúntame.
          </p>
          <textarea
            className="w-full border p-3 rounded-lg mb-3 focus:ring-2 focus:ring-purple-300 outline-none"
            rows="4"
            placeholder={t('ask_placeholder')}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button 
            onClick={handleAiConsult}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 w-full font-bold shadow-md transition disabled:opacity-50"
          >
            {loading ? t('loading') : "Consultar Asistente Legal"}
          </button>
          
          {aiResponse && (
            <div className="mt-6 p-4 bg-purple-50 rounded-xl text-sm border border-purple-200">
              <strong className="block text-purple-800 mb-2">Respuesta:</strong>
              <p className="leading-relaxed text-gray-700">{aiResponse}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;