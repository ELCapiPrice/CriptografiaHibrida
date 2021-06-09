const { pruebasGet } = require('../controllers/pruebas');
const  router = require('express').Router();



router.get('/',  pruebasGet)


module.exports= router;