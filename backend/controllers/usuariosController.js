const pool = require('../config/database');

// Obtener todos los usuarios
exports.getAllUsuarios = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, correo, telefono, rol, estado, created_at FROM usuarios ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener usuario por ID
exports.getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, nombre, correo, telefono, rol, estado FROM usuarios WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear usuario
exports.createUsuario = async (req, res) => {
  try {
    const { nombre, correo, telefono, rol, password } = req.body;

    // Validaciones
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    if (!correo || !correo.trim()) {
      return res.status(400).json({ error: 'El email es requerido' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, correo, telefono, rol, password, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre, correo, telefono, rol',
      [nombre.trim(), correo.trim().toLowerCase(), telefono || null, rol || 'servidor', hashedPassword, 'activo']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    console.error('Error crear usuario:', err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// Actualizar usuario
exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, telefono, rol, estado, newPassword } = req.body;

    // Si hay nueva contraseña, actualizar con contraseña
    if (newPassword && newPassword.trim()) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const result = await pool.query(
        'UPDATE usuarios SET nombre = $1, correo = $2, telefono = $3, rol = $4, estado = $5, password = $6 WHERE id = $7 RETURNING *',
        [nombre, correo, telefono, rol, estado, hashedPassword, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      return res.json(result.rows[0]);
    }

    // Sin cambio de contraseña
    const result = await pool.query(
      'UPDATE usuarios SET nombre = $1, correo = $2, telefono = $3, rol = $4, estado = $5 WHERE id = $6 RETURNING *',
      [nombre, correo, telefono, rol, estado, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error en updateUsuario:', err);
    res.status(500).json({ error: err.message });
  }
};

// Eliminar usuario
exports.deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    const bcrypt = require('bcryptjs');

    // Obtener usuario actual
    const userResult = await pool.query('SELECT password FROM usuarios WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, userResult.rows[0].password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Hash nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    const updateResult = await pool.query(
      'UPDATE usuarios SET password = $1 WHERE id = $2 RETURNING id',
      [hashedPassword, id]
    );

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};