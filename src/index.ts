import express, { Response, Request } from 'express';
import io from 'socket.io';
import mongoose from 'mongoose';
import AnonymousUserAPI from './apis/anonymous-user';
import { GroupAPIs } from './apis/group';
import { InvitaionAPIs } from './apis/invitation';
import rootSocketService from './socket-services/root-socket-service';

const server = express();
const http = require('http').createServer(server);
const socket = io(http);

var bodyParser = require('body-parser');
server.use(bodyParser.json()); // to support JSON-encoded bodies
server.use(
	bodyParser.urlencoded({
		// to support URL-encoded bodies
		extended: true
	})
);

server.use(express.json()); // to support JSON-encoded bodies
// app.use(express.urlencoded()); // to support URL-encoded bodies

server.use(function(_: Request, res: Response, next: any) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
	next();
});

mongoose.connect('mongodb://bruce:1234@mongo:27017/wru-db', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	// we're connected!
	console.log("we're connected to databse wru-db!");
	server.use('/', [AnonymousUserAPI, GroupAPIs, InvitaionAPIs]);
	socket.on('connection', rootSocketService);
});

http.listen(5000, function() {
	console.log('listening on *:5000');
});
