var amqp = require('amqp');

// Sketch in some AMQP-setup for a client publisher

var amqpUrl = process.env.CLOUDAMQP_URL || 'amqp://localhost'; // default to localhost
var amqpConn = amqp.createConnection({url: amqpUrl}); // create the connection

// Publish a message into the exchange.  For this example, we'll just use a somewhat-arbitrary routing key.
function publishTime(exchange) {
    var message = new Date();
    exchange.publish('munin.tracking.periodic-time', message);
    console.log(' [x] Sent "%s"', message.toJSON());
}

// Set up the exchange.  This needs to match the exchange used by all clients.
function setupAmqpExchange() {
    var exchangeOpts = {
        type: 'fanout'
    };

    amqpConn.exchange('munin', exchangeOpts, function(exchange) {
        console.log('Exchange ' + exchange.name + ' set up, starting publishing.');
        setInterval(publishTime, 1000, exchange);
    }); // set up a munin exchange
}

amqpConn.on('ready', setupAmqpExchange); // when connected, set up the amqp backend and listen for messages.
