require('dotenv').config();
const Server = require('./models/server');

//hacemos la instacia
const server = new Server();
server.listen();
