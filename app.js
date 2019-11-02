const express = require('express');
const bodyParser = require('body-parser');
const db = require('./dbconn.js');

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

if(!db._connected){
	db.connect().then(() => {
		console.log('Successfully connected to postgresSQL!');
	
	}).catch((error) => {
		console.log('Unable to connect to postgresSQL!');
		console.log(error);
	});
}

app.use(bodyParser.json());




module.exports = app;