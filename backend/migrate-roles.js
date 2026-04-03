const pool = require('./config/database');

async function migrateRoles() {
    try {
        console.log('Migrando roles en PostgreSQL...');

        const resA = await pool.query("UPDATE usuarios SET rol = 'pastor' WHERE rol = 'admin' OR rol = 'pastor'");
        console.log(`Filas actualizadas a 'pastor': ${resA.rowCount}`);

        const resB = await pool.query("UPDATE usuarios SET rol = 'servidor' WHERE rol = 'usuario' OR rol = 'servidor' OR rol = 'supervisor'");
        console.log(`Filas actualizadas a 'servidor': ${resB.rowCount}`);

        console.log('Migración completada.');
        process.exit(0);
    } catch (err) {
        console.error('Error en migración:', err);
        process.exit(1);
    }
}

migrateRoles();
