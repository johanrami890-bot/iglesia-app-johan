require('dotenv').config();
const { Pool } = require('pg');

async function checkTriggers() {
    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    try {
        console.log('--- TRIGGERS EN ASIGNACIONES ---');
        const res = await pool.query(`
            SELECT trigger_name, action_statement 
            FROM information_schema.triggers 
            WHERE event_object_table = 'asignaciones'
        `);

        if (res.rows.length === 0) {
            console.log('No hay triggers en asignaciones.');
        } else {
            console.log('Triggers encontrados:', res.rows);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkTriggers();
