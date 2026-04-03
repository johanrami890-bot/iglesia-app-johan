const pool = require('../config/database');
const { processReminders } = require('../services/reminderService');
const nodemailer = require('nodemailer');

// Obtener todas las asignaciones
exports.getAllAsignaciones = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM asignaciones ORDER BY fecha_asignacion DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener asignación por ID
exports.getAsignacionById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM asignaciones WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear asignación
exports.createAsignacion = async (req, res) => {
  try {
    const { usuario_id, tarea_id, fecha_asignacion, observaciones } = req.body;

    // Validar que usuario y tarea existan
    const usuarioCheck = await pool.query('SELECT id FROM usuarios WHERE id = $1', [usuario_id]);
    if (usuarioCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const tareaCheck = await pool.query('SELECT id FROM tareas WHERE id = $1', [tarea_id]);
    if (tareaCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Tarea no encontrada' });
    }

    const result = await pool.query(
      'INSERT INTO asignaciones (usuario_id, tarea_id, fecha_asignacion, observaciones) VALUES ($1, $2, $3, $4) RETURNING *',
      [usuario_id, tarea_id, fecha_asignacion, observaciones || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar asignación
// Actualizar asignación
exports.updateAsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id, tarea_id, fecha_asignacion, observaciones } = req.body;

    console.log(`[DEBUG] Update Asig ID: ${id} -> User: ${usuario_id}, Tarea: ${tarea_id}, Fecha: ${fecha_asignacion}`);

    // Verificar si existe antes de update (opcional, pero ayuda a debug)
    const check = await pool.query('SELECT id FROM public.asignaciones WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada (Pre-Check)' });
    }

    const result = await pool.query(
      'UPDATE public.asignaciones SET usuario_id = $1, tarea_id = $2, fecha_asignacion = $3, observaciones = $4 WHERE id = $5 RETURNING *',
      [usuario_id, tarea_id, fecha_asignacion, observaciones || '', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error en updateAsignacion:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

// Eliminar asignación
exports.deleteAsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM asignaciones WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    res.json({ message: 'Asignación eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener asignaciones por usuario
exports.getAsignacionesByUsuario = async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const result = await pool.query(
      'SELECT a.*, t.titulo as tarea_titulo, u.nombre as usuario_nombre FROM asignaciones a JOIN tareas t ON a.tarea_id = t.id JOIN usuarios u ON a.usuario_id = u.id WHERE a.usuario_id = $1 ORDER BY a.fecha_asignacion DESC',
      [usuario_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener asignaciones por rango de fecha
exports.getAsignacionesByFecha = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const result = await pool.query(
      'SELECT a.*, t.titulo as tarea_titulo, u.nombre as usuario_nombre FROM public.asignaciones a JOIN tareas t ON a.tarea_id = t.id JOIN usuarios u ON a.usuario_id = u.id WHERE a.fecha_asignacion BETWEEN $1 AND $2 ORDER BY a.fecha_asignacion',
      [fecha_inicio, fecha_fin]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Eliminar asignaciones por rango (Para limpiar mes)
exports.deleteAsignacionesByRange = async (req, res) => {
  try {
    const { start, end } = req.body; // { start: 'YYYY-MM-01', end: 'YYYY-MM-31' }
    if (!start || !end) {
      return res.status(400).json({ error: 'Rango invalido' });
    }

    const result = await pool.query(
      "DELETE FROM public.asignaciones WHERE fecha_asignacion BETWEEN $1 AND $2 RETURNING id",
      [start, end]
    );

    res.json({ message: `Eliminadas ${result.rowCount} asignaciones`, count: result.rowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Generar asignaciones aleatorias para el mes
exports.generarMes = async (req, res) => {
  try {
    const { month, year, active_days, quotas } = req.body;

    // 1. Obtener usuarios activos (servidores Y supervisores)
    const usersResult = await pool.query("SELECT id, nombre FROM usuarios WHERE rol IN ('servidor', 'supervisor') AND estado = 'activo'");
    const tasksResult = await pool.query("SELECT id, titulo FROM tareas");

    const usuarios = usersResult.rows;
    const tareas = tasksResult.rows;

    if (usuarios.length === 0) return res.status(400).json({ error: 'No hay usuarios (servidores/supervisores) registrados para asignar' });
    if (tareas.length === 0) return res.status(400).json({ error: 'No hay tareas registradas para asignar' });

    // 2. Contador de asignaciones para balancear (Fairness)
    const assignmentCounts = {};
    usuarios.forEach(u => assignmentCounts[u.id] = 0);

    // 3. Tracking de quién descansó el día anterior (para rotación)
    let previousDayRested = [];

    const daysInMonth = new Date(year, month, 0).getDate();
    let totalCreated = 0;

    // 4. Iterar por cada día
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      const dayOfWeek = date.getDay(); // 0 (Dom) - 6 (Sab)

      // El frontend envía active_days como [0, 1, 2...]
      if (!active_days.includes(dayOfWeek)) continue;

      const fechaStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      // Calcular cuántas personas se necesitan este día
      let totalSlotsNeeded = 0;
      for (const tarea of tareas) {
        const quota = parseInt(quotas[tarea.id] || 1);
        totalSlotsNeeded += quota;
      }

      // Si hay más personas que tareas, implementar rotación
      const needsRotation = usuarios.length > totalSlotsNeeded;
      let currentDayRested = [];

      // Mezclar tareas para aleatoriedad
      const shuffledTareas = [...tareas].sort(() => Math.random() - 0.5);

      for (const tarea of shuffledTareas) {
        const quota = parseInt(quotas[tarea.id] || 1);

        // Ordenar usuarios: priorizar los que descansaron ayer, luego los que tienen menos asignaciones
        const sortedUsers = [...usuarios].sort((a, b) => {
          const aRestedYesterday = previousDayRested.includes(a.id) ? -1 : 0;
          const bRestedYesterday = previousDayRested.includes(b.id) ? -1 : 0;

          if (aRestedYesterday !== bRestedYesterday) {
            return aRestedYesterday - bRestedYesterday; // Los que descansaron ayer primero
          }

          return (assignmentCounts[a.id] - assignmentCounts[b.id]) || (Math.random() - 0.5);
        });

        let assignedInDay = 0;
        for (const user of sortedUsers) {
          if (assignedInDay >= quota) break;

          // Verificar si ya tiene tarea este día
          const check = await pool.query(
            'SELECT id FROM asignaciones WHERE usuario_id = $1 AND fecha_asignacion = $2',
            [user.id, fechaStr]
          );

          if (check.rows.length === 0) {
            await pool.query(
              'INSERT INTO asignaciones (usuario_id, tarea_id, fecha_asignacion) VALUES ($1, $2, $3)',
              [user.id, tarea.id, fechaStr]
            );
            assignmentCounts[user.id]++;
            assignedInDay++;
            totalCreated++;
          }
        }
      }

      // Si hay rotación, identificar quién descansa hoy
      if (needsRotation) {
        const assignedToday = await pool.query(
          'SELECT DISTINCT usuario_id FROM asignaciones WHERE fecha_asignacion = $1',
          [fechaStr]
        );
        const assignedIds = assignedToday.rows.map(r => r.usuario_id);
        currentDayRested = usuarios.filter(u => !assignedIds.includes(u.id)).map(u => u.id);
      }

      // Actualizar para el próximo día
      previousDayRested = currentDayRested;
    }

    res.json({ message: `Generación completada: ${totalCreated} asignaciones creadas`, count: totalCreated });
  } catch (err) {
    console.error('Error en generación aleatoria:', err);
    res.status(500).json({ error: err.message });
  }
};

// Enviar recordatorios manuales por correo
exports.enviarRecordatorios = async (req, res) => {
  try {
    const sentCount = await processReminders();
    if (sentCount === 0) {
      return res.json({ message: 'No hay asignaciones para mañana que notificar.' });
    }
    res.json({ message: `Recordatorios enviados con éxito: ${sentCount}` });
  } catch (err) {
    console.error('Error en recordatorios:', err);
    res.status(500).json({ error: 'Error al enviar recordatorios. Verifique credenciales EMAIL en .env' });
  }
};
