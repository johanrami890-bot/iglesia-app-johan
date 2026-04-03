const express = require('express');
const tareasController = require('../controllers/tareasController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, tareasController.getAllTareas);
router.get('/:id', authMiddleware, tareasController.getTareaById);
router.post('/', authMiddleware, adminMiddleware, tareasController.createTarea);
router.put('/:id', authMiddleware, adminMiddleware, tareasController.updateTarea);
router.delete('/:id', authMiddleware, adminMiddleware, tareasController.deleteTarea);

module.exports = router;
