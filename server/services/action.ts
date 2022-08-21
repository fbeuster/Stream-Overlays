import EventEmitter from 'events';

import { Events } from '../interfaces/events';

import { Light } from '../services/light';
import { TwitchChatbot } from '../services/twitchChabot';

export class Action {
  private chatbot: TwitchChatbot;
  private events: Events;
  private light: Light;
  private stream: EventEmitter;

  constructor(events: Events, stream: EventEmitter, light: Light, chatbot: TwitchChatbot) {
    this.events = events;
    this.light = light;
    this.stream = stream;
    this.chatbot = chatbot;
  }

  public resolveDebug(type: string, event: any) {
    if (type in this.events.debug_events) {
      this.events.debug_events[type].actions.forEach( (action) => {
        if (action.name == 'sound') {
          this.overlay(this.annotateData(type, event, action.data));

        } else if (action.name == 'light') {
          if (action.data.name == 'random') {
            this.lightActionRandom(action.data.value)
          } else if (action.data.name == 'raveparty') {
            this.lightActionRave(action.data.value, 6 / action.data.value, action.data.delay);

          } else {
            this.lightAction(action.data);
          }
        } else if (action.name == 'chatbot') {
          this.chatAction(type, event, action.data);
        }
      });
    }
  }

  public resolveTwitch(type: string, event: any) {
    console.log('Twitch event: ' + type);
    console.log(event);

    if (type in this.events.subscription_events) {

      this.events.subscription_events[type].actions.forEach( (action) => {
        if ('condition_property' in action && 'condition_value' in action) {
          let condition = event;
          let condition_property = action.condition_property || [];

          condition_property.forEach( (property) => {
            condition = condition[property];
          });

          if (condition != action.condition_value) {
            return;
          }
        }

        if (action.name == 'sound') {
          this.overlay(this.annotateData(action.data.name, event, action.data));

        } else if (action.name == 'overlay') {
          this.overlay(this.annotateData(type, event, action.data));

        } else if (action.name == 'light') {
          if (action.data.name == 'random') {
            this.lightActionRandom(action.data.value)
          } else if (action.data.name == 'raveparty') {
            this.lightActionRave(action.data.value, 7.2 / action.data.value, action.data.delay);
          } else {
            this.lightAction(action.data);
          }
        } else if (action.name == 'chatbot') {
          this.chatAction(type, event, action.data);
        }
      });
    }
  }

  private annotateData(type: string, event: any, data: any): any {
    let copy = JSON.parse(JSON.stringify(data));

    Object.keys(copy).forEach((key: string) => {
      if (typeof copy[key] === 'string') {
        copy[key] = copy[key].replace(/\{\{bits\}\}/, event.bits);
        copy[key] = copy[key].replace(/\{\{name\}\}/, event.is_anonymus === false ? 'Anonymous' : event.user_name);
        copy[key] = copy[key].replace(/\{\{raider_name\}\}/, event.from_broadcaster_name);
        copy[key] = copy[key].replace(/\{\{tier\}\}/, event.tier === '3000' ? '3' : (event.tier === '2000' ? '2' : '1'));
        copy[key] = copy[key].replace(/\{\{viewers\}\}/, event.viewers);
      }
    });

    copy.type = type;

    return copy;
  }

  private chatAction(type: string, event: any, data: any) {
    let annotated = this.annotateData(type, event, data);
    let delay = data.delay ? data.delay : 0;
    let repeats = data.repeat ? data.repeat : 1;

    let loop = () => {
      this.chatbot.say(annotated.text);
      repeats--;

      if (repeats > 0) {
        setTimeout(loop, delay * 1000);
      }
    }

    setTimeout(loop, delay * 1000);
  }

  private lightAction(data: any) {
    this.light.addLightCommand(data);
  }

  private lightActionRandom(duration: number) {
    let chars = '0123456789abcdef';
    let color = '#' + chars.charAt(Math.random() * 16) +
                      chars.charAt(Math.random() * 16) +
                      chars.charAt(Math.random() * 16) +
                      chars.charAt(Math.random() * 16) +
                      chars.charAt(Math.random() * 16) +
                      chars.charAt(Math.random() * 16);
    this.light.setColor(color, duration, true);
  }

  private lightActionRave(duration: number, steps: number, delay: number) {
    let chars = '0123456789abcdef';

    for (let i = 0; i < steps; i++) {
      let color = '#' + chars.charAt(Math.random() * 16) +
                        chars.charAt(Math.random() * 16) +
                        chars.charAt(Math.random() * 16) +
                        chars.charAt(Math.random() * 16) +
                        chars.charAt(Math.random() * 16) +
                        chars.charAt(Math.random() * 16);

      this.light.addLightCommand({
        name: 'color',
        value: duration,
        reset: i == steps - 1,
        color: color,
        delay: i == 0 ? delay : 0
      });
    }
  }

  private overlay(data: any) {
    console.log('Sending out for overlay...');
    this.stream.emit('push', 'message', {
      eventType: 'alertbox',
      eventData: data
    });
  }
}