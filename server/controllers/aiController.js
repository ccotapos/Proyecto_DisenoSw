const OpenAI = require("openai");

// Configuración inicial
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.consultAI = async (req, res) => {
  const { question } = req.body;

  console.log("--- CONSULTANDO OPENAI (ChatGPT) ---");

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ msg: "Falta configurar OPENAI_API_KEY" });
  }

  try {
    // Hacemos la petición al modelo GPT-3.5 Turbo (rápido y económico)
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "Eres un abogado experto en el código laboral chileno. Responde de forma clara, concisa y útil para un trabajador." },
        { role: "user", content: question }
      ],
      model: "gpt-3.5-turbo",
    });

    // Extraemos la respuesta
    const text = completion.choices[0].message.content;

    console.log("¡Respuesta de OpenAI recibida!");
    res.json({ answer: text });

  } catch (error) {
    console.error("--- ERROR OPENAI ---");
    // Manejo de errores comunes (como falta de crédito)
    if (error.response) {
        console.error(error.response.status);
        console.error(error.response.data);
    } else {
        console.error(error.message);
    }
    
    res.status(500).json({ 
      msg: "Error conectando con OpenAI", 
      details: "Verifica que tu API Key tenga créditos/saldo disponible." 
    });
  }
};