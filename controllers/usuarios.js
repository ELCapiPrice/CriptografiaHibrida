const {response} = require('express');
const NodeRSA = require('node-rsa');
const path = require('path');
let fs = require('fs');
const crypto = require('crypto');
const aesjs = require('aes-js');
var pbkdf2 = require('pbkdf2');
var iv = [ 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,35, 36 ];

let publicDir = path.join(__dirname, '../public/')

const usuariosGet = (req , res)=>{
  //express parasea los parmas
  const {q ,nombre='No name' , key}= req.query;
  res.sendFile( path.join(__dirname, '../public/prax/prax.html'));
}
const usuariosPut = (req , res)=>{
  //el id es  el nnombre que dimos  en las rutas :id
  const id =req.params.id;
  res.json({
    ok: true,
    msg: 'Put API-Controlador',
    id
  })
}

const usuariosPost = async (req , res)=> {
  let {text, signIt, verify, privateKeyAutor, publicKeyDestination, privateKeyB, publicKeyA} = req.body;

  if(signIt){
    let signText = await cipherHash(text, publicKeyDestination, privateKeyAutor);
    res.json({
      ok: true,
      msg: '/Signature.txt',
      signText: signText
    });
    return;
  } else if(verify){
    let data = checkText(text, privateKeyB, publicKeyA);
      res.json({
        isValid: data.isValid,
        msg: data.msg
      });
      return;
  }
  //En caso de que algun parametro sea invalido regresamos error
  res.json({
    ok: true,
    msg: 'Error.'
  })
}

const cipherHash = (text, publicKeyB, privateKeyA) => {
  //Paso 1. Generar una llave de 16 bytes al azar para AES
  try {
    let key = generateRandomKey();
    //Paso 2. Cifrar el texto
    //Primero lo ajustamos para que su longitud siempre sea multiplo de 16 bytes
    let newText = set16Bytes(text);
    let cipherTextRSA = cipherText(newText, key); //Obtenemos el texto cifrado
    //Paso 3. cifrar con RSA la llave generada aleatoriamente usando la llave publica de betito
    let keyCipher = cipherKeyRSA(key, publicKeyB);
    //Paso 4. Se obtiene el hash del mensaje original y se cifra con RSA
    let cipherHashText = getCipherHash(newText, privateKeyA);
    // cipherTextRSA + keyCipher(344 bytes) + cipherHashText (344 bytes)
    let textoAGuardar = cipherTextRSA + keyCipher + cipherHashText;
    console.log('+-----------------------------+');
    console.log(textoAGuardar);
    console.log('+-----------------------------+');
    //Aqui se crea el archivo
    createFileFrom(textoAGuardar, "Signature.txt");
    return textoAGuardar;
  } catch (e){
    return "Error. (Some data is invalid)";
  }
}

const checkText = (text, privateKeyB, publicKeyA) =>{
  try {
    //Paso1. Identificar las 3 partes del archivo
    let originalText = text.substring(0, text.length - 688);
    let keyCipher = text.substring(text.length - 688, text.length - 344);
    let cipherHashText = text.substring(text.length - 344);
    //Paso2. Descifrar la llave con RSA
    let keyAES = decipherKeyRSA(keyCipher, privateKeyB);
    //Paso3. Obtener el mensaje original
    let deciperText = decipherTextAES(originalText, keyAES);
    //Paso4. Verificar firma digital
    let deciperHashText = decipherHashTextRSA(cipherHashText, publicKeyA);
    //Paso 5 Sacar hash al mensaje descifrado
    let hashObtenido = getHashSHA1(deciperText);
    //Paso 6. Verificar que ambos digestos sean correctos
    if (deciperHashText === hashObtenido) {
      console.log(":D");
      return {
        'msg': deciperText.replace(/0/g, ''),
        'isValid': true
      };
    } else {
      console.log(":(");
      return {
        'msg': deciperText.replace(/0/g, ''),
        'isValid': false
      };
    }
  } catch (e) {
    return {
      'msg': "Error on decipher. (Some data is wrong or has been modified)",
      'isValid': false
    };
  }
}

const usuariosDelete = (req , res)=>{
  res.json({
    ok: true,
    msg: 'Delete API-Controlador'
  })
}



let generateRandomPassword = () =>{
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < 10 ; i++ ) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

let set16Bytes = (texto) =>{
  let longitud = texto.length % 16;
  if(longitud === 0) return texto; //Si la longitud es de 16 ya no le agreges 0's
  return set16Bytes(texto + '0'); //Agregale un 0 hasta que sea multiplo de 16
}


let generateRandomKey = () => {
  let password = generateRandomPassword(); //Generamos una palabra al azar de longitud 10
  //Generamos una llave aleatoria de 16 bytes
  let key_128 = pbkdf2.pbkdf2Sync(password, 'veracruz', 1, 128 / 8, 'sha512');
  console.log('+-----------------------------+');
  console.log("Randomly generated key: ");
  console.log(key_128);
  console.log('+-----------------------------+');
  return key_128;
}

let cipherText = (texto = 'TextMustBe16Byte', key) => {
  console.log('+-----------------------------+');
  console.log("Texto a cifrar: "+ texto);
  console.log('+-----------------------------+');
  let textBytes = aesjs.utils.utf8.toBytes(texto); //Lo pasa a un arreglo en código ascii
  let aesCbc = new aesjs.ModeOfOperation.cbc(key, iv); //Creamos el cifrado con la llave y el vector
  let encryptedBytes = aesCbc.encrypt(textBytes); //Ciframos el texto
  let encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes); //Lo pasamos a hexadecimal para poder leerlo
  console.log('+-----------------------------+');
  console.log("Texto cifrado: "+ encryptedHex);
  console.log('+-----------------------------+');
  return encryptedHex;
}

let cipherKeyRSA = (keyRSA, publicKey) => {
  let rsa1024 = new NodeRSA({b: 1024});
  rsa1024.importKey(publicKey); //Cargamos la llave publica de betito
  const llaveCifrada = rsa1024.encrypt(keyRSA, 'base64');
  console.log('+-----------------------------+');
  console.log('Llave cifrada: ');
  console.log(llaveCifrada); //Longitud 344 bytes
  console.log('+-----------------------------+');
  return llaveCifrada;
}

let getCipherHash = (text, privateKey) =>{
  console.log('+-----------------------------+');
  console.log('Texto a sacar hash: ');
  console.log(text);
  console.log('+-----------------------------+');
  let shasum = crypto.createHash('sha1'); //Creamos el algoritmo sha1
  shasum.update(text); //Ponemos el texto a sacar digesto
  const hash = shasum.digest('hex'); //Ej. "0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33"
  console.log('+-----------------------------+');
  console.log('Hash generado: ');
  console.log(hash);
  console.log('+-----------------------------+');

  let rsa1024 = new NodeRSA({b: 1024});
  rsa1024.importKey(privateKey); //Cargamos la llave privada
  let cipherHash = rsa1024.encryptPrivate(hash, 'base64'); //Ciframos con rsa el hash
  console.log('+-----------------------------+');
  console.log('Hash cifrado: ');
  console.log(cipherHash);
  console.log('+-----------------------------+');
  return cipherHash;
}

let createFileFrom = (data, fileName) => {
  fs.writeFile(publicDir + "\\" + fileName , data, (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;
    // success case, the file was saved
    console.log('Archivo salvado correctamente!');
  });
}

let decipherKeyRSA = (key, privateKey) =>{
  let rsa1024 = new NodeRSA({b: 1024});
  rsa1024.importKey(privateKey);
  let decipherKey = rsa1024.decrypt(key,'hex');
  console.log('+-----------------------------+');
  console.log('Llave Descifrada');
  console.log(decipherKey);
  console.log('+-----------------------------+');
  return decipherKey;
}

let decipherTextAES = (text, llave) =>{
  let encryptedBytes = aesjs.utils.hex.toBytes(text);
  const laveBuffer = Buffer.from(llave, "hex");
  let aesCbc = new aesjs.ModeOfOperation.cbc(laveBuffer, iv);
  let decryptedBytes = aesCbc.decrypt(encryptedBytes);
  let decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
  console.log('+-----------------------------+');
  console.log("Texto descifrado: ")
  console.log(decryptedText);
  console.log('+-----------------------------+');
  return decryptedText;
}

let decipherHashTextRSA = (cipherHashText, publicKeyA) =>{
  let rsa1024 = new NodeRSA({b: 1024});
  rsa1024.importKey(publicKeyA);
  let digestoDescifrado = rsa1024.decryptPublic(cipherHashText,'utf8');
  console.log('+-----------------------------+');
  console.log("Hash Descifrado")
  console.log(digestoDescifrado);
  console.log('+-----------------------------+');
  return digestoDescifrado;
}

let getHashSHA1 = (text) => {
  console.log('+-----------------------------+');
  console.log('Texto a obtener hash: ');
  console.log(text);
  console.log('+-----------------------------+');
  let shasum = crypto.createHash('sha1'); //Creamos el algoritmo sha1
  shasum.update(text); //Ponemos el texto a sacar digesto
  const hash = shasum.digest('hex'); //Ej. "0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33"
  console.log('+-----------------------------+');
  console.log('Hash generado: ');
  console.log(hash);
  console.log('+-----------------------------+');
  return hash;
}


module.exports={
  usuariosGet,
  usuariosPut,
  usuariosDelete,
  usuariosPost
}