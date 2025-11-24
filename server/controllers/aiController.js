const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const pdf = require('pdf-parse');

// FUNCIÓN MAESTRA: Intenta con varios modelos hasta que uno funcione
async function generateWithFallback(prompt, questionForChat = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Falta GEMINI_API_KEY en .env");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Lista de modelos a probar en orden. Si el 1.5 falla, salta al pro.
  const modelsToTry = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];
  
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🔄 Intentando conectar con modelo: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const content = questionForChat 
        ? `Eres un abogado experto en código laboral chileno. Responde: ${questionForChat}` 
        : prompt;

      const result = await model.generateContent(content);
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ Éxito con ${modelName}`);
      return text; // Si funcionó, retornamos y terminamos el bucle
      
    } catch (error) {
      console.warn(`❌ Falló ${modelName}: ${error.message}`);
      lastError = error;
      // Continuamos al siguiente modelo...
    }
  }
  throw new Error(`Todos los modelos fallaron. Último error: ${lastError.message}`);
}

// 1. CONTROLADOR CHAT
exports.consultAI = async (req, res) => {
  const { question } = req.body;
  try {
    const answer = await generateWithFallback(null, question);
    res.json({ answer });
  } catch (error) {
    console.error("Error Fatal Chat:", error);
    res.status(500).json({ msg: "Error de IA", details: error.message });
  }
};

// 2. CONTROLADOR PDF
exports.analyzeContract = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "Falta PDF" });

    console.log("--- LEYENDO PDF ---");
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdf(dataBuffer);
    const contractText = pdfData.text.substring(0, 25000); // Límite seguro

    if (contractText.length < 50) throw new Error("PDF vacío o ilegible");

    const prompt = `
      Analiza este contrato laboral chileno y resume:
      1. Condiciones (Sueldo, Cargo, Horario).
      2. Beneficios explícitos.
      3. Prohibiciones o multas.
      --- TEXTO ---
      ${contractText}
    `;

    const analysis = await generateWithFallback(prompt);
    
    fs.unlinkSync(req.file.path);
    res.json({ analysis });

  } catch (error) {
    console.error("Error Fatal PDF:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ msg: "Error analizando documento", details: error.message });
  }
};