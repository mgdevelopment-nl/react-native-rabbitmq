## Todo

## Installation

## IOS

npm install react-native-rabbitmq --save

 Installation with CocoaPods

1. In the Podfile uncomment "use_frameworks" (Optional):

```
use_frameworks!
```
2. Add the following to your Podfile, use master because needed fix is not a tag:

```
pod 'react-native-rabbitmq', :path => '../node_modules/react-native-rabbitmq'
pod 'RMQClient', :git => 'https://github.com/rabbitmq/rabbitmq-objc-client.git'
```
3. Install the cocapods:

```
pod install
```



In xcode add a recursive Header Search Path:
```
$(SRCROOT)/Pods
```


You need to change some things, to make it work:

ios\Pods\RMQClient\RMQClient\RMQValues.h Line 53
```
@import JKVValue;
```
to
```
#import "JKVValue.h"
```

ios\Pods\JKVValue\JKVValue\Public\JKVValue.h
```
#import <JKVValue/JKVValueImpl.h>
#import <JKVValue/JKVMutableValue.h>
#import <JKVValue/JKVObjectPrinter.h>
#import <JKVValue/JKVFactory.h>
```
to
```
#import "JKVValueImpl.h"
#import "JKVMutableValue.h"
#import "JKVObjectPrinter.h"
#import "JKVFactory.h"
```

ios\Pods\RMQClient\RMQClient\RMQTCPSocketTransport.h
```
@import CocoaAsyncSocket;
```
to
```
#import "GCDAsyncSocket.h"
```

react-native link


## Android

npm install react-native-rabbitmq --save

react-native link

## How to create #PKCS12 file
While testing (on iOS) I got the connection working converting a certificate to a binary pfx file.
The certificate was signed by Let's Encrypt, in iOS a self-signed certificate will not work.

The only way the #pkc12 worked for me was to include the leaf certificate, the chain (given by Let's Encrypt), and a CA bundle created by the Root certificate and Intermediate certificate which signed my certificate.
 
```bash
openssl pkcs12 -export -out certificate.pfx -inkey private_key.pem -in leaf_certificate.pem -certfile chain.pem -certfile ca.bundle.pem
```

Convert to base64:
```bash
cat certificate.pfx | base64
```



## Usage
```
import { Connection, Exchange, Queue } from 'react-native-rabbitmq';

const connection = new Connection({
    host: '127.0.0.1',
    port: 5672,
    username: 'user', // Optional
    password: 'password', // Optional
    virtualhost: 'vhost',
    ttl: 10000, // Message time to live
    ssl: true, // Enable ssl connection, make sure the port is 5671 or an other ssl port
    verifyPeer: true, // Whether or not to verify the peer
    pkcs12: '...', // We expect a base64 encoded #pkcs12 file
    pkcs12Password: 'myPassword', // The password used for the #pkc12 file
});

connection.on('error', (event) => console.log('Error connecting to RabbitMQ: ', error));

connection.on('connected', (event) => {
    console.log('YAY! Connected');

    // Create a new Queue 
    const queue = new Queue(connection, {
        name: 'queue_name',
        passive: false,
        durable: true,
        exclusive: false,
        consumer_arguments: {
            'x-priority': 1,
            'x-queue-type': 'classic', // On newer instances of RabbitMQ, the x-queue-type is required
        },
    });

    // Create an exchange 
    const exchange = new Exchange(connection, {
        name: 'exchange_name',
        type: 'direct',
        durable: true,
        autoDelete: false,
        internal: false,
    });

    // Bind the queue on the Exchange
    queue.bind(exchange, 'queue_name');

    // Receive one message when it arrives
    queue.on('message', (data) => {
        console.log('Message received: ', data);
    });

    // Receive all messages send with in a second
    queue.on('messages', (data) => {
        console.log('Messages received within the past second: ', data);
    });
});

if (connection.isConnected()) {
    const message = 'test';
    const routing_key = '';
    const properties = {
    	expiration: 10000,
    }
    exchange.publish(data, routing_key, properties)
}

```
