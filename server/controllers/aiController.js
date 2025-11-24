const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const pdf = require('pdf-parse');

// 1. Función para el Chat Legal
exports.consultAI = async (req, res) => {
  const { question } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ msg: "Falta configurar GEMINI_API_KEY" });
  }

  try {
    // Configuración del modelo
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Actúa como un abogado experto en el código laboral chileno. Responde de forma clara, concisa y útil para un trabajador a la siguiente pregunta: ${question}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ answer: text });

  } catch (error) {
    console.error("Error Gemini Chat:", error);
    res.status(500).json({ msg: "Error conectando con IA", details: error.message });
  }
};

// 2. Función para Analizar Contratos (PDF)
exports.analyzeContract = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No se subió ningún archivo PDF" });
    }

    console.log("--- ANALIZANDO CON GEMINI ---");

    // A. Leemos el PDF y extraemos el texto
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdf(dataBuffer);
    const contractText = pdfData.text;

    // Validación básica
    if (!contractText || contractText.length < 50) {
      return res.status(400).json({ msg: "No se pudo leer texto del PDF. Verifica que no sea una imagen escaneada." });
    }

    // B. Configuramos Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // C. Preparamos el Prompt (Gemini soporta mucho texto, así que enviamos todo)
    const prompt = `
      Actúa como un abogado laboral experto y protector de los derechos del trabajador.
      Analiza el siguiente texto extraído de un contrato de trabajo y genera un reporte con estos 3 puntos:

      1. 📄 **Resumen de Condiciones:** (Cargo, Sueldo, Horario, Plazo).
      2. ✅ **Beneficios y Derechos:** Qué gana el trabajador.
      3. ⚠️ **Cláusulas de Cuidado:** Prohibiciones, multas o términos complejos explicados fácil.

      --- TEXTO DEL CONTRATO ---
      ${contractText}
    `;

    // D. Generamos la respuesta
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    // E. Limpieza
    fs.unlinkSync(req.file.path); // Borramos el archivo temporal

    res.json({ analysis });

  } catch (error) {
    console.error("Error Gemini PDF:", error);
    res.status(500).json({ msg: "Error al procesar el documento", error: error.message });
  }
};