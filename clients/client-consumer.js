var amqp = require('amqp');

// Sketch in some AMQP-setup for a client subscriber

var amqpUrl = process.env.CLOUDAMQP_URL || 'amqp://localhost'; // default to localhost
var amqpConn = amqp.createConnection({url: amqpUrl}); // create the connection

// Handle the messages.  We'll be a little more explicit here to show how to handle different messages on different
// routing keys.
function handleMessage(message, headers, deliveryInfo) {
    switch(deliveryInfo.routingKey) {
    case 'munin.tracking.periodic-time':
        console.log('[Javascript Consumer] Received time update: ' + message.toString());
        break;
    case 'munin.tracking.objects':
        console.log('[Javascript Consumer] Received new tracked object: ' + message.data.toString());
        break;
    default:
        console.log('[Javascript Consumer] Got a message with routing key ' + deliveryInfo.routingKey +
                    '\n\t message:' + message.data.toString());
    }

}

// Subscribe to the proper queue.
function subscribeToAmqpQueue(queue) {

    queue.subscribe(handleMessage);
}

// Set up and bind the queue to the exchange.
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

// And create a queue that matches the normal exchange.
function setupAmqpExchange() {
    var exchangeOpts = {
        type: 'fanout'
    };

    amqpConn.exchange('munin', exchangeOpts, setupAmqpQueue); // set up a munin exchange
}

amqpConn.on('ready', setupAmqpExchange); // when connected, set up the amqp backend and listen for messages.
