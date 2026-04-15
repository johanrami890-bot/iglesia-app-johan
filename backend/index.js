require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const tareasRoutes = require('./routes/tareasRoutes');
const asignacionesRoutes = require('./routes/asignacionesRoutes');
const solicitudesRoutes = require('./routes/solicitudesRoutes');
const debugRoutes = require('./routes/debugRoutes'); // DEBUG

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/tareas', tareasRoutes);
app.use('/api/asignaciones', asignacionesRoutes);
app.use('/api/solicitudes', solicitudesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});
// Rutas legales para registro de SMS A2P
app.get('/privacy-policy', (req, res) => {
    res.send(`
        <html>
        <body style="font-family: sans-serif; padding: 40px; line-height: 1.6;">
            <h1>Privacy Policy</h1>
            <p><strong>Mobile Information:</strong> No mobile information will be shared with third parties/affiliates for marketing/promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.</p>
        </body>
        </html>
    `);
});

app.get('/terms-and-conditions', (req, res) => {
    res.send(`
        <html>
        <body style="font-family: sans-serif; padding: 40px; line-height: 1.6;">
            <h1>Terms and Conditions</h1>
            <p><strong>Program Description:</strong> This service sends community notifications, event reminders, and secure authentication codes.</p>
            <p><strong>Opt-Out:</strong> You can cancel the SMS service at any time. Just text "STOP" to our number.</p>
            <p><strong>Help:</strong> If you need assistance, text "HELP" to our number.</p>
            <p><strong>Rates:</strong> Message and data rates may apply. Message frequency varies.</p>
        </body>
        </html>
    `);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
