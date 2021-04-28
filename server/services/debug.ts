import EventEmitter from 'events';

export class Debug {
  constructor() {}

  sendDebugAlert(type: string, stream: EventEmitter) {
    if (type === 'follow') {
      stream.emit('push', 'message', {
        name: 'Dr. Strange',
        type: 'follow'
      });
    }
  }
}