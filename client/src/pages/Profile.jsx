import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { askLegalAssistant } from '../services/aiService';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { user, login } = useAuth();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    position: '',
    phone: '',
    address: '',
    photo: ''
  });

  const [contracts, setContracts] = useState([]);
  const [editingContractId, setEditingContractId] = useState(null);
  const [contractForm, setContractForm] = useState({
    company: '',
    role: '',
    startDate: '',
    type: 'Indefinido'
  });

  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

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
    } catch {
      console.error("Error cargando contratos");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2_000_000) {
      alert(t("profile.image_too_large"));
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
      alert(t("profile.updated_success"));
    } catch {
      alert(t("profile.update_error"));
    }
  };

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
      alert(t("contracts.error"));
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

  const handleAiConsult = async () => {
    if (!question.trim()) return;
    setLoading(true);
    const answer = await askLegalAssistant(question);
    setAiResponse(answer);
    setLoading(false);
  };

  if (!user) return <p className="text-center mt-10">{t("auth.must_login")}</p>;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">

      {/* PERFIL */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border-t-4 border-brand-primary relative">
        <div className="absolute top-4 right-4 flex gap-2">
          {isEditingProfile ? (
            <>
              <button onClick={saveProfile} className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">
                {t("profile.save")}
              </button>
              <button onClick={() => setIsEditingProfile(false)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm font-bold">
                {t("profile.cancel")}
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditingProfile(true)} className="bg-brand-primary text-white px-3 py-1 rounded text-sm font-bold">
              ✏️ {t("profile.edit")}
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="relative group">
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow">
              {profileData.photo ? (
                <img src={profileData.photo} className="w-full h-full object-cover" alt={t("profile.photo")} />
              ) : (
                <span className="text-4xl text-brand-primary font-bold">
                  {user.name?.charAt(0)}
                </span>
              )}
            </div>

            {isEditingProfile && (
              <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full cursor-pointer flex justify-center items-center text-white text-xs opacity-0 group-hover:opacity-100 transition">
                {t("profile.change_photo")}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>

          <div className="flex-1 w-full">
            {isEditingProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="border p-2 rounded" value={profileData.name} placeholder={t("profile.fullname")} onChange={e => setProfileData({ ...profileData, name: e.target.value })} />
                <input className="border p-2 rounded" value={profileData.position} placeholder={t("profile.position")} onChange={e => setProfileData({ ...profileData, position: e.target.value })} />
                <input className="border p-2 rounded" value={profileData.phone} placeholder={t("profile.phone")} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} />
                <input className="border p-2 rounded" value={profileData.address} placeholder={t("profile.address")} onChange={e => setProfileData({ ...profileData, address: e.target.value })} />
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-bold">{user.name}</h2>
                <p className="text-brand-primary text-lg">{user.position || t("profile.no_position")}</p>
                <p className="text-gray-700 text-sm">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ANALIZADOR PDF */}
      <div className="bg-blue-50 p-6 rounded-2xl mb-8 border border-blue-200 shadow-sm">
        <h3 className="font-bold text-blue-900 flex items-center gap-2">⚖️ {t("pdf.title")}</h3>
        <p className="text-sm text-blue-700 mb-3">{t("pdf.description")}</p>

        <label className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold cursor-pointer">
          📤 {t("pdf.upload")}
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
                alert(t("pdf.error"));
              }

              setAnalyzing(false);
            }}
          />
        </label>

        {analyzing && <p className="text-blue-800 font-bold mt-2">{t("pdf.analyzing")}</p>}

        {analysisResult && (
          <div className="mt-4 bg-white p-4 rounded-xl border shadow-inner text-sm whitespace-pre-wrap">
            {analysisResult}
          </div>
        )}
      </div>

      {/* CONTRATOS + CHAT IA */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* NUEVO / EDITAR CONTRATO */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="font-bold mb-4">
              {editingContractId ? t("contracts.edit_title") : t("contracts.new_title")}
            </h3>

            <form onSubmit={handleContractSubmit} className="space-y-3">
              <input className="border p-2 rounded w-full" placeholder={t("contracts.company")} value={contractForm.company} onChange={e => setContractForm({ ...contractForm, company: e.target.value })} required />
              <input className="border p-2 rounded w-full" placeholder={t("contracts.role")} value={contractForm.role} onChange={e => setContractForm({ ...contractForm, role: e.target.value })} required />

              <select className="border p-2 rounded w-full" value={contractForm.type} onChange={e => setContractForm({ ...contractForm, type: e.target.value })}>
                <option>{t("contracts.indef")}</option>
                <option>{t("contracts.fixed")}</option>
                <option>{t("contracts.honorary")}</option>
              </select>

              <input type="date" className="border p-2 rounded w-full" value={contractForm.startDate} onChange={e => setContractForm({ ...contractForm, startDate: e.target.value })} />

              <button className="bg-brand-primary text-white py-2 rounded w-full font-bold">
                {editingContractId ? t("contracts.update") : t("contracts.save")}
              </button>

              {editingContractId && (
                <button type="button" onClick={() => {
                  setEditingContractId(null);
                  setContractForm({ company: '', role: '', startDate: '', type: 'Indefinido' });
                }} className="text-xs text-gray-500 mt-2 underline">
                  {t("contracts.cancel_edit")}
                </button>
              )}
            </form>
          </div>

          {/* LISTA CONTRATOS */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="font-bold mb-4 border-b pb-2">{t("contracts.my_contracts")}</h3>

            {contracts.length === 0 ? (
              <p className="text-gray-400 text-sm">{t("profile.no_contracts")}</p>
            ) : (
              <ul className="space-y-3">
                {contracts.map(c => (
                  <li key={c._id} className="border-l-4 border-brand-accent bg-gray-50 p-3 rounded">
                    <p className="font-bold">{c.role}</p>
                    <p className="text-sm">{c.company} ({c.type})</p>
                    <button onClick={() => startEditingContract(c)} className="text-gray-500 hover:text-brand-primary text-sm underline mt-1">
                      {t("contracts.edit")}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* CHAT IA */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-purple-200 h-fit">
          <h3 className="text-xl font-bold mb-4 text-purple-700">🤖 {t("ai.title")}</h3>

          <textarea className="w-full border p-3 rounded mb-3" rows="4" placeholder={t("ai.placeholder")} value={question} onChange={e => setQuestion(e.target.value)} />

          <button onClick={handleAiConsult} disabled={loading} className="bg-purple-600 w-full text-white py-2 rounded font-bold">
            {loading ? t("ai.loading") : t("ai.ask")}
          </button>

          {aiResponse && (
            <div className="mt-4 p-4 bg-purple-50 rounded-xl border text-sm">
              {aiResponse}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
