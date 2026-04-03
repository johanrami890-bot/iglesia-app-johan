const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const pool = require('./config/database');

async function migrate() {
    try {
        console.log('🔄 Iniciando migración de base de datos...');

        // 1. Agregar columna telefono a usuarios
        try {
            await pool.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(20)');
            console.log('✓ Columna telefono agregada a usuarios');
        } catch (err) {
            console.error('Error al agregar telefono:', err.message);
        }

        // 2. Agregar columnas a tareas
        const tareasColumns = [
            { name: 'estado', type: "VARCHAR(50) NOT NULL DEFAULT 'pendiente'" },
            { name: 'fecha_vencimiento', type: 'DATE' },
            { name: 'prioridad', type: "VARCHAR(50) DEFAULT 'media'" }
        ];

        for (const col of tareasColumns) {
            try {
                await pool.query(`ALTER TABLE tareas ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
                console.log(`✓ Columna ${col.name} agregada a tareas`);
            } catch (err) {
                console.error(`Error al agregar ${col.name} a tareas:`, err.message);
            }
        }

        console.log('\n✅ Migración completada correctamente');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error general en migración:', err.message);
        process.exit(1);
    }
}

migrate();
