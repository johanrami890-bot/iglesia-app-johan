const pool = require('./config/database');
const jwt = require('jsonwebtoken');

async function checkPermissions() {
    try {
        console.log('--- Verificando Usuarios y Roles ---');
        const users = await pool.query('SELECT id, nombre, correo, rol, estado FROM usuarios');
        console.table(users.rows);

        console.log('\n--- Generando Token de Prueba para Pastor ---');
        const pastor = users.rows.find(u => u.rol === 'pastor');
        if (pastor) {
            const token = jwt.sign(
                { id: pastor.id, correo: pastor.correo, rol: pastor.rol },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            console.log('Token Pastor:', token);
        } else {
            console.log('❌ No se encontró usuario con rol "pastor"');
        }

        console.log('\n--- Verificando Tabla Solicitudes ---');
        try {
            const solicitudes = await pool.query('SELECT * FROM solicitudes LIMIT 5');
            console.log(`✓ Tabla solicitudes existe. ${solicitudes.rowCount} registros encontrados.`);
        } catch (err) {
            console.log('❌ Error al consultar tabla solicitudes:', err.message);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error general:', err);
        process.exit(1);
    }
}

checkPermissions();
