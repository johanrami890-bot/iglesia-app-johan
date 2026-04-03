const express = require('express');
const solicitudesController = require('../controllers/solicitudesController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Crear solicitud (Supervisor)
router.post('/', authMiddleware, solicitudesController.createSolicitud);

// Ver pendientes (Pastor)
router.get('/', authMiddleware, adminMiddleware, solicitudesController.getSolicitudes);

// Procesar (Pastor)
router.post('/:id/procesar', authMiddleware, adminMiddleware, solicitudesController.procesarSolicitud);

module.exports = router;
