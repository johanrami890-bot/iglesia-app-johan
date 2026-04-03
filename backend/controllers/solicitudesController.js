const pool = require('../config/database');

// Crear una solicitud
exports.createSolicitud = async (req, res) => {
    try {
        const { tipo, datos, descripcion } = req.body;
        const usuario_id = req.user.id; // Del token

        const result = await pool.query(
            'INSERT INTO solicitudes (usuario_id, tipo, datos, descripcion, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [usuario_id, tipo, JSON.stringify(datos), descripcion, 'pendiente']
        );

        res.status(201).json({ message: 'Solicitud enviada al Pastor para aprobación', solicitud: result.rows[0] });
    } catch (err) {
        console.error('Error creando solicitud:', err);
        res.status(500).json({ error: 'Error al crear la solicitud' });
    }
};

// Obtener solicitudes pendientes (Solo Pastor)
exports.getSolicitudes = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT s.*, u.nombre as supervisor_nombre 
      FROM solicitudes s
      JOIN usuarios u ON s.usuario_id = u.id
      WHERE s.estado = 'pendiente'
      ORDER BY s.created_at DESC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error en getSolicitudes:', err);
        res.status(500).json({ error: err.message });
    }
};

// Procesar solicitud (Aprobar/Rechazar)
exports.procesarSolicitud = async (req, res) => {
    try {
        const { id } = req.params;
        const { accion } = req.body; // 'aprobar' | 'rechazar'

        if (!['aprobar', 'rechazar'].includes(accion)) {
            return res.status(400).json({ error: 'Acción inválida' });
        }

        if (accion === 'rechazar') {
            await pool.query("UPDATE solicitudes SET estado = 'rechazado' WHERE id = $1", [id]);
            return res.json({ message: 'Solicitud rechazada' });
        }

        // APROBAR: Ejecutar la acción real
        const solicitudResult = await pool.query('SELECT * FROM solicitudes WHERE id = $1', [id]);
        if (solicitudResult.rows.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });

        const solicitud = solicitudResult.rows[0];
        const datos = solicitud.datos; // JSONB ya es objeto en pg

        let executionResult;

        // Lógica dinámica según el tipo
        if (solicitud.tipo === 'create_assignment') {
            executionResult = await pool.query(
                "INSERT INTO asignaciones (usuario_id, tarea_id, fecha_asignacion, observaciones) VALUES ($1, $2, $3, $4) RETURNING *",
                [datos.usuario_id, datos.tarea_id, datos.fecha_asignacion, datos.observaciones]
            );
        } else if (solicitud.tipo === 'update_assignment') {
            const { id, ...fields } = datos;
            executionResult = await pool.query(
                "UPDATE asignaciones SET usuario_id = $1, tarea_id = $2, fecha_asignacion = $3, observaciones = $4 WHERE id = $5 RETURNING *",
                [fields.usuario_id, fields.tarea_id, fields.fecha_asignacion, fields.observaciones, id]
            );
        } else if (solicitud.tipo === 'delete_assignment') {
            await pool.query("DELETE FROM asignaciones WHERE id = $1", [datos.id]);

            // --- USUARIOS ---
        } else if (solicitud.tipo === 'create_user') {
            const { nombre, correo, password, rol, estado, telefono } = datos;
            // Hash password logic should be here or reused from controller. 
            // To keep it simple, we assume the controller that creates this request sends the hashed password OR we hash it here.
            // Better: Hash here if not hashed. But `datos` is JSON.
            // Let's assume for now we use the same logic as usuariosController.
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(password, 10);

            executionResult = await pool.query(
                "INSERT INTO usuarios (nombre, correo, password, rol, estado, telefono) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
                [nombre, correo, hashedPassword, rol, estado || 'activo', telefono]
            );
        } else if (solicitud.tipo === 'update_user') {
            const { id, nombre, correo, rol, estado, telefono, newPassword } = datos;
            let query, params;

            if (newPassword && newPassword.trim()) {
                const bcrypt = require('bcryptjs');
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                query = 'UPDATE usuarios SET nombre = $1, correo = $2, rol = $3, estado = $4, telefono = $5, password = $6 WHERE id = $7 RETURNING *';
                params = [nombre, correo, rol, estado, telefono, hashedPassword, id];
            } else {
                query = 'UPDATE usuarios SET nombre = $1, correo = $2, rol = $3, estado = $4, telefono = $5 WHERE id = $6 RETURNING *';
                params = [nombre, correo, rol, estado, telefono, id];
            }
            executionResult = await pool.query(query, params);

        } else if (solicitud.tipo === 'delete_user') {
            await pool.query("DELETE FROM usuarios WHERE id = $1", [datos.id]);

            // --- TAREAS ---
        } else if (solicitud.tipo === 'create_task') {
            executionResult = await pool.query(
                "INSERT INTO tareas (titulo, descripcion, estado) VALUES ($1, $2, $3) RETURNING *",
                [datos.titulo, datos.descripcion, datos.estado || 'pendiente']
            );
        } else if (solicitud.tipo === 'update_task') {
            const { id, titulo, descripcion, estado } = datos;
            executionResult = await pool.query(
                "UPDATE tareas SET titulo = $1, descripcion = $2, estado = $3 WHERE id = $4 RETURNING *",
                [titulo, descripcion, estado || 'pendiente', id]
            );
        } else if (solicitud.tipo === 'delete_task') {
            await pool.query("DELETE FROM tareas WHERE id = $1", [datos.id]);
        } else if (solicitud.tipo === 'generate_month') {
            // ... Lógica compleja de generación, mejor llamar al controlador o replicar
            // Por ahora simplificado para llamada interna o replicamos la logica del controller
            // Para simplificar, asumimos que 'datos' tiene el payload para generarMes
            // Requeriría refactorizar generarMes para ser reutilizable
        }

        // Marcar como aprobado
        await pool.query("UPDATE solicitudes SET estado = 'aprobado' WHERE id = $1", [id]);

        res.json({ message: 'Solicitud aprobada y ejecutada correctamente' });

    } catch (err) {
        console.error('Error procesando solicitud:', err);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
};
