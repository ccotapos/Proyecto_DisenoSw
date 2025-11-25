import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const OvertimeTracker = () => {
  const { t } = useTranslation();

  const [entries, setEntries] = useState([]);
  const [hourlyRate, setHourlyRate] = useState(() => localStorage.getItem('hourlyRate') || '');
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    hoursWorked: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const [showRateCalc, setShowRateCalc] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    monthlySalary: '',
    weeklyHours: '44'
  });

  useEffect(() => { fetchEntries(); }, []);
  useEffect(() => { localStorage.setItem('hourlyRate', hourlyRate); }, [hourlyRate]);

  const fetchEntries = async () => {
    try {
      const res = await api.get('/labor');
      setEntries(res.data);
    } catch (error) {
      console.error(t('overtime.error_loading'), error);
    }
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
    } catch {
      alert(t('overtime.error_saving'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('overtime.confirm_delete'))) return;
    try {
      await api.delete(`/labor/${id}`);
      setEntries(entries.filter(e => e._id !== id));
    } catch {
      alert(t('overtime.error_delete'));
    }
  };

  const totalHours = entries.reduce((sum, item) => sum + item.hoursWorked, 0);
  const overtimeRate = hourlyRate ? parseFloat(hourlyRate) * 1.5 : 0;
  const totalMoney = totalHours * overtimeRate;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-primary">💰 {t('overtime.title')}</h1>
          <p className="text-gray-500">{t('overtime.subtitle')}</p>
        </div>

        {/* HOURLY RATE */}
        <div className="relative">
          <div className="bg-white p-4 rounded-xl shadow-md border border-brand-accent flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-600 text-sm">{t('overtime.hourly_rate')}</span>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="border-b-2 border-brand-primary w-24 text-center font-extrabold text-lg outline-none focus:border-brand-accent text-brand-dark bg-transparent"
                placeholder="0"
              />
            </div>

            <button
              onClick={() => setShowRateCalc(!showRateCalc)}
              className="text-xs text-brand-secondary font-bold underline hover:text-brand-primary transition"
            >
              {showRateCalc ? t('overtime.close_calc') : t('overtime.open_calc')}
            </button>
          </div>

          {showRateCalc && (
            <div className="absolute right-0 top-full mt-2 bg-white p-5 rounded-xl shadow-xl border border-gray-200 z-10 w-72">
              <h3 className="font-bold text-brand-dark mb-3 text-sm">🔢 {t('overtime.calc_from_salary')}</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-500">{t('overtime.monthly_salary')}</label>
                  <input
                    type="number"
                    className="w-full border p-2 rounded text-sm"
                    placeholder="Ej: 500000"
                    value={salaryForm.monthlySalary}
                    onChange={e => setSalaryForm({ ...salaryForm, monthlySalary: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">{t('overtime.weekly_hours')}</label>
                  <select
                    className="w-full border p-2 rounded text-sm"
                    value={salaryForm.weeklyHours}
                    onChange={e => setSalaryForm({ ...salaryForm, weeklyHours: e.target.value })}
                  >
                    <option value="45">45 {t('overtime.hours')}</option>
                    <option value="44">44 {t('overtime.hours')}</option>
                    <option value="40">40 {t('overtime.hours')}</option>
                  </select>
                </div>
                <button
                  onClick={calculateRateFromSalary}
                  className="w-full bg-brand-accent text-brand-dark font-bold py-2 rounded text-sm hover:bg-opacity-80 transition"
                >
                  {t('overtime.apply_rate')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">

        {/* FORM */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-brand-secondary sticky top-4">
            <h2 className="text-xl font-bold mb-4 text-brand-dark">➕ {t('overtime.new_entry')}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500">{t('overtime.date')}</label>
                <input
                  type="date"
                  required
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-accent outline-none"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">{t('overtime.hours_worked')}</label>
                <input
                  type="number" step="0.5" required placeholder="Ej: 2.5"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-accent outline-none"
                  value={form.hoursWorked}
                  onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">{t('overtime.notes')}</label>
                <input
                  type="text" placeholder="Ej: Cierre de mes..."
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-accent outline-none"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition shadow-md">
                {loading ? t('overtime.saving') : t('overtime.register')}
              </button>
            </form>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="md:col-span-2 space-y-6">

          {/* TOTAL */}
          <div className="bg-brand-dark text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="opacity-80 text-sm">{t('overtime.total_hours')}</p>
              <p className="text-3xl font-bold">{totalHours} {t('overtime.hours')}</p>
            </div>

            <div className="text-right bg-white bg-opacity-10 p-4 rounded-xl min-w-[200px]">
              <p className="opacity-80 text-xs mb-1">{t('overtime.total_pay')}</p>
              {hourlyRate ? (
                <p className="text-4xl font-extrabold text-brand-accent">
                  ${Math.round(totalMoney).toLocaleString('es-CL')}
                </p>
              ) : (
                <p className="text-sm text-gray-400">{t('overtime.enter_hourly_rate')}</p>
              )}
            </div>
          </div>

          {/* HISTORY */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <h3 className="bg-gray-50 p-4 font-bold border-b text-gray-700">📅 {t('overtime.history')}</h3>

            {entries.length === 0 ? (
              <div className="p-8 text-center text-gray-400">{t('overtime.no_entries')}</div>
            ) : (
              <div className="divide-y">
                {entries.map((entry) => (
                  <div key={entry._id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      <div className="bg-brand-light text-brand-primary p-2 rounded-lg text-center min-w-[60px]">
                        <p className="text-xs font-bold uppercase">
                          {new Date(entry.date).toLocaleString('es-ES', { month: 'short' })}
                        </p>
                        <p className="text-xl font-extrabold">
                          {new Date(entry.date).getDate()}
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-gray-800">{entry.hoursWorked} {t('overtime.hours')}</p>
                        <p className="text-sm text-gray-500">{entry.notes || t('overtime.no_notes')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {hourlyRate && (
                        <span className="text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded">
                          +${Math.round(entry.hoursWorked * overtimeRate).toLocaleString('es-CL')}
                        </span>
                      )}

                      <button
                        onClick={() => handleDelete(entry._id)}
                        className="text-red-300 hover:text-red-500 transition"
                      >
                        🗑️
                      </button>
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
