const router = require('express').Router();
const c = require('../controllers/tareas');

router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', c.crear);
router.put('/:id', c.actualizar);
router.delete('/:id', c.eliminar);

module.exports = router;