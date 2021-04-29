import EventEmitter from 'events';

export class Debug {
  constructor() {}

  sendDebugAlert(type: string, stream: EventEmitter) {
    if (type === 'follow') {
      stream.emit('push', 'message', {
        name: 'Dr. Strange',
        viewers: 0,
        type: 'follow'
      });
    }
    if (type === 'raid') {
      stream.emit('push', 'message', {
        name: 'Hulk',
        viewers: 1337,
        type: 'raid'
      });
    }
  }
}