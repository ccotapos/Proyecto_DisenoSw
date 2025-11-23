import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { askLegalAssistant } from '../services/aiService';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  // 1. HOOKS
  const { user, login } = useAuth();
  const { t } = useTranslation();
  
  // Estados de carga y chat
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  // Estados de Perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '', position: '', phone: '', address: '', photo: ''
  });

  // Estados de Contratos
  const [contracts, setContracts] = useState([]);
  const [editingContractId, setEditingContractId] = useState(null);
  const [contractForm, setContractForm] = useState({
    company: '', role: '', startDate: '', type: 'Indefinido'
  });

  // Estados de Analizador PDF
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // 2. EFECTO DE CARGA
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        position: user.position || '',
        phone: user.phone || '',
        address: user.address || '',
        photo: user.photo || ''
      });
      fetchContracts();
    }
  }, [user]);

  // 3. FUNCIONES
  const fetchContracts = async () => {
    try {
      const res = await api.get('/contracts');
      setContracts(res.data);
    } catch (error) {
      console.error("Error cargando contratos");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) { // 2MB
        alert("La imagen es muy pesada (Max 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setProfileData(prev => ({ ...prev, photo: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    try {
      const res = await api.put('/auth/profile', profileData);
      login(res.data, localStorage.getItem('token')); 
      setIsEditingProfile(false);
      alert("Perfil actualizado correctamente");
    } catch (error) {
      alert("Error al actualizar perfil");
    }
  };

  const handleContractSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContractId) {
        const res = await api.put(`/contracts/${editingContractId}`, contractForm);
        setContracts(contracts.map(c => c._id === editingContractId ? res.data : c));
        setEditingContractId(null);
      } else {
        const res = await api.post('/contracts', contractForm);
        setContracts([res.data, ...contracts]);
      }
      setContractForm({ company: '', role: '', startDate: '', type: 'Indefinido' });
      alert(editingContractId ? "Contrato actualizado" : "Contrato creado");
    } catch (error) {
      alert("Error al guardar contrato");
    }
  };

  const startEditingContract = (contract) => {
    setEditingContractId(contract._id);
    setContractForm({
      company: contract.company,
      role: contract.role,
      startDate: contract.startDate ? contract.startDate.split('T')[0] : '',
      type: contract.type
    });
    // Scroll simple hacia el formulario
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  const handleAiConsult = async () => {
    if (!question.trim()) return;
    setLoading(true);
    const answer = await askLegalAssistant(question);
    setAiResponse(answer);
    setLoading(false);
  };

  if (!user) return <div className="text-center mt-10">Cargando perfil...</div>;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      
      {/* --- TARJETA DE PERFIL (Aquí recuperamos los inputs) --- */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border-t-4 border-brand-primary relative">
        <div className="absolute top-4 right-4 flex gap-2">
          {isEditingProfile ? (
            <>
              <button onClick={saveProfile} className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold shadow">Guardar</button>
              <button onClick={() => setIsEditingProfile(false)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm font-bold">Cancelar</button>
            </>
          ) : (
            <button onClick={() => setIsEditingProfile(true)} className="bg-brand-primary text-white px-3 py-1 rounded text-sm font-bold shadow hover:bg-opacity-90">
              ✏️ Editar Perfil
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* FOTO DE PERFIL */}
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow">
               {profileData.photo ? (
                 <img src={profileData.photo} className="w-full h-full object-cover" alt="Perfil" />
               ) : (
                 <span className="text-4xl text-brand-primary font-bold">{user.name?.charAt(0)}</span>
               )}
            </div>
            {isEditingProfile && (
              <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition">
                Cambiar
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>

          {/* DATOS DE TEXTO O INPUTS (Esto es lo que faltaba) */}
          <div className="flex-1 w-full">
            {isEditingProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="text-xs text-gray-500 font-bold">Nombre Completo</label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-accent outline-none"
                    value={profileData.name}
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold">Cargo / Puesto</label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-accent outline-none"
                    value={profileData.position}
                    onChange={e => setProfileData({...profileData, position: e.target.value})}
                    placeholder="Ej: Desarrollador"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold">Teléfono</label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-accent outline-none"
                    value={profileData.phone}
                    onChange={e => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="+56 9 ..."
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold">Dirección</label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-accent outline-none"
                    value={profileData.address}
                    onChange={e => setProfileData({...profileData, address: e.target.value})}
                    placeholder="Ciudad, Comuna"
                  />
                </div>
              </div>
            ) : (
              // MODO VISUALIZACIÓN
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-brand-dark">{user.name}</h2>
                <p className="text-brand-primary font-medium text-lg mb-2">{user.position || "Sin cargo definido"}</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-600">
                  <span className="flex items-center gap-1">📧 {user.email}</span>
                  {user.phone && <span className="flex items-center gap-1">📱 {user.phone}</span>}
                  {user.address && <span className="flex items-center gap-1">📍 {user.address}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- ANALIZADOR PDF --- */}
      <div className="bg-blue-50 p-6 rounded-2xl mb-8 border border-blue-200 shadow-sm">
        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <span>⚖️</span> Analizador de Contratos (PDF)
        </h3>
        <p className="text-sm text-blue-700 mb-3">Sube tu contrato para que la IA detecte cláusulas importantes.</p>
        <div className="flex items-center gap-4">
           <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow">
              📤 Seleccionar PDF
              <input 
                  type="file" 
                  accept=".pdf"
                  className="hidden"
                  onChange={async (e) => {
                      const file = e.target.files[0];
                      if(!file) return;
                      setAnalyzing(true);
                      setAnalysisResult(null);
                      const formData = new FormData();
                      formData.append('contractPdf', file);
                      try {
                          const res = await api.post('/ai/analyze', formData, { headers: {'Content-Type': 'multipart/form-data'}});
                          setAnalysisResult(res.data.analysis);
                      } catch(err) { alert("Error analizando documento"); }
                      setAnalyzing(false);
                  }}
              />
           </label>
           {analyzing && <span className="text-blue-600 font-bold animate-pulse">Analizando documento...</span>}
        </div>
        {analysisResult && (
          <div className="mt-4 bg-white p-4 rounded-xl border border-blue-100 whitespace-pre-wrap text-sm text-gray-800 shadow-inner">
            {analysisResult}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* --- GESTIÓN DE CONTRATOS --- */}
        <div className="space-y-6">
            {/* Formulario Contratos */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
                <h3 className="font-bold text-brand-dark mb-4">
                    {editingContractId ? '📝 Editando Contrato' : '➕ Nuevo Contrato'}
                </h3>
                <form onSubmit={handleContractSubmit} className="space-y-3">
                    <input 
                        className="w-full border p-2 rounded" 
                        placeholder="Empresa" 
                        value={contractForm.company}
                        onChange={e => setContractForm({...contractForm, company: e.target.value})}
                        required
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input 
                            className="w-full border p-2 rounded" 
                            placeholder="Cargo" 
                            value={contractForm.role}
                            onChange={e => setContractForm({...contractForm, role: e.target.value})}
                            required
                        />
                        <select 
                            className="w-full border p-2 rounded"
                            value={contractForm.type}
                            onChange={e => setContractForm({...contractForm, type: e.target.value})}
                        >
                            <option>Indefinido</option>
                            <option>Plazo Fijo</option>
                            <option>Honorarios</option>
                        </select>
                    </div>
                    <input 
                        type="date" 
                        className="w-full border p-2 rounded"
                        value={contractForm.startDate}
                        onChange={e => setContractForm({...contractForm, startDate: e.target.value})}
                        required
                    />
                    <button type="submit" className={`w-full text-white font-bold py-2 rounded shadow ${editingContractId ? 'bg-orange-500' : 'bg-brand-primary'}`}>
                        {editingContractId ? 'Actualizar' : 'Guardar Contrato'}
                    </button>
                    {editingContractId && (
                        <button type="button" onClick={() => { setEditingContractId(null); setContractForm({company:'', role:'', startDate:'', type:'Indefinido'}) }} className="w-full text-xs text-gray-500 mt-2 underline">
                            Cancelar edición
                        </button>
                    )}
                </form>
            </div>

            {/* Lista Contratos */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
                <h3 className="font-bold mb-4 border-b pb-2">Mis Contratos</h3>
                {contracts.length === 0 ? <p className="text-gray-400 text-sm">Sin contratos registrados.</p> : (
                    <ul className="space-y-3">
                        {contracts.map(c => (
                            <li key={c._id} className="flex justify-between items-center border-l-4 border-brand-accent pl-3 py-2 bg-gray-50 rounded-r">
                                <div>
                                    <p className="font-bold text-sm">{c.role}</p>
                                    <p className="text-xs text-gray-600">{c.company} ({c.type})</p>
                                </div>
                                <button onClick={() => startEditingContract(c)} className="text-gray-400 hover:text-brand-primary px-2">
                                    ✏️
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>

        {/* --- CHAT IA --- */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-purple-100 h-fit">
          <h3 className="font-bold mb-4 text-purple-700">🤖 Chat Legal</h3>
          <textarea 
            className="w-full border p-3 rounded-lg mb-3 focus:ring-2 focus:ring-purple-300 outline-none"
            rows="4"
            placeholder="Ej: ¿Cuántas horas extra puedo hacer?"
            value={question}
            onChange={e => setQuestion(e.target.value)}
          />
          <button 
            onClick={handleAiConsult}
            disabled={loading}
            className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg shadow disabled:opacity-50"
          >
            {loading ? "Pensando..." : "Consultar"}
          </button>
          {aiResponse && (
            <div className="mt-4 bg-purple-50 p-4 rounded-xl text-sm text-gray-800 border border-purple-200">
                {aiResponse}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;