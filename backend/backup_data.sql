-- BACKUP IGLESIA APP 2026-02-01T23:42:58.350Z

-- USUARIOS (5)
INSERT INTO usuarios (id, nombre, correo, password, telefono, rol, foto_perfil, estado) VALUES (1, 'Pastor Principal', 'pastor@iglesia.com', '$2b$10$yYAdT8so81hdK9Mm2aV8HuBUNoUsELYYeL2IF08BDPfNxSvwRkYSK', NULL, 'pastor', NULL, 'activo') ON CONFLICT (correo) DO NOTHING;
INSERT INTO usuarios (id, nombre, correo, password, telefono, rol, foto_perfil, estado) VALUES (8, 'yundoso', 'yundoso@gmail.com', '$2b$10$8PEHxE2ZzWYpydlxqdB6tOZtppxDdC4R3xCe1Xv74.6weG/jpvHGW', NULL, 'servidor', NULL, 'activo') ON CONFLICT (correo) DO NOTHING;
INSERT INTO usuarios (id, nombre, correo, password, telefono, rol, foto_perfil, estado) VALUES (9, 'jhorlan', 'jhorlanortiz@gmail.com', '$2b$10$h8mAQScIfWZutiXRLWcMY.1D6qb5R61AMJOkt0iFbB/UnrgoyH8li', NULL, 'servidor', NULL, 'activo') ON CONFLICT (correo) DO NOTHING;
INSERT INTO usuarios (id, nombre, correo, password, telefono, rol, foto_perfil, estado) VALUES (10, 'wasa', 'ejemplo@gmail.com', '$2b$10$vkNmpeXvCRU5O.1QZjx42.FZcMIu9qtGBVOzxhfSrm6BW/wWHMFcC', '3228646526', 'supervisor', NULL, 'activo') ON CONFLICT (correo) DO NOTHING;
INSERT INTO usuarios (id, nombre, correo, password, telefono, rol, foto_perfil, estado) VALUES (17, 'prueba', 'prueba@gmaail.com', '$2b$10$XZUAG0Rrp4df5.kS525QJOuKMYquUPZLuWVlPmlajC6mznWUUgDsS', NULL, 'servidor', NULL, 'activo') ON CONFLICT (correo) DO NOTHING;
SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));

-- TAREAS (0)
SELECT setval('tareas_id_seq', (SELECT MAX(id) FROM tareas));

-- ASIGNACIONES (0)
SELECT setval('asignaciones_id_seq', (SELECT MAX(id) FROM asignaciones));

