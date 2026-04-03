require('dotenv').config();
const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function backupDB() {
    try {
        console.log('🔄 Generando backup de datos...');

        let sqlContent = `-- BACKUP IGLESIA APP ${new Date().toISOString()}\n\n`;

        // 1. Usuarios
        const usuarios = await pool.query('SELECT * FROM usuarios ORDER BY id');
        sqlContent += `-- USUARIOS (${usuarios.rows.length})\n`;
        for (const u of usuarios.rows) {
            const vals = [
                u.id,
                `'${u.nombre}'`,
                `'${u.correo}'`,
                `'${u.password}'`,
                u.telefono ? `'${u.telefono}'` : 'NULL',
                `'${u.rol}'`,
                u.foto_perfil ? `'${u.foto_perfil}'` : 'NULL',
                `'${u.estado}'`
            ];
            sqlContent += `INSERT INTO usuarios (id, nombre, correo, password, telefono, rol, foto_perfil, estado) VALUES (${vals.join(', ')}) ON CONFLICT (correo) DO NOTHING;\n`;
        }
        sqlContent += `SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));\n\n`;

        // 2. Tareas
        const tareas = await pool.query('SELECT * FROM tareas ORDER BY id');
        sqlContent += `-- TAREAS (${tareas.rows.length})\n`;
        for (const t of tareas.rows) {
            // Escape special chars in strings
            const titulo = t.titulo.replace(/'/g, "''");
            const desc = t.descripcion ? t.descripcion.replace(/'/g, "''") : '';

            const vals = [
                t.id,
                `'${titulo}'`,
                desc ? `'${desc}'` : 'NULL',
                `'${t.estado}'`,
                t.usuario_id || 'NULL',
                t.prioridad ? `'${t.prioridad}'` : "'media'"
            ];
            // Note: Ajustado al schema real que vimos antes (sin cupo_maximo)
            sqlContent += `INSERT INTO tareas (id, titulo, descripcion, estado, usuario_id, prioridad) VALUES (${vals.join(', ')}) ON CONFLICT (id) DO NOTHING;\n`;
        }
        sqlContent += `SELECT setval('tareas_id_seq', (SELECT MAX(id) FROM tareas));\n\n`;

        // 3. Asignaciones
        const asignaciones = await pool.query('SELECT * FROM asignaciones ORDER BY id');
        sqlContent += `-- ASIGNACIONES (${asignaciones.rows.length})\n`;
        for (const a of asignaciones.rows) {
            const obs = a.observaciones ? a.observaciones.replace(/'/g, "''") : '';
            const fecha = new Date(a.fecha_asignacion).toISOString().split('T')[0];
            const vals = [
                a.id,
                a.usuario_id,
                a.tarea_id,
                `'${fecha}'`,
                obs ? `'${obs}'` : 'NULL'
            ];
            sqlContent += `INSERT INTO asignaciones (id, usuario_id, tarea_id, fecha_asignacion, observaciones) VALUES (${vals.join(', ')}) ON CONFLICT (id) DO NOTHING;\n`;
        }
        sqlContent += `SELECT setval('asignaciones_id_seq', (SELECT MAX(id) FROM asignaciones));\n\n`;

        // Write file
        const outputPath = path.join(__dirname, 'backup_data.sql');
        fs.writeFileSync(outputPath, sqlContent);

        console.log(`✅ Backup guardado en: ${outputPath}`);
        process.exit(0);

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

backupDB();
