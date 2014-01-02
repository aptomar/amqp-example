var amqp = require('amqp');

// Sketch in some AMQP-setup for a client publisher

var amqpUrl = process.env.CLOUDAMQP_URL || 'amqp://localhost'; // default to localhost
var amqpConn = amqp.createConnection({url: amqpUrl}); // create the connection

function publishTime(exchange) {
    var message = new Date();
    exchange.publish('munin.tracking.periodic-time', message);
    console.log(' [x] Sent "%s"', message.toJSON());
}

function setupAmqpExchange() {
    var exchangeOpts = {
        type: 'fanout'
    };

    amqpConn.exchange('munin-tracking', exchangeOpts, function(exchange) {
        console.log('Exchange ' + exchange.name + ' set up, starting publishing.');
        setInterval(publishTime, 1000, exchange);
    }); // set up a munin exchange
}

amqpConn.on('ready', setupAmqpExchange); // when connected, set up the amqp backend and listen for messages.
