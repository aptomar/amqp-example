# clojure-amqp-example

This is a simple clojure-based example using AMQP.  Spiked pretty directly from the Langohr and CloudAMQP docs.

## Installation

Just clone the archive.

## Usage

This example uses Leiningen, so install that first.  You'll want to `cd` to the top-level directory of this example
(e.g. where this README file is located).  Then do:

    $ lein deps
    $ lein run

Note that you may want to export a pointer to the RabbitMQ server.  E.g. replace the last line above with the following:

    $ CLOUDAMQP_URL=amqp://mmyikoym:YT_VSLo2KsNpy7avGISrGxnn61aPnBw9@turtle.rmq.cloudamqp.com:5672/mmyikoym lein run

## License

Copyright © 2014 Aptomar AS

Distributed under the Eclipse Public License either version 1.0 or (at
your option) any later version.
