const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();

connectDB();

app.use(cors());

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/labor', require('./routes/laborRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/contracts', require('./routes/contractRoutes'));
app.use('/api/vacations', require('./routes/vacationRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));