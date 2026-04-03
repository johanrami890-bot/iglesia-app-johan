require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function fixPastorLogin() {
    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    try {
        console.log('Buscando usuario Pastor...');
        const resPastor = await pool.query("SELECT * FROM usuarios WHERE rol = 'pastor' LIMIT 1");

        if (resPastor.rows.length === 0) {
            console.error('❌ No se encontró ningún usuario con rol Pastor.');
            // Buscar supervisor
            const resSup = await pool.query("SELECT * FROM usuarios WHERE rol = 'supervisor' LIMIT 1");
            if (resSup.rows.length > 0) {
                console.log(`Encontrado Supervisor: ${resSup.rows[0].correo}`);
                await resetPassword(pool, resSup.rows[0].correo, 'admin123');
            }
        } else {
            const pastor = resPastor.rows[0];
            console.log(`✅ Pastor encontrado: ${pastor.correo}`);
            await resetPassword(pool, pastor.correo, 'admin123');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

async function resetPassword(pool, email, newPass) {
    console.log(`Resetear password de ${email} a '${newPass}'...`);
    const hash = await bcrypt.hash(newPass, 10);
    await pool.query("UPDATE usuarios SET password = $1 WHERE correo = $2", [hash, email]);
    console.log('✅ Contraseña restablecida correctamente.');
}

fixPastorLogin();
