# AMQP examples

This repo contains some example code that can be used as a small wrapper and clients for testing out AMQP on Heroku.  

The main entry point for Heroku is the `web.js` file.  It simply sets up a basic hello-world page and creates a
connection to the AMQP server that logs messages.

The files in the `client` directory are some example producers and consumers in javascript and python that show how it
is possible to publish to the shared exchange and subscribe to private queues bound to the shared exchange.

These examples are missing most of the proper error handling that we would need for our project.
