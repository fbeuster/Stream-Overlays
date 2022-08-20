import EventEmitter from 'events';

export class Debug {
  constructor() {}

  sendDebugAlert(type: string, stream: EventEmitter) {
    if (type === 'follow') {
      stream.emit('push', 'message', {
        name: 'Dr. Strange',
        type: 'channel.follow'
      });
    }
    if (type === 'raid') {
      stream.emit('push', 'message', {
        name: 'Hulk',
        viewers: 1337,
        type: 'channel.raid'
      });
    }
    if (type === 'sub1') {
      stream.emit('push', 'message', {
        name: 'Iron Man',
        tier: 1,
        type: 'channel.subscribe'
      });
    }
    if (type === 'sub2') {
      stream.emit('push', 'message', {
        name: 'Iron Man',
        tier: 2,
        type: 'channel.subscribe'
      });
    }
    if (type === 'sub3') {
      stream.emit('push', 'message', {
        name: 'Iron Man',
        tier: 3,
        type: 'channel.subscribe'
      });
    }
    if (type === 'subGift') {
      stream.emit('push', 'message', {
        name: 'Thor',
        tier: 1,
        gifted: 100,
        type: 'channel.subscription.gift'
      });
    }
    if (type === 'cheer') {
      stream.emit('push', 'message', {
        name: 'Black Widow',
        bits: 1000,
        type: 'channel.cheer'
      });
    }
  }
}