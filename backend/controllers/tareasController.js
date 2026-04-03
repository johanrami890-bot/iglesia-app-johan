const pool = require('../config/database');

// Obtener todas las tareas
exports.getAllTareas = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tareas ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener tarea por ID
exports.getTareaById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tareas WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear tarea
exports.createTarea = async (req, res) => {
  try {
    const { titulo, descripcion } = req.body;

    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ error: 'El título es requerido' });
    }

    const result = await pool.query(
      'INSERT INTO tareas (titulo, descripcion) VALUES ($1, $2) RETURNING *',
      [titulo.trim(), descripcion || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error crear tarea:', err);
    res.status(500).json({ error: 'Error al crear tarea' });
  }
};

// Actualizar tarea
exports.updateTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion } = req.body;

    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ error: 'El título es requerido' });
    }

    const result = await pool.query(
      'UPDATE tareas SET titulo = $1, descripcion = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [titulo.trim(), descripcion || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error actualizar tarea:', err);
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
};

// Eliminar tarea
exports.deleteTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tareas WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json({ message: 'Tarea eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
