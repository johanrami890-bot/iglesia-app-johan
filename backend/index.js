require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const tareasRoutes = require('./routes/tareasRoutes');
const asignacionesRoutes = require('./routes/asignacionesRoutes');
const solicitudesRoutes = require('./routes/solicitudesRoutes');
const debugRoutes = require('./routes/debugRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',') 
      : ['http://localhost:5173', 'http://localhost:5174'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/tareas', tareasRoutes);
app.use('/api/asignaciones', asignacionesRoutes);
app.use('/api/solicitudes', solicitudesRoutes);

app.get('/privacy-policy', (req, res) => {
  res.send(`<html><body style="font-family: sans-serif; padding: 40px; line-height: 1.6;"><h1>Privacy Policy</h1><p>At Iglesia App, we value your privacy.</p></body></html>`);
});

app.get('/terms-and-conditions', (req, res) => {
  res.send(`<html><body style="font-family: sans-serif; padding: 40px; line-height: 1.6;"><h1>Terms and Conditions</h1><p>This service sends community notifications.</p></body></html>`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Servir frontend estático (AL FINAL)
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});