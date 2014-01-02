// web.js
var express = require('express');
var logfmt = require('logfmt');
var amqp = require('amqp');

var app = express();

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
    res.send('Hello World!');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log('Listening on ' + port);
});


// Sketch in some AMQP-setup for the server.

var amqpUrl = process.env.CLOUDAMQP_URL || 'amqp://localhost'; // default to localhost
var amqpConn = amqp.createConnection({url: amqpUrl}); // create the connection

function handleMessage(message, headers, deliveryInfo) {
    console.log('[Server] Got a message with routing key ' + deliveryInfo.routingKey + '\n\t message:' + message);
}

function subscribeToAmqpQueue(queue) {

    queue.subscribe(handleMessage);
}

function setupAmqpQueue(exchange) {
    console.log('Exchange ' + exchange.name + ' is open');

    var queueOpts = {
        exclusive: true
    };

    // Create a randomly-named queue in the context of this exchange.  This queue is exclusive to this connection.
    amqpConn.queue('', queueOpts, function(queue) {
        console.log('Queue ' + queue.name + ' is open');
        queue.bind(exchange, '#');
        subscribeToAmqpQueue(queue);
    });
}

function setupAmqpExchange() {
    var exchangeOpts = {
        type: 'fanout'
    };

    amqpConn.exchange('munin-tracking', exchangeOpts, setupAmqpQueue); // set up a munin exchange
}

amqpConn.on('ready', setupAmqpExchange); // when connected, set up the amqp backend and listen for messages.
