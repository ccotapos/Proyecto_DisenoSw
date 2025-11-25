import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const AiAssistant = () => {
  const { t } = useTranslation();

  // --- ESTADOS DEL CHAT ---
  const [question, setQuestion] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { type: 'ai', text: 'Hola 👋. Soy tu asistente legal virtual. ¿En qué puedo ayudarte hoy?' }
  ]);

  // --- ESTADOS DEL PDF ---
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzingPdf, setAnalyzingPdf] = useState(false);

  // Referencia para auto-scroll
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // --- LÓGICA DEL CHAT ---
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQuestion = question;
    // 1. Agregar pregunta usuario
    setChatHistory(prev => [...prev, { type: 'user', text: userQuestion }]);
    setQuestion('');
    setLoadingChat(true);
    
    try {
      // 2. Consultar API
      const res = await api.post('/ai/consult', { question: userQuestion });
      // 3. Agregar respuesta IA
      setChatHistory(prev => [...prev, { type: 'ai', text: res.data.answer }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { type: 'ai', text: "Error de conexión. Intenta nuevamente." }]);
    } finally {
      setLoadingChat(false);
    }
  };

  // --- LÓGICA DEL PDF ---
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAnalyzingPdf(true);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('contractPdf', file);

    try {
      const res = await api.post('/ai/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysisResult(res.data.analysis);
    } catch (error) {
      alert("Error al analizar el documento.");
    } finally {
      setAnalyzingPdf(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-extrabold text-brand-primary mb-2 text-center">
        🤖 Asistente Legal IA
      </h1>
      <p className="text-center text-gray-500 mb-10">
        Tu experto virtual en legislación laboral chilena.
      </p>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* --- COLUMNA IZQUIERDA: CHAT (7 cols) --- */}
        <div className="md:col-span-7 flex flex-col h-[600px] bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          
          {/* Lista de Mensajes */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-4 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                    msg.type === 'user' 
                      ? 'bg-brand-primary text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {loadingChat && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-500 px-4 py-2 rounded-full text-xs animate-pulse">
                  Escribiendo...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:ring-2 focus:ring-brand-accent outline-none transition"
                placeholder="Escribe tu duda legal aquí..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <button 
                type="submit"
                disabled={loadingChat}
                className="bg-brand-primary text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-brand-dark transition shadow-md disabled:opacity-50"
              >
                ➤
              </button>
            </form>
          </div>
        </div>

        {/* --- COLUMNA DERECHA: PDF (5 cols) --- */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-blue-600">
            <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
              📄 Analizador de Contratos
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Sube tu contrato (PDF) y obtén un resumen instantáneo de las condiciones.
            </p>

            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition ${analyzingPdf ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <p className="text-3xl mb-2">{analyzingPdf ? "⏳" : "📤"}</p>
                <p className="text-sm text-blue-600 font-semibold">
                  {analyzingPdf ? "Analizando documento..." : "Clic para subir PDF"}
                </p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf"
                onChange={handlePdfUpload}
                disabled={analyzingPdf}
              />
            </label>
          </div>

          {analysisResult && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 animate-fade-in-up h-[350px] overflow-y-auto custom-scrollbar">
              <h3 className="font-bold text-blue-900 text-sm mb-3 sticky top-0 bg-white pb-2 border-b">
                🔍 Resultado del Análisis:
              </h3>
              <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                {analysisResult}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AiAssistant;