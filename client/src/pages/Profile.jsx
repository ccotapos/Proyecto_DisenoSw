
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, login, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', position: '', phone: '', address: '', photo: '' });
  const [contracts, setContracts] = useState([]);
  const [editingContractId, setEditingContractId] = useState(null);
  const [contractForm, setContractForm] = useState({ company: '', role: '', startDate: '', type: 'Indefinido' });

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
    try { const res = await api.get('/contracts'); setContracts(res.data); } catch (error) {}
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
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
    } catch (error) { alert("Error"); }
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
    } catch (error) { alert("Error"); }
  };

  const startEditingContract = (contract) => {
    setEditingContractId(contract._id);
    setContractForm({
      company: contract.company,
      role: contract.role,
      startDate: contract.startDate ? contract.startDate.split('T')[0] : '',
      type: contract.type
    });
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(t('profile.danger_zone.confirm_1'))) {
      if (window.confirm(t('profile.danger_zone.confirm_2'))) {
        try {
          await api.delete('/auth/profile');
          alert(t('profile.danger_zone.success'));
          logout();
          navigate('/');
        } catch (error) { alert("Error"); }
      }
    }
  };

  if (!user) return <div className="text-center mt-10">{t('profile.loading')}</div>;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      
      {/* TARJETA DATOS PERSONALES */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border-t-4 border-brand-primary relative">
        <div className="absolute top-4 right-4 flex gap-2">
          {isEditingProfile ? (
            <>
              <button onClick={saveProfile} className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold shadow">{t('profile.save_btn')}</button>
              <button onClick={() => setIsEditingProfile(false)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm font-bold">{t('profile.cancel_btn')}</button>
            </>
          ) : (
            <button onClick={() => setIsEditingProfile(true)} className="bg-brand-primary text-white px-3 py-1 rounded text-sm font-bold shadow hover:bg-opacity-90">{t('profile.edit_btn')}</button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow">
               {profileData.photo ? <img src={profileData.photo} className="w-full h-full object-cover" /> : <span className="text-4xl text-brand-primary font-bold">{user.name?.charAt(0)}</span>}
            </div>
            {isEditingProfile && (
              <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition">
                {t('profile.change_photo')}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>

          <div className="flex-1 w-full">
            {isEditingProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                <div><label className="text-xs text-gray-500 font-bold">{t('profile.labels.name')}</label><input type="text" className="w-full border p-2 rounded" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} /></div>
                <div><label className="text-xs text-gray-500 font-bold">{t('profile.labels.role')}</label><input type="text" className="w-full border p-2 rounded" value={profileData.position} onChange={e => setProfileData({...profileData, position: e.target.value})} /></div>
                <div><label className="text-xs text-gray-500 font-bold">{t('profile.labels.phone')}</label><input type="text" className="w-full border p-2 rounded" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} /></div>
                <div><label className="text-xs text-gray-500 font-bold">{t('profile.labels.address')}</label><input type="text" className="w-full border p-2 rounded" value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} /></div>
              </div>
            ) : (
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-brand-dark">{user.name}</h2>
                <p className="text-brand-primary font-medium text-lg mb-2">{user.position || t('profile.no_position')}</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-600">
                  <span>📧 {user.email}</span>
                  {user.phone && <span>📱 {user.phone}</span>}
                  {user.address && <span>📍 {user.address}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* FORMULARIO CONTRATO */}
        <div className="bg-white p-6 rounded-2xl shadow-md h-fit">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-brand-primary">{editingContractId ? t('profile.contracts.title_edit') : t('profile.contracts.title_new')}</h3>
                {editingContractId && <button onClick={() => {setEditingContractId(null); setContractForm({company:'', role:'', startDate:'', type:'Indefinido'})}} className="text-xs text-red-500 underline">{t('profile.contracts.btn_cancel')}</button>}
            </div>
            <form onSubmit={handleContractSubmit} className="space-y-3">
                <input className="w-full border p-2 rounded" placeholder={t('profile.contracts.company')} value={contractForm.company} onChange={e => setContractForm({...contractForm, company: e.target.value})} required />
                <div className="grid grid-cols-2 gap-2">
                    <input className="w-full border p-2 rounded" placeholder={t('profile.contracts.role')} value={contractForm.role} onChange={e => setContractForm({...contractForm, role: e.target.value})} required />
                    <select className="w-full border p-2 rounded" value={contractForm.type} onChange={e => setContractForm({...contractForm, type: e.target.value})}>
                        <option>Indefinido</option><option>Plazo Fijo</option><option>Honorarios</option>
                    </select>
                </div>
                <input type="date" className="w-full border p-2 rounded" value={contractForm.startDate} onChange={e => setContractForm({...contractForm, startDate: e.target.value})} required />
                <button type="submit" className={`w-full text-white font-bold py-2 rounded shadow ${editingContractId ? 'bg-orange-500' : 'bg-brand-primary'}`}>
                    {editingContractId ? t('profile.contracts.btn_update') : t('profile.contracts.btn_save')}
                </button>
            </form>
        </div>

        {/* LISTA DE CONTRATOS */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="font-bold text-brand-dark mb-4 border-b pb-2">{t('profile.contracts.list_title')}</h3>
            {contracts.length === 0 ? <p className="text-gray-400 text-sm">{t('profile.contracts.empty')}</p> : (
                <ul className="space-y-3">
                    {contracts.map(c => (
                        <li key={c._id} className="flex justify-between items-center border-l-4 border-brand-accent pl-3 py-2 bg-gray-50 rounded-r">
                            <div><p className="font-bold text-sm">{c.role}</p><p className="text-xs text-gray-600">{c.company} ({c.type})</p></div>
                            <button onClick={() => startEditingContract(c)} className="text-gray-400 hover:text-brand-primary px-2">✏️</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>

      {/* ZONA DE PELIGRO */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-red-600 font-bold text-lg mb-2">{t('profile.danger_zone.title')}</h3>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-red-800 font-bold text-sm">{t('profile.danger_zone.delete_account')}</p>
            <p className="text-red-600 text-xs">{t('profile.danger_zone.warning')}</p>
          </div>
          <button onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition whitespace-nowrap">{t('profile.danger_zone.btn_delete')}</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;