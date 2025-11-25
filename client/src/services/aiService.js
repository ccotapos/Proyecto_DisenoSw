import api from './api';

export const askLegalAssistant = async (question) => {
  try {
    const response = await api.post('/ai/consult', { question });
    return response.data.answer;
  } catch (error) {
    console.error("Error consultando IA:", error);
    return "Lo siento, no pude procesar tu consulta legal en este momento.";
  }
};