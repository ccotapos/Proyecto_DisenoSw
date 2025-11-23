import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { askLegalAssistant } from '../services/aiService';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const [analysisResult, setAnalysisResult] = useState(null);
const [analyzing, setAnalyzing] = useState(false);

const Profile = () => {
  const { user, login } = useAuth(); // Usamos login para actualizar el usuario en el contexto local
  const { t } = useTranslation();
  
  // --- ESTADOS ---
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  // Estado Perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '', position: '', phone: '', address: '', photo: ''
  });

  // Estado Contratos
  const [contracts, setContracts] = useState([]);
  const [editingContractId, setEditingContractId] = useState(null); // Si es null, estamos creando. Si tiene ID, editando.
  const [contractForm, setContractForm] = useState({
    company: '', role: '', startDate: '', type: 'Indefinido'
  });

  // --- EFECTOS ---
  useEffect(() => {
    if (user) {
      // Cargar datos del usuario en el formulario
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

  const fetchContracts = async () => {
    try {
      const res = await api.get('/contracts');
      setContracts(res.data);
    } catch (error) {
      console.error("Error cargando contratos");
    }
  };

  // --- FUNCIONES DE PERFIL ---
  
  // Convertir imagen a Base64 (Texto)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (Max 2MB para no saturar Mongo)
      if (file.size > 2000000) {
        alert("La imagen es muy pesada (Max 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    try {
      const res = await api.put('/auth/profile', profileData);
      // Actualizamos el contexto global (localStorage) con los nuevos datos
      // Mantenemos el token que ya teníamos, solo actualizamos user data
      login(res.data, localStorage.getItem('token')); 
      setIsEditingProfile(false);
      alert("Perfil actualizado correctamente");
    } catch (error) {
      alert("Error al actualizar perfil");
    }
  };

  // --- FUNCIONES DE CONTRATOS ---

  const handleContractSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContractId) {
        // MODO EDICIÓN (UPDATE)
        const res = await api.put(`/contracts/${editingContractId}`, contractForm);
        // Actualizamos la lista localmente reemplazando el modificado
        setContracts(contracts.map(c => c._id === editingContractId ? res.data : c));
        alert("Contrato modificado exitosamente");
        setEditingContractId(null); // Salir de modo edición
      } else {
        // MODO CREACIÓN (CREATE)
        const res = await api.post('/contracts', contractForm);
        setContracts([res.data, ...contracts]);
        alert("Contrato creado exitosamente");
      }
      // Limpiar formulario
      setContractForm({ company: '', role: '', startDate: '', type: 'Indefinido' });
    } catch (error) {
      alert("Error al guardar contrato");
    }
  };

  const startEditingContract = (contract) => {
    setEditingContractId(contract._id);
    // Rellenar formulario con datos existentes
    setContractForm({
      company: contract.company,
      role: contract.role,
      startDate: contract.startDate.split('T')[0], // Formatear fecha para input date
      type: contract.type
    });
    // Scroll hacia el formulario para mejor UX
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleAiConsult = async () => {
    if (!question.trim()) return;
    setLoading(true);
    const answer = await askLegalAssistant(question);
    setAiResponse(answer);
    setLoading(false);
  };

  if (!user) return <p className="text-center mt-10">Cargando...</p>;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      
      {/* --- SECCIÓN 1: TARJETA DE PERFIL EDITABLE --- */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border-t-4 border-brand-primary relative">
        <div className="absolute top-4 right-4">
          {!isEditingProfile ? (
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-brand-primary font-bold transition"
            >
              ✏️ Editar Perfil
            </button>
          ) : (
            <div className="space-x-2">
              <button onClick={saveProfile} className="text-sm bg-brand-accent text-brand-dark px-3 py-1 rounded font-bold">Guardar</button>
              <button onClick={() => setIsEditingProfile(false)} className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded">Cancelar</button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* FOTO DE PERFIL */}
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-brand-light rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
              {profileData.photo ? (
                <img src={profileData.photo} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-brand-primary font-bold">{user.name.charAt(0)}</span>
              )}
            </div>
            {/* Overlay para subir foto (solo en modo edición) */}
            {isEditingProfile && (
              <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition">
                <span className="text-white text-xs font-bold">Cambiar Foto</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>

          {/* DATOS DE TEXTO */}
          <div className="flex-1 text-center md:text-left w-full">
            {isEditingProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="Nombre Completo"
                  className="border p-2 rounded w-full"
                  value={profileData.name}
                  onChange={e => setProfileData({...profileData, name: e.target.value})}
                />
                <input 
                  type="text" placeholder="Cargo / Puesto"
                  className="border p-2 rounded w-full"
                  value={profileData.position}
                  onChange={e => setProfileData({...profileData, position: e.target.value})}
                />
                <input 
                  type="text" placeholder="Teléfono"
                  className="border p-2 rounded w-full"
                  value={profileData.phone}
                  onChange={e => setProfileData({...profileData, phone: e.target.value})}
                />
                <input 
                  type="text" placeholder="Dirección / Ciudad"
                  className="border p-2 rounded w-full"
                  value={profileData.address}
                  onChange={e => setProfileData({...profileData, address: e.target.value})}
                />
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-brand-dark mb-1">{user.name}</h2>
                <p className="text-brand-primary font-medium mb-2">{user.position || "Puesto no definido"}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
                  <span>📧 {user.email}</span>
                  {user.phone && <span>📱 {user.phone}</span>}
                  {user.address && <span>📍 {user.address}</span>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* --- SECCIÓN 2: CONTRATOS (CRUD) --- */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-brand-primary">
                {editingContractId ? '📝 Editando Contrato' : '📝 Registrar Nuevo Contrato'}
              </h3>
              {editingContractId && (
                <button 
                  onClick={() => {
                    setEditingContractId(null);
                    setContractForm({ company: '', role: '', startDate: '', type: 'Indefinido' });
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Cancelar edición
                </button>
              )}
            </div>

            <form onSubmit={handleContractSubmit} className="space-y-4">
              <input 
                type="text" placeholder={t('profile.form.company')} required
                className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-accent outline-none"
                value={contractForm.company}
                onChange={e => setContractForm({...contractForm, company: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" placeholder={t('profile.form.role')} required
                  className="w-full border p-2 rounded"
                  value={contractForm.role}
                  onChange={e => setContractForm({...contractForm, role: e.target.value})}
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
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">{t('profile.form.start_date')}</label>
                <input 
                  type="date" required
                  className="w-full border p-2 rounded"
                  value={contractForm.startDate}
                  onChange={e => setContractForm({...contractForm, startDate: e.target.value})}
                />
              </div>
              <button 
                type="submit" 
                className={`w-full text-white py-2 rounded hover:bg-opacity-90 transition font-bold ${editingContractId ? 'bg-orange-500' : 'bg-brand-primary'}`}
              >
                {editingContractId ? 'Actualizar Cambios' : t('profile.form.btn_save')}
              </button>
            </form>
          </div>

          {/* LISTA CONTRATOS */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-bold mb-4 border-b pb-2">{t('profile.contracts_title')}</h3>
            {contracts.length === 0 ? (
              <p className="text-gray-400 text-sm">{t('profile.no_contracts')}</p>
            ) : (
              <ul className="space-y-4">
                {contracts.map(c => (
                  <li key={c._id} className="border-l-4 border-brand-accent pl-4 py-2 flex justify-between items-start group hover:bg-gray-50 rounded-r transition">
                    <div>
                      <p className="font-bold text-brand-dark">{c.role}</p>
                      <p className="text-sm text-gray-600">{c.company} <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full ml-2">{c.type}</span></p>
                      <p className="text-xs text-gray-400">Desde: {new Date(c.startDate).toLocaleDateString()}</p>
                    </div>
                    {/* Botón Editar Contrato */}
                    <button 
                      onClick={() => startEditingContract(c)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-brand-primary transition"
                      title="Editar este contrato"
                    >
                      ✏️
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
{/* --- NUEVA SECCIÓN: ANALIZADOR DE CONTRATOS --- */}
<div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-blue-500 mt-8 col-span-1 md:col-span-2">
  <h3 className="text-xl font-bold mb-2 text-blue-800 flex items-center gap-2">
    <span>⚖️</span> Analizador de Contratos Inteligente
  </h3>
  <p className="text-sm text-gray-600 mb-4">
    Sube tu contrato en PDF y nuestra IA te explicará la "letra chica", tus derechos y prohibiciones.
  </p>

  <div className="flex flex-col md:flex-row gap-4 items-start">
    {/* Input de Archivo */}
    <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-3 rounded-lg font-bold transition flex items-center gap-2">
      <span>📤 Subir PDF del Contrato</span>
      <input 
        type="file" 
        accept=".pdf"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          setAnalyzing(true);
          setAnalysisResult(null);

          const formData = new FormData();
          formData.append('contractPdf', file);

          try {
            // Llamamos a la nueva ruta
            const res = await api.post('/ai/analyze', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAnalysisResult(res.data.analysis);
          } catch (err) {
            alert("Error al analizar el contrato. Intenta con un PDF de texto seleccionable.");
          } finally {
            setAnalyzing(false);
          }
        }} 
      />
    </label>

    {analyzing && (
      <div className="flex items-center text-blue-600 font-medium animate-pulse mt-2">
        ⏳ Leyendo y analizando tu contrato... esto puede tomar unos segundos.
      </div>
    )}
  </div>

  {/* RESULTADO DEL ANÁLISIS */}
  {analysisResult && (
    <div className="mt-6 bg-blue-50 p-6 rounded-xl border border-blue-200 animate-fade-in-up">
      <h4 className="font-bold text-lg text-blue-900 mb-3">🔍 Resultado del Análisis:</h4>
      {/* Usamos whitespace-pre-wrap para respetar los saltos de línea que manda la IA */}
      <div className="prose text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
        {analysisResult}
      </div>
    </div>
  )}
</div>
        {/* --- SECCIÓN 3: IA (Sin cambios, solo visual) --- */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-purple-100 h-fit">
          <h3 className="text-xl font-bold mb-4 text-purple-700 flex items-center gap-2">
            <span>🤖</span> {t('profile.ai_title')}
          </h3>
          <textarea
            className="w-full border p-3 rounded-lg mb-3 focus:ring-2 focus:ring-purple-300 outline-none"
            rows="4"
            placeholder={t('profile.ai_placeholder')}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button 
            onClick={handleAiConsult}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 w-full font-bold shadow-md transition disabled:opacity-50"
          >
            {loading ? t('profile.loading') : t('profile.btn_consult')}
          </button>
          {aiResponse && (
            <div className="mt-6 p-4 bg-purple-50 rounded-xl text-sm border border-purple-200">
              <p className="leading-relaxed text-gray-700">{aiResponse}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;