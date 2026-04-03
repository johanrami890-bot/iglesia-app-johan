const pool = require('../config/database');
const nodemailer = require('nodemailer');

async function processReminders() {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        console.log(`[ReminderService] Buscando asignaciones para: ${dateStr}`);

        const query = `
      SELECT a.id, a.fecha_asignacion, u.nombre, u.correo, t.titulo as tarea_nombre
      FROM asignaciones a
      JOIN usuarios u ON a.usuario_id = u.id
      JOIN tareas t ON a.tarea_id = t.id
      WHERE a.fecha_asignacion = $1
    `;

        const result = await pool.query(query, [dateStr]);

        if (result.rows.length === 0) {
            console.log('[ReminderService] No hay asignaciones para mañana.');
            return 0;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        let sentCount = 0;
        for (const row of result.rows) {
            const mailOptions = {
                from: `"Iglesia IPUL" <${process.env.EMAIL_USER}>`,
                to: row.correo,
                subject: 'Recordatorio de Servicio - Mañana',
                html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
            <div style="background: #0A2540; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Recordatorio de Servicio</h1>
            </div>
            <div style="padding: 20px;">
              <p>Hola <strong>${row.nombre}</strong>,</p>
              <p>Te enviamos este recordatorio porque tienes una asignación para el día de mañana:</p>
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #0A2540; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Tarea:</strong> ${row.tarea_nombre}</p>
                <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date(row.fecha_asignacion).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <p style="color: #666; font-style: italic; margin-top: 30px;">"Todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres." - Colosenses 3:23</p>
              <p style="margin-top: 20px; font-weight: bold;">¡Gracias por tu disposición para servir! Dios te bendiga.</p>
            </div>
            <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 10px 10px;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </div>
          </div>
        `,
            };

            try {
                await transporter.sendMail(mailOptions);
                sentCount++;
            } catch (err) {
                console.error(`[ReminderService] Error enviando a ${row.correo}:`, err.message);
            }
        }
        return sentCount;
    } catch (err) {
        console.error('[ReminderService] Error general:', err);
        throw err;
    }
}

module.exports = { processReminders };
