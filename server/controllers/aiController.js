const { GoogleGenerativeAI } = require("@google/generative-ai");
// Asegúrate de que la ruta al modelo sea correcta (mayúscula/minúscula)
const Chat = require('../models/chat'); 

// ---- FUNCIÓN MAESTRA (Con tus versiones 2.0) ---- //
async function generateWithFallback(prompt, questionForChat = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("❌ Falta GEMINI_API_KEY en el archivo .env");

  const genAI = new GoogleGenerativeAI(apiKey);

  // TUS MODELOS SOLICITADOS (No los he cambiado)
  const modelsToTry = [
    "gemini-2.0-flash",
    "gemini-2.0-pro",
    "gemini-1.5-pro-latest",
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🔄 Intentando modelo: ${modelName}`);

      const model = genAI.getGenerativeModel({ model: modelName });

      const content = questionForChat
        ? `Eres un abogado experto en Código Laboral Chileno. Responde de forma clara y legalmente correcta:\n\n${questionForChat}`
        : prompt;

      const result = await model.generateContent(content);
      const response = await result.response;
      const text = response.text();

      console.log(`✅ Éxito usando ${modelName}`);
      return text;

    } catch (err) {
      console.warn(`❌ Falló ${modelName}: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(`Todos los modelos fallaron. Último error: ${lastError.message}`);
}

// 1. OBTENER LISTA DE CHATS
exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id })
      .select('title updatedAt') 
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ msg: "Error cargando historial" });
  }
};

// 2. OBTENER UN CHAT ESPECÍFICO
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.id });
    if (!chat) return res.status(404).json({ msg: "Chat no encontrado" });
    res.json(chat);
  } catch (error) {
    res.status(500).json({ msg: "Error cargando conversación" });
  }
};

// 3. ENVIAR MENSAJE (CORREGIDO)
exports.sendMessage = async (req, res) => {
  const { question, chatId } = req.body; 

  try {
    // CORRECCIÓN: Llamamos a la función maestra en lugar de redefinir genAI aquí.
    // Esto asegura que se usen tus modelos 2.0 y el fallback.
    const aiAnswer = await generateWithFallback(null, question);

    let chat;

    if (chatId) {
      // Si ya existe el chat, agregamos los mensajes
      chat = await Chat.findOne({ _id: chatId, userId: req.user.id });
      if (chat) {
        chat.messages.push({ role: 'user', content: question });
        chat.messages.push({ role: 'ai', content: aiAnswer });
        chat.updatedAt = Date.now();
        await chat.save();
      }
    } else {
      // Si es nuevo, creamos el documento
      // Título automático: primeras 5 palabras
      const title = question.split(' ').slice(0, 5).join(' ') + "...";
      
      chat = new Chat({
        userId: req.user.id,
        title: title,
        messages: [
          { role: 'user', content: question },
          { role: 'ai', content: aiAnswer }
        ]
      });
      await chat.save();
    }

    res.json({ answer: aiAnswer, chatId: chat._id, title: chat.title });

  } catch (error) {
    console.error("Error IA:", error);
    res.status(500).json({ msg: "Error conectando con la IA", details: error.message });
  }
};

// 4. ELIMINAR CHAT
exports.deleteChat = async (req, res) => {
  try {
    await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ msg: "Chat eliminado" });
  } catch (error) {
    res.status(500).send("Error eliminando");
  }
};