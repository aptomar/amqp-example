// web.js
// We will use express for a basic web front-end
var express = require('express');
var logfmt = require('logfmt');

// node-amqp will allow us to use RabbitMQ
var amqp = require('amqp');

var pdata = require('pretty-data');

var messages = [];

// Set up the basic web page
var app = express();
app.use(logfmt.requestLogger());
app.use(express.static(__dirname + '/static'));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/', function(req, res) {
    res.render('messages', {messages: messages});
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
    var now = new Date();
    var msg = '';

    switch(typeof(message)) {
    case 'string':
        msg = message;
        break;
    case 'object':
        msg = pdata.pd.xml(message.data.toString());
        break;
    default:
        msg = '[ERR] Got a message, but I\'m not sure how to process it.';
        break;
    }
    console.log('[Javascript Server]: ' + msg);
    var len = messages.unshift({timestamp: now, message: msg});
    if (len === 100) {
        messages.pop();
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
