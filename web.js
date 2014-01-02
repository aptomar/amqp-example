// web.js
// We will use express for a basic web front-end
var express = require('express');
var logfmt = require('logfmt');

// node-amqp will allow us to use RabbitMQ
var amqp = require('amqp');


// Set up the basic web page
var app = express();
app.use(logfmt.requestLogger());
app.get('/', function(req, res) {
    res.send('Hello World!');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log('Listening on ' + port);
});


// Sketch in some AMQP-setup for the server.  We can switch between heroku and a local setup with this.
var amqpUrl = process.env.CLOUDAMQP_URL || 'amqp://localhost'; // default to localhost
var amqpConn = amqp.createConnection({url: amqpUrl}); // create the connection

// Simple message handler: just dump what we get into the logs.
function handleMessage(message, headers, deliveryInfo) {
    switch(typeof(message)) {
    case 'string':
        console.log('[Server] Got a message with routing key ' + deliveryInfo.routingKey + '\n\t message: ' + message);
        break;
    case 'object':
        console.log('[Server] Got a message with routing key ' + deliveryInfo.routingKey +
                    '\n\t message: ' + message.data.toString());
        break;
    default:
        console.log('[Server] Got a message, but is not sure how to process it.');
        break;
    }
}

// Doesn't have to be in it's own function, but I'm separating this for clarity.
function subscribeToAmqpQueue(queue) {
    queue.subscribe(handleMessage);
}

// Set up the queue.  We need to make sure that we bind the queue to the proper exchange.
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

// Set up the exchange.  We're working with a pub-sub model, so we need to use the fanout exchange type.
function setupAmqpExchange() {
    var exchangeOpts = {
        type: 'fanout'
    };

    amqpConn.exchange('munin', exchangeOpts, setupAmqpQueue); // set up a munin exchange
}

amqpConn.on('ready', setupAmqpExchange); // when connected, set up the amqp backend and listen for messages.
