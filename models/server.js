const express = require('express')

let usuarios = require('../routes/usuarios');
let pruebas = require('../routes/pruebas');
let cors = require('cors');
let bodyParser = require('body-parser');


class Server{

  constructor(){
    this.app= express()
    this.port= process.env.PORT
    this.usuariosPath='/';
    this.pruebasPath='/prax';

    //Middlewares
    this.middlewares();

    //Ruras de mi aplicacion
    this.routes();

  }

  middlewares(){

    //CORS
    this.app.use( cors({ origin: true, credentials: true  }) );

    //Lectaura y parseo del body
    this.app.use(express.json());

    //Directorio Publico
    this.app.use(express.static('public'));

    // parse application/x-www-form-urlencoded
    this.app.use(bodyParser.urlencoded({ extended: false }));

    // parse application/json
    this.app.use(bodyParser.json());

    this.app.set('trust proxy', true);
  }

  routes(){

    //otro tipo de middl configuramos el router
    this.app.use(this.usuariosPath, usuarios);
    this.app.use(this.pruebasPath , pruebas);

  }

  listen(){
    this.app.listen(this.port, ()=>{
      console.log("Servidor corriendo en : ",this.port)
    })
  }

}

module.exports = Server;