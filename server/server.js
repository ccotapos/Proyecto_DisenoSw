const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Conectar a Base de Datos
connectDB();

// Middlewares
app.use(cors()); // Permite que el frontend (puerto 5173) hable con el backend
app.use(express.json()); // Permite leer JSON en el body de las peticiones

// Definir Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/labor', require('./routes/laborRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/contracts', require('./routes/contractRoutes')); // <--- AGREGAR ESTA LÍNEA

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));