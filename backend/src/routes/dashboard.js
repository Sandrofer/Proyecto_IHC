const router = require('express').Router();
const c = require('../controllers/dashboard');

router.get('/resumen', c.resumen);

module.exports = router;