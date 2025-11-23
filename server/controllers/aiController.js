const fs = require('fs');
const pdf = require('pdf-parse');
const OpenAI = require("openai"); // O GoogleGenerativeAI si volviste a Gemini

// Configuración (Asegúrate de tener esto según tu IA actual)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ... tu función consultAI existente ...

// NUEVA FUNCIÓN: Analizar PDF
exports.analyzeContract = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No se subió ningún archivo PDF" });
    }

    console.log("--- ANALIZANDO CONTRATO PDF ---");

    // 1. Leemos el archivo PDF desde la carpeta uploads
    const dataBuffer = fs.readFileSync(req.file.path);
    
    // 2. Extraemos el texto usando pdf-parse
    const pdfData = await pdf(dataBuffer);
    const contractText = pdfData.text;

    // Validar que no esté vacío
    if (!contractText || contractText.length < 50) {
      return res.status(400).json({ msg: "No pude leer texto del PDF. Asegúrate de que no sea una imagen escaneada." });
    }

    // 3. Preparamos el Prompt para la IA
    // Truco: Cortamos el texto si es muy largo para no gastar todos los tokens
    const cleanText = contractText.substring(0, 15000); 

    const prompt = `
      Actúa como un abogado experto laboral. Analiza el siguiente texto extraído de un contrato de trabajo.
      
      Genera un reporte claro con estos 3 puntos:
      1. 📄 **Resumen de Términos:** Tipo de contrato, horarios y sueldo (si aparece).
      2. ✅ **Tus Derechos y Beneficios:** Qué ganas con este contrato.
      3. ⚠️ **Ojo con esto (Prohibiciones y Letra Chica):** Qué cosas están estrictamente prohibidas o cláusulas delicadas.

      Texto del contrato:
      "${cleanText}"
    `;

    // 4. Enviamos a la IA (OpenAI en este caso)
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "Eres un asistente legal útil y protector con el trabajador." },
        { role: "user", content: prompt }
      ],
      model: "gpt-3.5-turbo", // O "gpt-4" si tienes acceso, es mejor para lecturas largas
    });

    const analysis = completion.choices[0].message.content;

    // 5. Borramos el archivo temporal para no llenar el servidor
    fs.unlinkSync(req.file.path);

    console.log("¡Análisis completado!");
    res.json({ analysis });

  } catch (error) {
    console.error("Error analizando contrato:", error);
    res.status(500).json({ msg: "Error al procesar el documento", error: error.message });
  }
};