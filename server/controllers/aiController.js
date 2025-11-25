const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const pdf = require('pdf-parse');




// ---- FUNCIÓN MAESTRA CON MODELOS VÁLIDOS ---- //
async function generateWithFallback(prompt, questionForChat = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("❌ Falta GEMINI_API_KEY en el archivo .env");

  const genAI = new GoogleGenerativeAI(apiKey);

  // Modelos válidos en 2025
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

      // Nueva forma correcta de usar generateContent()
      const result = await model.generateContent(content);
      const text = result.response.text();

      console.log(`✅ Éxito usando ${modelName}`);
      return text;

    } catch (err) {
      console.warn(`❌ Falló ${modelName}: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(`Todos los modelos fallaron. Último error: ${lastError.message}`);
}



// ---- CONTROLADOR CHAT ---- //
exports.consultAI = async (req, res) => {
  const { question } = req.body;

  try {
    const answer = await generateWithFallback(null, question);
    res.json({ answer });

  } catch (error) {
    console.error("🚨 Error fatal consultAI:", error);
    res.status(500).json({ msg: "Error al comunicarse con la IA", details: error.message });
  }
};



// ---- CONTROLADOR ANÁLISIS PDF ---- //
exports.analyzeContract = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "❗ Debes subir un archivo PDF" });

    console.log("📄 Procesando archivo PDF...");

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdf(dataBuffer);
    const contractText = pdfData.text.substring(0, 25000);

    if (contractText.length < 50) throw new Error("El PDF parece vacío o ilegible.");

    const prompt = `
    Analiza objetivamente el siguiente contrato laboral chileno y genera un resumen claro:

    **Incluye:**
    1. Tipo de contrato y duración.
    2. Sueldo y forma de pago.
    3. Jornada laboral y horas extraordinarias.
    4. Beneficios explícitos.
    5. Cláusulas relevantes o riesgos para el trabajador.
    6. Obligaciones del empleado y empleador.

    ---- TEXTO DEL CONTRATO ----
    ${contractText}
    `;

    const analysis = await generateWithFallback(prompt);

    // Limpia el archivo después del análisis
    fs.unlinkSync(req.file.path);

    res.json({ analysis });

  } catch (error) {
    console.error("🚨 Error fatal analyzeContract:", error);

    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    res.status(500).json({
      msg: "Error al analizar el documento",
      details: error.message,
    });
  }
};
