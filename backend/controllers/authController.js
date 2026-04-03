const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Login
exports.login = async (req, res) => {
  try {
    // Aceptar tanto 'email' como 'correo'
    const email = req.body.email || req.body.correo;
    const password = req.body.password;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    if (email.trim().length === 0) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Contraseña inválida' });
    }

    const result = await pool.query(
      'SELECT * FROM usuarios WHERE LOWER(correo) = LOWER($1) AND estado = $2',
      [email.trim(), 'activo']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.correo, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.correo,
        rol: user.rol,
        foto_perfil: user.foto_perfil
      }
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en servidor' });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { nombre, correo, password, rol } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ error: 'Campos requeridos' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, correo, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, correo, rol',
      [nombre, correo, hashedPassword, rol || 'servidor']
    );

    const token = jwt.sign(
      { id: result.rows[0].id, email: correo, rol: result.rows[0].rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: result.rows[0].id,
        name: result.rows[0].nombre,
        email: result.rows[0].correo,
        rol: result.rows[0].rol
      }
    });
  } catch (err) {
    console.error('Error en registro:', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email ya registrado' });
    }
    res.status(500).json({ error: 'Error en servidor' });
  }
};

// Verificar token
exports.verify = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, correo, rol, foto_perfil FROM usuarios WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        name: user.nombre,
        email: user.correo,
        rol: user.rol,
        avatar: user.foto_perfil
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en servidor' });
  }
};
