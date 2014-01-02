from lxml import objectify, etree
import uuid
import random
import datetime
import pika
import os
import threading

targetTypes = {
    0: 'unknown',
    1: 'vessel',
    2: 'flotsam_solid',
    3: 'flotsam_not_solid'
}

statuses = {
    0: 'detected',
    1: 'tracked',
    2: 'lost_out_of_range',
    3: 'lost_unknown_reason'
}


def getUUID():
    return uuid.uuid4()


def randomType():
    r = random.randint(0, 3)
    return targetTypes[r]


def randomStatus():
    r = random.randint(0, 3)
    return statuses[r]


def randomMessage():
    E = objectify.E
    now = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ")

    target = E.target(
        E.objectID(getUUID()),
        E.targetType(randomType()),
        E.status(randomStatus()),
        E.timestamp(now)
    )

    return etree.tostring(target)


def publishTarget():
    # send a message
    message = randomMessage()
    channel.basic_publish(exchange='munin-tracking',
                          routing_key='munin.tracking.objects',
                          body=message)
    print " [x] Sent %r" % (message,)
    t = threading.Timer(2.0, publishTarget)
    t.start()


# Parse CLODUAMQP_URL (fallback to localhost)
url = os.environ.get('CLOUDAMQP_URL', 'amqp://guest:guest@localhost:5672/%2f')
params = pika.URLParameters(url)
connection = pika.BlockingConnection(params)  # Connect to CloudAMQP
channel = connection.channel()                # start a channel

channel.exchange_declare(exchange='munin-tracking',
                         type='fanout',
                         auto_delete=True)

t = threading.Timer(2.0, publishTarget)
t.start()
