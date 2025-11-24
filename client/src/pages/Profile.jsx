import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { askLegalAssistant } from '../services/aiService';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [contracts, setContracts] = useState([]);
  const [newContract, setNewContract] = useState({
    company: '', role: '', startDate: '', type: 'Indefinido'
  });

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await api.get('/contracts');
        setContracts(res.data);
      } catch (error) {
        console.error(t("error"));
      }
    };
    if (user) fetchContracts();
  }, [user, t]);

  const handleAddContract = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/contracts', newContract);
      setContracts([res.data, ...contracts]);
      setNewContract({ company: '', role: '', startDate: '', type: 'Indefinido' });
    } catch (error) {
      alert(t("error"));
    }
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
    <div className="max-w-4xl mx-auto py-8">

      {/* Perfil Header */}
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

        {/* IZQUIERDA – Registro Contratos */}
        <div className="space-y-8">

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-bold mb-4 text-brand-primary">
              {t("profile.register_contract")}
            </h3>

            <form onSubmit={handleAddContract} className="space-y-4">

              <input 
                type="text"
                placeholder={t("profile.company")}
                required
                className="w-full border p-2 rounded"
                value={newContract.company}
                onChange={e => setNewContract({...newContract, company: e.target.value})}
              />

              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text"
                  placeholder={t("profile.role")}
                  required
                  className="w-full border p-2 rounded"
                  value={newContract.role}
                  onChange={e => setNewContract({...newContract, role: e.target.value})}
                />

                <select 
                  className="w-full border p-2 rounded"
                  value={newContract.type}
                  onChange={e => setNewContract({...newContract, type: e.target.value})}
                >
                  <option>{t("profile.indefinido")}</option>
                  <option>{t("profile.plazo_fijo")}</option>
                  <option>{t("profile.honorarios")}</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">{t("profile.start_date")}</label>
                <input 
                  type="date"
                  required
                  className="w-full border p-2 rounded"
                  value={newContract.startDate}
                  onChange={e => setNewContract({...newContract, startDate: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full bg-brand-primary text-white py-2 rounded">
                {t("profile.save_contract")}
              </button>

            </form>
          </div>

          {/* LISTA CONTRATOS */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-bold mb-4 border-b pb-2">{t('contracts')}</h3>

            {contracts.length === 0 ? (
              <p className="text-gray-400 text-sm">{t("profile.no_contracts")}</p>
            ) : (
              <ul className="space-y-4">
                {contracts.map(c => (
                  <li key={c._id} className="border-l-4 border-brand-accent pl-4 py-1">
                    <p className="font-bold text-brand-dark">{c.role}</p>
                    <p className="text-sm text-gray-600">
                      {c.company}
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full ml-2">{c.type}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {t("profile.since")}: {new Date(c.startDate).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

        {/* DERECHA – IA */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-purple-100 h-fit">

          <h3 className="text-xl font-bold mb-4 text-purple-700 flex items-center gap-2">
            {t('ask_ai')}
          </h3>

          <p className="text-sm text-gray-500 mb-4">
            {t("profile.ai_description")}
          </p>

          <textarea
            className="w-full border p-3 rounded-lg mb-3"
            rows="4"
            placeholder={t('ask_placeholder')}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <button 
            onClick={handleAiConsult}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-3 rounded-lg w-full font-bold disabled:opacity-50"
          >
            {loading ? t('loading') : t("profile.ask_button")}
          </button>

          {aiResponse && (
            <div className="mt-6 p-4 bg-purple-50 rounded-xl text-sm border border-purple-200">
              <strong className="block text-purple-800 mb-2">
                {t("profile.response")}
              </strong>
              <p className="leading-relaxed text-gray-700">{aiResponse}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;