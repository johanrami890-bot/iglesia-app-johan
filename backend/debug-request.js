require('dotenv').config();
const pool = require('./config/database');

async function checkRequest(id) {
    try {
        const res = await pool.query('SELECT * FROM solicitudes WHERE id = $1', [id]);
        if (res.rows.length === 0) { console.log('Not found'); return; }
        const s = res.rows[0];
        console.log('TYPE:', s.tipo);
        console.log('DATA:', JSON.stringify(s.datos, null, 2));
    } catch (e) { console.error(e); } finally { pool.end(); }
}

checkRequest(8);
