import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const AiAssistant = () => {
  const { t } = useTranslation(); 
  const [chatList, setChatList] = useState([]); 
  const [currentChatId, setCurrentChatId] = useState(null); 
  const [messages, setMessages] = useState([]); 
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const res = await api.get('/ai/history');
      setChatList(res.data);
    } catch (error) {
      console.error("Error cargando historial");
    }
  };

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

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const newMsgUser = { role: 'user', content: question };
    setMessages(prev => [...prev, newMsgUser]);
    const inputQuestion = question;
    setQuestion('');
    setLoading(true);

    try {
      const res = await api.post('/ai/send', { 
        question: inputQuestion, 
        chatId: currentChatId 
      });

      const newMsgAi = { role: 'ai', content: res.data.answer };
      setMessages(prev => [...prev, newMsgAi]);

      if (!currentChatId) {
        setCurrentChatId(res.data.chatId);
        loadHistory(); // Recargar lista lateral para ver el nuevo título
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: t('ai.chat.error') }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (e, id) => {
    e.stopPropagation(); 
    if (!window.confirm("Delete?")) return; 
    try {
      await api.delete(`/ai/history/${id}`);
      setChatList(prev => prev.filter(c => c._id !== id));
      if (currentChatId === id) startNewChat();
    } catch (error) { console.error("Error borrando"); }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 h-[85vh] flex flex-col">
      
      {/* Título Principal Traducido */}
      <h1 className="text-3xl font-extrabold text-brand-primary mb-2 text-center">
        {t('ai.title')}
      </h1>
      <p className="text-center text-gray-500 mb-6">
        {t('ai.subtitle')}
      </p>

      <div className="flex-1 flex overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-200">
        
        {/* --- SIDEBAR (HISTORIAL) --- */}
        <div className="bg-gray-50 border-r border-gray-200 flex flex-col w-64 hidden md:flex">
          {/* Botón Nuevo Chat */}
          <div className="p-4">
            <button 
              onClick={startNewChat}
              className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold shadow hover:bg-brand-dark transition flex items-center justify-center gap-2"
            >
              {/* Traducción Botón */}
              <span>+</span> {t('ai.sidebar.new_chat')}
            </button>
          </div>

          {/* Lista Scrollable */}
          <div className="flex-1 overflow-y-auto px-2 space-y-2 custom-scrollbar">
            {chatList.length === 0 && (
              // Traducción "Sin Historial"
              <p className="text-center text-xs text-gray-400 mt-4">{t('ai.sidebar.no_history')}</p>
            )}
            
            {chatList.map(chat => (
              <div 
                key={chat._id}
                onClick={() => selectChat(chat._id)}
                className={`p-3 rounded-lg cursor-pointer text-sm flex justify-between items-center group transition ${
                  currentChatId === chat._id ? 'bg-white shadow border-l-4 border-brand-secondary' : 'hover:bg-gray-200 text-gray-600'
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
          
          {/* Header Móvil */}
          <div className="md:hidden p-2 border-b flex justify-between">
             <button onClick={startNewChat} className="text-xs bg-gray-200 px-2 py-1 rounded">{t('ai.sidebar.new_chat')}</button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                <span className="text-6xl mb-4"></span>
                {/* Traducción Estado Vacío */}
                <p className="text-lg font-medium">{t('ai.chat.empty_state')}</p>
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
                {/* Traducción Cargando */}
                <div className="bg-gray-100 px-4 py-2 rounded-full text-xs animate-pulse text-gray-500">
                  {t('ai.chat.loading')}
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
                // Traducción Placeholder
                placeholder={t('ai.chat.placeholder')}
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
            {/* Traducción Disclaimer */}
            <p className="text-center text-[10px] text-gray-400 mt-2">
              {t('ai.chat.disclaimer')}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AiAssistant;