import { NativeModules, NativeEventEmitter } from 'react-native';


const { EventEmitter } = NativeModules;
const RabbitMqConnection = NativeModules.RabbitMqConnection;


export class Connection {
  // Connection state
  connected = false;

  // Constructor
  constructor(config) {
    this.rabbitmqconnection = RabbitMqConnection;

    // Setup the default callbacks
    this.callbacks = {
      'connected': () => this.connected = true,
      'disconnected': () => this.connected = false,
    };

    const RabbitMqEmitter = new NativeEventEmitter(EventEmitter);

    this.subscription = RabbitMqEmitter.addListener('RabbitMqConnectionEvent', this.handleEvent);

    this.rabbitmqconnection.initialize(config);
  }

  isConnected() {
    return this.connected;
  }

  handleEvent = (event) => {
    if (this.callbacks.hasOwnProperty(event.name)) {
      this.callbacks[event.name](event);
    }
  };

  connect() {
    this.rabbitmqconnection.connect();
  }

  close() {
    this.rabbitmqconnection.close();
  }

  clear() {
    this.subscription.remove();
  }

  on(event, callback) {
    this.callbacks[event] = callback;
  }

  removeon(event) {
    delete this.callbacks[event];
  }
}

export default Connection;
