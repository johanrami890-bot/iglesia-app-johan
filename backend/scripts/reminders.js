require('dotenv').config();
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

const transporter = nodemailer.createTransport({
    service: 'gmail', // Cambiar según el proveedor
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendReminders() {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        console.log(`Buscando asignaciones para: ${dateStr}`);

        const query = `
      SELECT a.fecha_asignacion, u.nombre, u.correo, t.titulo as tarea_nombre
      FROM asignaciones a
      JOIN usuarios u ON a.usuario_id = u.id
      JOIN tareas t ON a.tarea_id = t.id
      WHERE a.fecha_asignacion = $1
    `;

        const result = await pool.query(query, [dateStr]);

        if (result.rows.length === 0) {
            console.log('No hay asignaciones para mañana.');
            process.exit(0);
        }

        for (const row of result.rows) {
            const mailOptions = {
                from: `"Iglesia IPUL" <${process.env.EMAIL_USER}>`,
                to: row.correo,
                subject: 'Recordatorio de Servicio -Mañana-',
                text: `Hola ${row.nombre}, te recordamos que mañana (${row.fecha_asignacion.toLocaleDateString()}) tienes asignada la tarea: ${row.tarea_nombre}. ¡Dios te bendiga!`,
                html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #0A2540;">Recordatorio de Servicio</h2>
            <p>Hola <strong>${row.nombre}</strong>,</p>
            <p>Te enviamos este recordatorio porque tienes una asignación para el día de mañana:</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
              <p><strong>Tarea:</strong> ${row.tarea_nombre}</p>
              <p><strong>Fecha:</strong> ${row.fecha_asignacion.toLocaleDateString()}</p>
            </div>
            <p style="margin-top: 20px;">¡Gracias por tu disposición para servir! Dios te bendiga.</p>
          </div>
        `,
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`✓ Correo enviado a: ${row.correo}`);
            } catch (err) {
                console.error(`✗ Error enviando a ${row.correo}:`, err.message);
            }
        }

        console.log('Finalizado.');
        process.exit(0);
    } catch (err) {
        console.error('Error general:', err);
        process.exit(1);
    }
}

sendReminders();
