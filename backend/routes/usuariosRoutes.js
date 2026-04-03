const express = require('express');
const usuariosController = require('../controllers/usuariosController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, usuariosController.getAllUsuarios);
router.get('/:id', authMiddleware, usuariosController.getUsuarioById);
router.post('/', authMiddleware, adminMiddleware, usuariosController.createUsuario);
router.put('/:id', authMiddleware, adminMiddleware, usuariosController.updateUsuario);
router.delete('/:id', authMiddleware, adminMiddleware, usuariosController.deleteUsuario);
router.put('/:id/change-password', authMiddleware, usuariosController.changePassword);
module.exports = router;