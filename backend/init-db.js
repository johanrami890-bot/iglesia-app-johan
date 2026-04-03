const pool = require('./config/database');

async function initDB() {
  try {
    console.log('🔄 Inicializando base de datos...');

    // Crear tabla usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        correo VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        telefono VARCHAR(20),
        rol VARCHAR(50) NOT NULL DEFAULT 'servidor',
        foto_perfil VARCHAR(500),
        estado VARCHAR(50) NOT NULL DEFAULT 'activo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabla usuarios creada');

    // Crear tabla tareas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tareas (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
        usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
        fecha_vencimiento DATE,
        prioridad VARCHAR(50) DEFAULT 'media',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabla tareas creada');

    // Crear tabla asignaciones
    await pool.query('DROP TABLE IF EXISTS asignaciones CASCADE');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS asignaciones (
        id SERIAL PRIMARY KEY,
        usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        tarea_id INT NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
        fecha_asignacion DATE NOT NULL,
        observaciones TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabla asignaciones creada');

    // Crear tabla solicitudes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS solicitudes (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(50) NOT NULL,
        usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        datos JSONB NOT NULL,
        estado VARCHAR(20) DEFAULT 'pendiente',
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabla solicitudes creada');

    // Insertar usuario de prueba
    const hashedPassword = '$2a$10$YOixf2Q8E.P3W2Lqa.vkSu6RjBXmNvE8d9J7K8L9M0N1O2P3Q4R5S6';

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, correo, password, rol, estado) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (correo) DO NOTHING
       RETURNING *`,
      ['Pastor Principal', 'pastor@iglesia.com', hashedPassword, 'pastor', 'activo']
    );

    if (result.rows.length > 0) {
      console.log('✓ Usuario de prueba creado:');
      console.log('  Email: pastor@iglesia.com');
      console.log('  Contraseña: iglesia123');
    } else {
      console.log('✓ Usuario ya existe');
    }

    console.log('\n✅ Base de datos inicializada correctamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

initDB();
