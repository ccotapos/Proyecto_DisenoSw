const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

// Inicializar App
const app = express();

// 1. Conectar a Base de Datos
connectDB();

// 2. Middlewares (Configuración CRÍTICA)
app.use(cors());

// ¡IMPORTANTE! Estas líneas deben ir ANTES de las rutas.
// Aquí aumentamos el límite a 50MB para que quepan las fotos en Base64.
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. Definir Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/labor', require('./routes/laborRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/contracts', require('./routes/contractRoutes'));

// 4. Iniciar Servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));