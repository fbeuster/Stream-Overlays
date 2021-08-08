import EventEmitter from 'events';

export class Debug {
  constructor() {}

  sendDebugAlert(type: string, stream: EventEmitter) {
    if (type === 'follow') {
      stream.emit('push', 'message', {
        name: 'Dr. Strange',
        viewers: 0,
        value2: 0,
        type: 'follow'
      });
    }
    if (type === 'raid') {
      stream.emit('push', 'message', {
        name: 'Hulk',
        viewers: 1337,
        value2: 0,
        type: 'raid'
      });
    }
    if (type === 'sub1') {
      stream.emit('push', 'message', {
        name: 'Iron Man',
        viewers: 1,
        value2: 0,
        type: 'sub'
      });
    }
    if (type === 'sub2') {
      stream.emit('push', 'message', {
        name: 'Iron Man',
        viewers: 2,
        value2: 0,
        type: 'sub'
      });
    }
    if (type === 'sub3') {
      stream.emit('push', 'message', {
        name: 'Iron Man',
        viewers: 3,
        value2: 0,
        type: 'sub'
      });
    }
    if (type === 'subGift') {
      stream.emit('push', 'message', {
        name: 'Thor',
        viewers: 1,
        value2: 100,
        type: 'subGift'
      });
    }
    if (type === 'cheer') {
      stream.emit('push', 'message', {
        name: 'Black Widow',
        viewers: 1000,
        value2: 0,
        type: 'cheer'
      });
    }
  }
}