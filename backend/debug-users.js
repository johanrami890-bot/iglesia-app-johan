require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function debugUsers() {
    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    try {
        console.log('--- USUARIOS EN BASE DE DATOS ---');
        const resUsers = await pool.query("SELECT id, nombre, correo, rol, estado, password FROM usuarios");

        for (const user of resUsers.rows) {
            console.log(`ID: ${user.id} | ${user.nombre} (${user.rol}) - ${user.correo} [${user.estado}]`);
            console.log(`Hash: ${user.password.substring(0, 10)}...`);

            // Intentar comparar con 'admin123'
            const isMatch = await bcrypt.compare('admin123', user.password);
            console.log(`¿Es 'admin123'? ${isMatch ? 'SÍ ✅' : 'NO ❌'}`);
            console.log('---');
        }

        // Opcional: Resetear contraseña de un usuario específico si se pasa argumento
        // Node args: node debug-users.js <email> <newpassword>
        const args = process.argv.slice(2);
        if (args.length === 2) {
            const targetEmail = args[0];
            const newPass = args[1];
            console.log(`\n>>> RESETEANDO PASSWORD DE ${targetEmail} a '${newPass}' <<<`);

            const newHash = await bcrypt.hash(newPass, 10);
            const resUpdate = await pool.query(
                "UPDATE usuarios SET password = $1 WHERE correo = $2 RETURNING *",
                [newHash, targetEmail]
            );

            if (resUpdate.rows.length > 0) {
                console.log(`✅ Contraseña actualizada para ${targetEmail}`);
            } else {
                console.log(`❌ No se encontró usuario con correo ${targetEmail}`);
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

debugUsers();
