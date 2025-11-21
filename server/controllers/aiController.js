const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.consultAI = async (req, res) => {
  const { question } = req.body;

  console.log("--- CONSULTANDO IA ---");

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ msg: "Falta configurar API Key de Gemini" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // INTENTO 1: Usamos el nombre técnico exacto de la versión estable
    // A veces "gemini-1.5-flash" (el alias) falla, pero "gemini-1.5-flash-001" funciona.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

    const prompt = `Actúa como un abogado experto en código laboral chileno. Responde en máximo 3 párrafos, claro y conciso a lo siguiente: ${question}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("¡Éxito! Respuesta recibida.");
    res.json({ answer: text });
    
  } catch (error) {
    console.error("--- FALLÓ EL MODELO ---");
    console.error("Error específico:", error.message);

    // PLAN B DE EMERGENCIA: Si falla, intentamos usar 'gemini-pro' (la versión clásica)
    try {
        console.log("Intentando con Plan B (gemini-pro)...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const modelB = genAI.getGenerativeModel({ model: "gemini-pro" });
        const resultB = await modelB.generateContent(question);
        const responseB = await resultB.response;
        
        console.log("¡Plan B funcionó!");
        return res.json({ answer: responseB.text() });
    } catch (errorB) {
        console.error("Plan B también falló.");
        // Devolvemos el error al frontend para que sepas qué pasó
        res.status(500).json({ 
            msg: "Error conectando con IA. Verifica tu API Key o región.", 
            details: error.message 
        });
    }
  }
};