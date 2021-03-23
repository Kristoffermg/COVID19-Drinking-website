import {extractJSON, fileResponse, htmlResponse,extractForm,jsonResponse,errorResponse,reportError,startServer} from "./server.js";
const ValidationError="Validation Error";
const NoResourceError="No Such Resource";
export {ValidationError, NoResourceError, processReq};
//import mysql from "mysql";
//you may need to: npm install mysql
startServer();
/*
// test DB connection 
//const mysql = require('mysql');
const DBConnection = mysql.createConnection({
  host: 'localhost',
  user: 'p2datsw-staff',
  password: '#############',
  database: 'staff'
});


DBConnection.connect((err) => {
  if (err) throw err;
  console.log('MySql Connected!');
});
*/

// Constants can be placed here

// Removes potentially dangerous/undesired characters (avoids injection)
function sanitize(str){
  str=str
  .replace(/&/g, "")
  .replace(/</g, "")
  .replace(/>/g, "")
  .replace(/"/g, "")
  .replace(/'/g, "")
  .replace(/`/g, "")
  .replace(/\//g, "");
  return str.trim();
}
