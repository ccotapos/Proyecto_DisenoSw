import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const AiAssistant = () => {
  const { t } = useTranslation();

  // --- ESTADOS ---
  const [chatList, setChatList] = useState([]); // Lista lateral
  const [currentChatId, setCurrentChatId] = useState(null); // ID chat actual
  const [messages, setMessages] = useState([]); // Mensajes visibles
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  // --- CARGA INICIAL ---
  useEffect(() => {
    loadHistory();
  }, []);

  // Auto-scroll al fondo
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 1. Cargar lista de conversaciones
  const loadHistory = async () => {
    try {
      const res = await api.get('/ai/history');
      setChatList(res.data);
    } catch (error) {
      console.error("Error cargando historial");
    }
  };

  // 2. Cargar una conversación específica
  const selectChat = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/ai/history/${id}`);
      setCurrentChatId(id);
      setMessages(res.data.messages);
    } catch (error) {
      console.error("Error cargando chat");
    } finally {
      setLoading(false);
    }
  };

  // 3. Empezar chat nuevo
  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  // 4. Enviar mensaje
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    // Optimismo: Agregar mensaje del usuario inmediatamente
    const newMsgUser = { role: 'user', content: question };
    setMessages(prev => [...prev, newMsgUser]);
    const inputQuestion = question;
    setQuestion('');
    setLoading(true);

    try {
      // Enviar al backend (si hay ID, sigue el hilo. Si no, crea uno)
      const res = await api.post('/ai/send', { 
        question: inputQuestion, 
        chatId: currentChatId 
      });

      const newMsgAi = { role: 'ai', content: res.data.answer };
      setMessages(prev => [...prev, newMsgAi]);

      // Si era un chat nuevo, actualizamos el ID y la lista lateral
      if (!currentChatId) {
        setCurrentChatId(res.data.chatId);
        loadHistory(); // Recargar lista para ver el nuevo título
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "⚠️ Error de conexión. Intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  };

  // 5. Borrar Chat
  const handleDeleteChat = async (e, id) => {
    e.stopPropagation(); // Evitar que se seleccione al borrar
    if (!window.confirm("¿Borrar esta conversación?")) return;
    try {
      await api.delete(`/ai/history/${id}`);
      setChatList(prev => prev.filter(c => c._id !== id));
      if (currentChatId === id) startNewChat();
    } catch (error) { console.error("Error borrando"); }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 h-[85vh] flex flex-col">
      
      <div className="flex-1 flex overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-200">
        
        {/* --- SIDEBAR (HISTORIAL) --- */}
        <div className="w-1/3bg-gray-50 border-r border-gray-200 flex flex-col w-64 hidden md:flex">
          {/* Botón Nuevo Chat */}
          <div className="p-4">
            <button 
              onClick={startNewChat}
              className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold shadow hover:bg-brand-dark transition flex items-center justify-center gap-2"
            >
              <span>+</span> Nuevo Chat
            </button>
          </div>

          {/* Lista Scrollable */}
          <div className="flex-1 overflow-y-auto px-2 space-y-2 custom-scrollbar">
            {chatList.length === 0 && <p className="text-center text-xs text-gray-400 mt-4">Sin historial</p>}
            
            {chatList.map(chat => (
              <div 
                key={chat._id}
                onClick={() => selectChat(chat._id)}
                className={`p-3 rounded-lg cursor-pointer text-sm flex justify-between items-center group transition ${
                  currentChatId === chat._id ? 'bg-white shadow border-l-4 border-brand-secondary' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <span className="truncate flex-1 font-medium">{chat.title}</span>
                <button 
                  onClick={(e) => handleDeleteChat(e, chat._id)}
                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 px-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* --- AREA PRINCIPAL (CHAT) --- */}
        <div className="flex-1 flex flex-col bg-white relative">
          
          {/* Header Móvil (Solo visible en celular para volver al historial o nuevo chat) */}
          <div className="md:hidden p-2 border-b flex justify-between">
             <button onClick={startNewChat} className="text-xs bg-gray-200 px-2 py-1 rounded">Nuevo Chat</button>
             {/* Aquí podrías poner un botón para abrir un menú lateral en móvil */}
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                <span className="text-6xl mb-4">🤖</span>
                <p className="text-lg font-medium">¿En qué duda legal puedo ayudarte hoy?</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-primary text-white rounded-tr-none' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-full text-xs animate-pulse text-gray-500">
                  Escribiendo respuesta...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <form onSubmit={handleSubmit} className="relative flex items-center gap-2 max-w-3xl mx-auto">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-full py-3 pl-5 pr-12 focus:ring-2 focus:ring-brand-secondary outline-none shadow-sm transition"
                placeholder="Escribe tu pregunta..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="absolute right-2 bg-brand-secondary text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-brand-primary transition disabled:opacity-50"
              >
                ➤
              </button>
            </form>
            <p className="text-center text-[10px] text-gray-400 mt-2">
              La IA puede cometer errores. Verifica la información importante.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
