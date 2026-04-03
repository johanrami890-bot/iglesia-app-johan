require('dotenv').config();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:5000/api';

async function testUpdate() {
    console.log('--- DIAGNÓSTICO ---');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_USER:', process.env.DB_USER);

    if (!process.env.DB_NAME) {
        console.error('❌ ERROR CRÍTICO: Variables de entorno no cargadas.');
        process.exit(1);
    }

    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    try {
        const resTables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tablas encontradas:', resTables.rows.map(r => r.table_name));

        if (!resTables.rows.find(r => r.table_name === 'asignaciones')) {
            console.error('❌ La tabla asignaciones NO existe en esta BD.');
            process.exit(1);
        }

        // ... resto del test ...
        console.log('1. Generando token...');
        const resPastor = await pool.query("SELECT * FROM usuarios WHERE rol = 'pastor' LIMIT 1");
        if (resPastor.rows.length === 0) throw new Error('No hay pastores');
        const pastor = resPastor.rows[0];
        const token = jwt.sign(
            { id: pastor.id, correo: pastor.correo, rol: pastor.rol },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('2. Obteniendo asignación...');
        const resAsign = await pool.query("SELECT * FROM asignaciones LIMIT 1");
        if (resAsign.rows.length === 0) throw new Error('No hay asignaciones para probar (crear una primero)');

        const asignId = resAsign.rows[0].id;
        console.log('ID a probar:', asignId);

        console.log('3. Fetch PUT...');
        const updatePayload = {
            usuario_id: resAsign.rows[0].usuario_id,
            tarea_id: resAsign.rows[0].tarea_id,
            fecha_asignacion: '2026-06-01',
            observaciones: 'Diagnóstico script'
        };

        const response = await fetch(`${API_URL}/asignaciones/${asignId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatePayload)
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Data:', data);

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

testUpdate();
