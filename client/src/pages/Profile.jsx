import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { askLegalAssistant } from '../services/aiService';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  // 1. HOOKS
  const { user, login,logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Estados de carga y chat
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  // Perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    position: '',
    phone: '',
    address: '',
    photo: ''
  });

  // Contratos
  const [contracts, setContracts] = useState([]);
  const [editingContractId, setEditingContractId] = useState(null);
  const [contractForm, setContractForm] = useState({
    company: '',
    role: '',
    startDate: '',
    type: 'Indefinido'
  });

  // Analizador PDF
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  //----------------------
  // CARGAR PERFIL + CONTRATOS
  //----------------------
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

  const fetchContracts = async () => {
    try {
      const res = await api.get('/contracts');
      setContracts(res.data);
    } catch (error) {
      console.error("Error cargando contratos");
    }
  };

  //----------------------
  // PERFIL
  //----------------------

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2_000_000) {
      alert("La imagen supera los 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setProfileData(prev => ({ ...prev, photo: reader.result }));
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    try {
      const res = await api.put('/auth/profile', profileData);
      login(res.data, localStorage.getItem('token'));
      setIsEditingProfile(false);
      alert("Perfil actualizado correctamente");
    } catch {
      alert("Error al actualizar perfil");
    }
  };

  //----------------------
  // CONTRATOS
  //----------------------

  const handleContractSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContractId) {
        const res = await api.put(`/contracts/${editingContractId}`, contractForm);
        setContracts(
          contracts.map(c => c._id === editingContractId ? res.data : c)
        );
        setEditingContractId(null);
      } else {
        const res = await api.post('/contracts', contractForm);
        setContracts([res.data, ...contracts]);
      }

      setContractForm({ company: '', role: '', startDate: '', type: 'Indefinido' });
    } catch {
      alert("Error guardando contrato");
    }
  };

  const startEditingContract = (contract) => {
    setEditingContractId(contract._id);
    setContractForm({
      company: contract.company,
      role: contract.role,
      startDate: contract.startDate?.split('T')[0],
      type: contract.type
    });
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  //----------------------
  // CONSULTA IA
  //----------------------

  const handleAiConsult = async () => {
    if (!question.trim()) return;

    setLoading(true);
    const answer = await askLegalAssistant(question);
    setAiResponse(answer);
    setLoading(false);
  };

  if (!user) return <p className="text-center mt-10">{t("auth.must_login")}</p>;



  const handleDeleteAccount = async () => {
  // 1. Primera Confirmación
  const confirm1 = window.confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción NO se puede deshacer.");

  if (confirm1) {
    // 2. Segunda Confirmación (Seguridad extra)
    const confirm2 = window.confirm("Se borrarán todos tus contratos, registros de horas y vacaciones permanentemente. ¿Confirmar eliminación?");

    if (confirm2) {
      try {
        await api.delete('/auth/profile');
        alert("Tu cuenta ha sido eliminada. Gracias por usar GestoLaboral.");
        logout(); // Limpiamos el estado local
        navigate('/'); // Redirigimos al Home
      } catch (error) {
        alert("Error al eliminar la cuenta. Intenta nuevamente.");
      }
    }
  }
};


  return (
    <div className="max-w-5xl mx-auto py-8 px-4">

      {/* TARJETA PERFIL */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border-t-4 border-brand-primary relative">
        <div className="absolute top-4 right-4 flex gap-2">
          {isEditingProfile ? (
            <>
              <button onClick={saveProfile} className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">Guardar</button>
              <button onClick={() => setIsEditingProfile(false)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm font-bold">Cancelar</button>
            </>
          ) : (
            <button onClick={() => setIsEditingProfile(true)} className="bg-brand-primary text-white px-3 py-1 rounded text-sm font-bold">✏️ Editar Perfil</button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* FOTO */}
          <div className="relative group">
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow">
              {profileData.photo ? (
                <img src={profileData.photo} className="w-full h-full object-cover" alt="Perfil" />
              ) : (
                <span className="text-4xl text-brand-primary font-bold">
                  {user.name?.charAt(0)}
                </span>
              )}
            </div>

            {isEditingProfile && (
              <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full cursor-pointer flex justify-center items-center text-white text-xs opacity-0 group-hover:opacity-100 transition">
                Cambiar
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>

          {/* CAMPOS PERFIL */}
          <div className="flex-1 w-full">
            {isEditingProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className="border p-2 rounded"
                  value={profileData.name}
                  placeholder="Nombre completo"
                  onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                />
                <input
                  className="border p-2 rounded"
                  value={profileData.position}
                  placeholder="Cargo"
                  onChange={e => setProfileData({ ...profileData, position: e.target.value })}
                />
                <input
                  className="border p-2 rounded"
                  value={profileData.phone}
                  placeholder="Teléfono"
                  onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                />
                <input
                  className="border p-2 rounded"
                  value={profileData.address}
                  placeholder="Dirección"
                  onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                />
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-bold">{user.name}</h2>
                <p className="text-brand-primary text-lg">{user.position || "Sin cargo definido"}</p>
                <p className="text-gray-700 text-sm">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ANALIZAR PDF */}
      <div className="bg-blue-50 p-6 rounded-2xl mb-8 border border-blue-200 shadow-sm">
        <h3 className="font-bold text-blue-900 flex items-center gap-2">⚖️ Analizador de Contratos PDF</h3>
        <p className="text-sm text-blue-700 mb-3">Sube tu contrato y la IA detecta cláusulas importantes.</p>

        <label className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold cursor-pointer">
          📤 Seleccionar PDF
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              setAnalyzing(true);
              const formData = new FormData();
              formData.append('contractPdf', file);

              try {
                const res = await api.post('/ai/analyze', formData, {
                  headers: { "Content-Type": "multipart/form-data" }
                });
                setAnalysisResult(res.data.analysis);
              } catch {
                alert("Error analizando documento");
              }

              setAnalyzing(false);
            }}
          />
        </label>

        {analyzing && <p className="text-blue-800 font-bold mt-2">Analizando...</p>}

        {analysisResult && (
          <div className="mt-4 bg-white p-4 rounded-xl border shadow-inner text-sm whitespace-pre-wrap">
            {analysisResult}
          </div>
        )}
      </div>

      {/* CONTRATOS + IA */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* CONTRATOS */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="font-bold mb-4">{editingContractId ? "Editar Contrato" : "Nuevo Contrato"}</h3>

            <form onSubmit={handleContractSubmit} className="space-y-3">
              <input
                className="border p-2 rounded w-full"
                placeholder="Empresa"
                value={contractForm.company}
                onChange={e => setContractForm({ ...contractForm, company: e.target.value })}
                required
              />
              <input
                className="border p-2 rounded w-full"
                placeholder="Cargo"
                value={contractForm.role}
                onChange={e => setContractForm({ ...contractForm, role: e.target.value })}
                required
              />

              <select
                className="border p-2 rounded w-full"
                value={contractForm.type}
                onChange={e => setContractForm({ ...contractForm, type: e.target.value })}
              >
                <option>Indefinido</option>
                <option>Plazo Fijo</option>
                <option>Honorarios</option>
              </select>

              <input
                type="date"
                className="border p-2 rounded w-full"
                value={contractForm.startDate}
                onChange={e => setContractForm({ ...contractForm, startDate: e.target.value })}
              />

              <button className="bg-brand-primary text-white py-2 rounded w-full font-bold">
                {editingContractId ? "Actualizar Contrato" : "Guardar Contrato"}
              </button>

              {editingContractId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingContractId(null);
                    setContractForm({ company: '', role: '', startDate: '', type: 'Indefinido' });
                  }}
                  className="text-xs text-gray-500 mt-2 underline"
                >
                  Cancelar edición
                </button>
              )}
            </form>
          </div>

          {/* LISTA CONTRATOS */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="font-bold mb-4 border-b pb-2">Mis Contratos</h3>

            {contracts.length === 0 ? (
              <p className="text-gray-400 text-sm">{t("profile.no_contracts")}</p>
            ) : (
              <ul className="space-y-3">
                {contracts.map(c => (
                  <li key={c._id} className="border-l-4 border-brand-accent bg-gray-50 p-3 rounded">
                    <p className="font-bold">{c.role}</p>
                    <p className="text-sm">{c.company} ({c.type})</p>
                    <button
                      onClick={() => startEditingContract(c)}
                      className="text-gray-500 hover:text-brand-primary text-sm underline mt-1"
                    >
                      Editar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* CHAT IA */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-purple-200 h-fit">
          <h3 className="text-xl font-bold mb-4 text-purple-700">🤖 Chat Legal IA</h3>

          <textarea
            className="w-full border p-3 rounded mb-3"
            rows="4"
            placeholder="Ej: ¿Puedo hacer 12 horas extra?"
            value={question}
            onChange={e => setQuestion(e.target.value)}
          />

          <button
            onClick={handleAiConsult}
            disabled={loading}
            className="bg-purple-600 w-full text-white py-2 rounded font-bold"
          >
            {loading ? "Pensando..." : "Consultar"}
          </button>

          {aiResponse && (
            <div className="mt-4 p-4 bg-purple-50 rounded-xl border text-sm">
              {aiResponse}
            </div>
          )}
        </div>

      </div>
      {/* --- ZONA DE PELIGRO --- */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-red-600 font-bold text-lg mb-2">Zona de Peligro</h3>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-red-800 font-bold text-sm">Eliminar Cuenta</p>
            <p className="text-red-600 text-xs">
              Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate.
            </p>
          </div>
          <button 
            onClick={handleDeleteAccount}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition whitespace-nowrap"
          >
            Eliminar mi cuenta
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
