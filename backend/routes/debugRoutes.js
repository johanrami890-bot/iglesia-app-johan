const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/tables', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        );
        res.json({
            tables: result.rows.map(r => r.table_name),
            db_name: process.env.DB_NAME,
            db_user: process.env.DB_USER,
            db_host: process.env.DB_HOST
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/check-asignaciones', async (req, res) => {
    try {
        const result = await pool.query('SELECT count(*) FROM asignaciones');
        res.json({ count: result.rows[0].count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
