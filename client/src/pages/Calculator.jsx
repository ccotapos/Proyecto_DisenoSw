import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const OvertimeTracker = () => {
  const { t } = useTranslation();
  
  const [entries, setEntries] = useState([]);
  const [hourlyRate, setHourlyRate] = useState(() => localStorage.getItem('hourlyRate') || '');
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], hoursWorked: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [showRateCalc, setShowRateCalc] = useState(false);
  const [salaryForm, setSalaryForm] = useState({ monthlySalary: '', weeklyHours: '44' });

  useEffect(() => { fetchEntries(); }, []);
  useEffect(() => { localStorage.setItem('hourlyRate', hourlyRate); }, [hourlyRate]);

  const fetchEntries = async () => {
    try {
      const res = await api.get('/labor');
      setEntries(res.data);
    } catch (error) { console.error("Error"); }
  };

  const calculateRateFromSalary = () => {
    const salary = parseFloat(salaryForm.monthlySalary);
    const hours = parseFloat(salaryForm.weeklyHours);
    if (!salary || !hours) return;
    const calculatedRate = (salary / 30) * 7 / hours;
    setHourlyRate(Math.round(calculatedRate).toString());
    setShowRateCalc(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/labor', { ...form, isOvertime: true });
      setEntries([res.data, ...entries]);
      setForm({ ...form, hoursWorked: '', notes: '' });
    } catch (error) { alert("Error"); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('overtime.history.delete_confirm'))) return;
    try {
      await api.delete(`/labor/${id}`);
      setEntries(entries.filter(e => e._id !== id));
    } catch (error) { alert("Error"); }
  };

  const totalHours = entries.reduce((sum, item) => sum + item.hoursWorked, 0);
  const totalMoney = hourlyRate ? totalHours * parseFloat(hourlyRate) * 1.5 : 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-primary">{t('overtime.title')}</h1>
          <p className="text-gray-500">{t('overtime.subtitle')}</p>
        </div>
        
        <div className="relative">
          <div className="bg-white p-4 rounded-xl shadow-md border border-brand-accent flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-600 text-sm">{t('overtime.rate_label')}</span>
              <input 
                type="number" 
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="border-b-2 border-brand-primary w-24 text-center font-extrabold text-lg outline-none"
                placeholder="0"
              />
            </div>
            <button onClick={() => setShowRateCalc(!showRateCalc)} className="text-xs text-brand-secondary font-bold underline">
              {showRateCalc ? t('overtime.rate_close_btn') : t('overtime.rate_calc_btn')}
            </button>
          </div>

          {showRateCalc && (
            <div className="absolute right-0 top-full mt-2 bg-white p-5 rounded-xl shadow-xl border border-gray-200 z-10 w-72 animate-fade-in-down">
              <h3 className="font-bold text-brand-dark mb-3 text-sm">{t('overtime.popup.title')}</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-500">{t('overtime.popup.salary')}</label>
                  <input type="number" className="w-full border p-2 rounded text-sm" value={salaryForm.monthlySalary} onChange={e => setSalaryForm({...salaryForm, monthlySalary: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">{t('overtime.popup.hours')}</label>
                  <select className="w-full border p-2 rounded text-sm" value={salaryForm.weeklyHours} onChange={e => setSalaryForm({...salaryForm, weeklyHours: e.target.value})}>
                    <option value="45">45</option>
                    <option value="44">44</option>
                    <option value="40">40</option>
                  </select>
                </div>
                <button onClick={calculateRateFromSalary} className="w-full bg-brand-accent text-brand-dark font-bold py-2 rounded text-sm">
                  {t('overtime.popup.btn_apply')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-brand-secondary sticky top-4">
            <h2 className="text-xl font-bold mb-4 text-brand-dark">{t('overtime.form.title')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500">{t('overtime.form.date')}</label>
                <input type="date" required className="w-full border p-2 rounded" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">{t('overtime.form.hours')}</label>
                <input type="number" step="0.5" required className="w-full border p-2 rounded" value={form.hoursWorked} onChange={(e) => setForm({...form, hoursWorked: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">{t('overtime.form.notes')}</label>
                <input type="text" className="w-full border p-2 rounded" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition shadow-md">
                {loading ? t('overtime.form.btn_saving') : t('overtime.form.btn_save')}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-brand-dark text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="opacity-80 text-sm">{t('overtime.summary.total_hours')}</p>
              <p className="text-3xl font-bold">{totalHours} hrs</p>
            </div>
            <div className="text-right bg-white bg-opacity-10 p-4 rounded-xl min-w-[200px]">
              <p className="opacity-80 text-xs mb-1">{t('overtime.summary.total_pay')}</p>
              {hourlyRate ? (
                <p className="text-4xl font-extrabold text-brand-accent">${Math.round(totalMoney).toLocaleString('es-CL')}</p>
              ) : (
                <p className="text-sm text-gray-400">{t('overtime.summary.no_rate')}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <h3 className="bg-gray-50 p-4 font-bold border-b text-gray-700">{t('overtime.history.title')}</h3>
            {entries.length === 0 ? (
              <div className="p-8 text-center text-gray-400">{t('overtime.history.empty')}</div>
            ) : (
              <div className="divide-y">
                {entries.map((entry) => (
                  <div key={entry._id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      <div className="bg-brand-light text-brand-primary p-2 rounded-lg text-center min-w-[60px]">
                        <p className="text-xs font-bold uppercase">{new Date(entry.date).toLocaleString('es-ES', { month: 'short' })}</p>
                        <p className="text-xl font-extrabold">{new Date(entry.date).getDate() + 1}</p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{entry.hoursWorked} hrs</p>
                        <p className="text-sm text-gray-500">{entry.notes}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleDelete(entry._id)} className="text-red-300 hover:text-red-500 transition">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OvertimeTracker;