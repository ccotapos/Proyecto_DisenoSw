import React, { useState } from 'react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const AiAssistant = () => {
  const { t } = useTranslation();

  // Estados para Chat
  const [question, setQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  // Estados para PDF
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzingPdf, setAnalyzingPdf] = useState(false);

  // --- LÓGICA DEL CHAT ---
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setLoadingChat(true);
    setChatResponse('');
    
    try {
      const res = await api.post('/ai/consult', { question });
      setChatResponse(res.data.answer);
    } catch (error) {
      setChatResponse("Lo siento, hubo un error al conectar con la IA. Intenta más tarde.");
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
      alert("Error al analizar el documento. Asegúrate de que sea un PDF válido.");
    } finally {
      setAnalyzingPdf(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-extrabold text-brand-primary mb-2 text-center">
        🤖 Asistente Legal IA
      </h1>
      <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
        Resuelve tus dudas laborales al instante o sube tu contrato para que lo analicemos en busca de cláusulas importantes.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* --- COLUMNA IZQUIERDA: CHAT --- */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-purple-600 h-fit">
          <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
            💬 Chat de Consultas
          </h2>
          
          <form onSubmit={handleChatSubmit}>
            <textarea
              className="w-full border p-3 rounded-lg mb-3 focus:ring-2 focus:ring-purple-300 outline-none min-h-[150px]"
              placeholder="Ej: ¿Cuántos días de aviso necesito para renunciar? ¿Es legal trabajar 12 horas seguidas?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loadingChat}
              className="w-full bg-purple-600 text-white font-bold py-2.5 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 shadow-md"
            >
              {loadingChat ? "Analizando..." : "Preguntar"}
            </button>
          </form>

          {chatResponse && (
            <div className="mt-6 bg-purple-50 p-4 rounded-xl border border-purple-100 animate-fade-in-up">
              <h3 className="font-bold text-purple-900 text-sm mb-2">Respuesta:</h3>
              <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                {chatResponse}
              </p>
            </div>
          )}
        </div>

        {/* --- COLUMNA DERECHA: ANALIZADOR PDF --- */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-blue-600 h-fit">
          <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
            📄 Analizador de Contratos
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Sube tu contrato (PDF) y te daremos un resumen de tus derechos, sueldo y posibles "trampas".
          </p>

          <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition ${analyzingPdf ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <p className="text-3xl mb-2">📤</p>
              <p className="text-sm text-blue-600 font-semibold">
                {analyzingPdf ? "Leyendo documento..." : "Clic para subir PDF"}
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

          {analysisResult && (
            <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 animate-fade-in-up">
              <h3 className="font-bold text-blue-900 text-sm mb-2">Análisis del Contrato:</h3>
              <div className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
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