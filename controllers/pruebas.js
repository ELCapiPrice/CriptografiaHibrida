
const {response} = require('express');
let path = require('path');



const pruebasGet = (req , res)=>{
  //express parasea los parmas
  res.sendFile( path.join(__dirname, '../public/prax/prax.html'));
}


module.exports={
    pruebasGet,
}