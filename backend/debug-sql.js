const pool = require('./config/database');

async function testQuery() {
    try {
        console.log('Testing SQL Query for Solicitudes...');
        const result = await pool.query(`
      SELECT s.*, u.nombre as supervisor_nombre 
      FROM solicitudes s
      JOIN usuarios u ON s.usuario_id = u.id
      WHERE s.estado = 'pendiente'
      ORDER BY s.created_at DESC
    `);
        console.log('Success! Count:', result.rowCount);
        console.log(result.rows);
    } catch (err) {
        console.error('SQL Error:', err);
    } finally {
        process.exit();
    }
}

testQuery();
