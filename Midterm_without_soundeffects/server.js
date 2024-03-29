var https = require('https');
var fs = require('fs'); // Using the filesystem module

var credentials = { 
	key: fs.readFileSync('/etc/letsencrypt/live/zz4714.itp.io/privkey.pem'), 
	cert: fs.readFileSync('/etc/letsencrypt/live/zz4714.itp.io/cert.pem') 
};

// Express is a node module for building HTTP servers
var express = require('express');
var app = express();

// Tell Express to look in the "public" folder for any files first
app.use(express.static('public'));

// If the user just goes to the "route" / then run this function
app.get('/', function (req, res) {
  res.send('Hello World!')
});

// If the user just goes to the "route" / then run this function
app.get('/hello', function (req, res) {
	res.send('Hello World!')
  });
  

// Here is the actual HTTP server 
// var http = require('http');
// We pass in the Express object
var httpServer = https.createServer(credentials, app);
// Listen on port 443
httpServer.listen(443);

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(httpServer);

let messages = [];

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
	
		console.log("We have a new client: " + socket.id);

		socket.on('mouse', function(data){
			io.sockets.emit('mouse', data);
		});

		socket.on('newFallingSquare', function(data) {
			console.log('newFallingSquare received with data:', data);
			// Emit this event to all clients except the sender
			io.emit('newFallingSquare', data);
		});
		

		for (let i = 0; i < messages.length; i++) {
			socket.emit('chatmessage',messages[i]);
		}
		
		// When this user emits, client side: socket.emit('otherevent',some data);
		socket.on('chatmessage', function(data) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: 'chatmessage' " + data);
			
			messages.push(data);

			// Send it to all of the clients
			//socket.broadcast.emit('chatmessage', data);
			io.emit('chatmessage', data);
		});

		socket.on('click', function(data) {
			io.emit('click', {});
		});

		// Listening to the 'GPress' event
		socket.on('GPress', function(data) {
			console.log('GPress received from a user', data);
			io.emit('GPress', data); // Send to all clients
		});

		// Listening to the 'WPress' event
		socket.on('WPress', function(data) {
			console.log('WPress received from a user', data);
			io.emit('WPress', data); // Send to all clients
		});

		


		
		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});
	}
);
	
