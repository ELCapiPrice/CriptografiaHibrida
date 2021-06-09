const { usuariosGet  , usuariosPut , usuariosDelete , usuariosPost} = require('../controllers/usuarios');

const  router = require('express').Router();

router.get('/',  usuariosGet)

router.put('/:id',  usuariosPut)

router.post('/',  usuariosPost)

router.delete('/',  usuariosDelete)



module.exports= router;