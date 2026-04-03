const express = require('express');
const asignacionesController = require('../controllers/asignacionesController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Rutas específicas ANTES de :id
router.get('/fecha/rango', authMiddleware, asignacionesController.getAsignacionesByFecha);
router.get('/usuario/:usuario_id', authMiddleware, asignacionesController.getAsignacionesByUsuario);

// Rutas básicas CRUD
router.get('/', authMiddleware, asignacionesController.getAllAsignaciones);
router.get('/:id', authMiddleware, asignacionesController.getAsignacionById);
router.post('/', authMiddleware, adminMiddleware, asignacionesController.createAsignacion);
router.put('/:id', authMiddleware, adminMiddleware, asignacionesController.updateAsignacion);
router.post('/generar', authMiddleware, adminMiddleware, asignacionesController.generarMes);
router.post('/recordatorios', authMiddleware, adminMiddleware, asignacionesController.enviarRecordatorios);
router.delete('/rango-custom', authMiddleware, adminMiddleware, asignacionesController.deleteAsignacionesByRange);
router.delete('/:id', authMiddleware, adminMiddleware, asignacionesController.deleteAsignacion);

module.exports = router;
