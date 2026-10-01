const express = require('express');
const router = express.Router();
const planController = require('../controllers/plan');

router.get('/', planController.listar);
router.get('/:id', planController.obtenerPorId);
router.post('/', planController.crear);
router.put('/:id', planController.actualizar);
router.delete('/:id', planController.eliminar);

module.exports = router;
