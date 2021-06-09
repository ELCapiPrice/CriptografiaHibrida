let url = window.location.href;

let signIt = async () =>{
  let originalText = document.getElementById("cypherText").value;
  let privateKey = document.getElementById("cypherPrivateKey").value;
  let publicKey = document.getElementById("cypherPublicKey").value;
  if(originalText === "") return alert("Write a message");
  if(privateKey === "") return alert("Write a private key");
  if(publicKey === "") return alert("Write a public key");
  let requestJSON = {
    "text": originalText,
    "privateKeyAutor": privateKey,
    "publicKeyDestination": publicKey,
    "signIt": true
  }
  await postData(url, requestJSON);
}

let verifyDocument = async ()=>{
  let originalText = document.getElementById("decypherText").value;
  let publicKey = document.getElementById("decypherPublicKey").value;
  let privateKey = document.getElementById("decypherPrivateKey").value;
  if(originalText === "") return alert("Write a message");
  if(publicKey === "") return alert("Write a public key");
  if(privateKey === "") return alert("Write a private key");
  let requestJSON = {
    "text": originalText,
    "privateKeyB": privateKey,
    "publicKeyA": publicKey,
    "verify": true
  }
  await postData2(url, requestJSON)
}

async function postData2(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      //'Content-Type':'application/x-www-form-urlencoded',
      "Access-Control-Allow-Headers" : "Content-Type",
      "Access-Control-Allow-Origin": "http://localhost:${8080}/tarea1",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  let json = await response.json();
  document.getElementById("decipherResult").value = json.msg;
  if(json.isValid === true){
    alert("The message retains its integrity and validity");
  } else{
    alert("The message was altered :(");
  }
  //document.getElementById("downloadDecryptedFile").href = json.msg;
  //return response.json(); // parses JSON response into native JavaScript objects
}

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      //'Content-Type':'application/x-www-form-urlencoded',
      "Access-Control-Allow-Headers" : "Content-Type",
      "Access-Control-Allow-Origin": "http://localhost:${8080}/tarea1",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  var json = await response.json();
  console.log(json.signText);
  document.getElementById("cipherResult").value = json.signText;
  document.getElementById("downloadEncryptedFile").href = json.msg;
  return response.json(); // parses JSON response into native JavaScript objects
}

document.getElementById('inputLoadFile--cypherPrivateKey')
  .addEventListener('input', leerArchivo, false);
document.getElementById('inputLoadFile--cypherPublicKey')
  .addEventListener('input', leerArchivo, false);
document.getElementById('inputLoadFile--cypherText')
  .addEventListener('input', leerArchivo, false);

document.getElementById('inputLoadFile--decypherText')
  .addEventListener('input', leerArchivo, false);
document.getElementById('inputLoadFile--decypherPublicKey')
  .addEventListener('input', leerArchivo, false);
document.getElementById('inputLoadFile--decypherPrivateKey')
  .addEventListener('input', leerArchivo, false);

function leerArchivo(e) {
  console.log(e.target.name);
  let archivo = e.target.files[0];
  let textAreaID = e.target.name;
  if (!archivo) return;
  let lector = new FileReader();
  lector.onload = function(e) {
    let contenido = e.target.result;
    updateTextArea(contenido, textAreaID);
  };
  lector.readAsText(archivo, 'ISO-8859-1');
}

function updateTextArea(contenido, textAreaID) {
  document.getElementById(textAreaID).value = contenido;
}