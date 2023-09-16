import axios from 'axios';
import bodyParser from 'body-parser';
import express from 'express';
import dotenv from 'dotenv';
import EventEmitter from 'events';

import events from './events.json';

import { Events } from './interfaces/events';
import { LightCommand } from './interfaces/lightCommand';
import { User } from './interfaces/user';

import { Action } from './services/action';
import { Debug } from './services/debug';
import { Light } from './services/light';
import { Twitch } from './services/twitch';
import { TwitchChatbot } from './services/chatbot/twitchChabot';
import { ServiceType } from './typings/services';
import { Chatbot } from './services/chatbot/chatbot';
import { VoidChatbot } from './services/chatbot/defaultChatbot';

export default class Server {
  private app: express.Application;
  private debug: Debug;
  private port: string;
  private stream: EventEmitter;
  private twitch: Twitch;
  private chatbot: Chatbot;
  private light: Light;
  private action: Action;
  private events: Events;
  private serviceType: ServiceType;

  constructor() {
    dotenv.config();

    this.serviceType = process.env.SERVICE_TYPE as ServiceType ?? ServiceType.None;

    this.port = '';

    this.light = new Light();

    this.debug = new Debug();

    this.twitch = new Twitch(
      process.env.TWITCH_CLIENT_ID ?? '',
      process.env.TWITCH_CLIENT_SECRET ?? '',
      process.env.NGROK_URI ?? '',
      process.env.AUTHORIZE_CALLBACK_URI ?? '');

    this.app = express();
    this.app.use(express.static(process.cwd() + '/../client/dist/client/'));
    this.app.use(bodyParser.json({
      verify: (req, res, buf) => {
          req.rawBody = buf;
      }
    }));

    this.stream = new EventEmitter();

    switch (this.serviceType) {
      case ServiceType.Twitch:
        this.chatbot = new TwitchChatbot(
          process.env.TWITCH_CHATBOT_LOGIN ?? '',
          process.env.TWITCH_CHATBOT_OAUTH ?? '',
          process.env.TWITCH_USERNAME ?? '',
          this.twitch);
        break;
      default:
        this.chatbot = new VoidChatbot();
    }

    this.events = events;
    this.action = new Action(this.events, this.stream, this.light, this.chatbot, this.twitch);
  }

  public listen(port: any): void {
    this.port = port;

    this.app.get('/api/subs', (req, res) => {
      console.log('Client has connected to /api/subs' );
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      });

      this.stream.on('push', (event, data) => {
        res.write('event: ' + String(event) + '\n' + 'data: ' + JSON.stringify(data) + '\n\n')
      });

      let refreshSubs = () => {
        if (!this.twitch.isAuthorized()) {
          return;
        }

        this.twitch.getSubscriptions()
          .then((subscriptionData) => {
            this.stream.emit('push', 'message', {
              eventType: 'subscriptions',
              eventData: subscriptionData
            });
          })
          .catch((error) => {
            console.log('Some error occurred during the request.');
            console.log(error);
          });
      }

      let loopRefreshSubs = () => {
        refreshSubs();

        setTimeout(() => {
          loopRefreshSubs();
        }, 2 * 60 * 1000);
      };

      loopRefreshSubs();
    });

    this.app.get('/authorize', (req,res) => {
      Promise.resolve(this.twitch.authorizeUser(req.query.code, req.query.scope))
        .then(() => this.twitch.createEventSubSubscriptionSubscribe())
        .then(() => this.twitch.createEventSubSubscriptionSubscriptionGift())
        .then(() => this.twitch.createEventSubSubscriptionSubscriptionMessage())
        .then(() => this.twitch.createEventSubSubscriptionCheer())
        .then(() => this.twitch.createEventSubSubscriptionPointsRedemption())
        .then(() => console.log('Done for now.'));
      res.send('Ok')
    });

    this.app.get('/commands', (req, res) => {
      if (req.query.debug && typeof req.query.debug == 'string') {
        this.debug.sendDebugAlert(req.query.debug, this.stream);

        this.action.resolveDebug(req.query.debug, {});
      }

      res.send('Ok')
    });

    this.app.get('/events', (req, res) => {
      console.log('Client has connected to /events');
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      });

      this.stream.on('push', (event, data) => {
        res.write('event: ' + String(event) + '\n' + 'data: ' + JSON.stringify(data) + '\n\n')
      });
    });

    this.app.put('/light', (req,res) => {
      let command: LightCommand = req.body;
      this.light.addLightCommand(command);
      res.send('Ok');
    });

    this.app.post('/notification', (req, res) => {
      if (!this.twitch.verifySignature(
            req.header('Twitch-Eventsub-Message-Signature') ?? '',
            req.header('Twitch-Eventsub-Message-Id') ?? '',
            req.header('Twitch-Eventsub-Message-Timestamp') ?? '',
            req.rawBody)) {
        res.status(403).send('Forbidden');

      } else {
        if (req.header('Twitch-Eventsub-Message-Type') === 'webhook_callback_verification') {
          res.send(req.body.challenge);

        } else {
          this.action.resolveTwitch(req.body.subscription.type, req.body.event);

          if (req.body.subscription.type === 'channel.subscription.gift' ) {
            let name: string = req.body.event.is_anonymous === false ? req.body.event.user_name : 'Anonymous';
            let tier: string = req.body.event.tier;

            if (tier === '3000') {
              tier = '3';
            } else if (tier === '2000') {
              tier = '2';
            } else {
              tier = '1';
            }


            this.stream.emit('push', 'message', {
              eventType: 'alertbox',
              eventData: {
                name: req.body.event.user_name,
                tier: tier,
                gifted: req.body.event.total,
                type: 'subGift'
              }
            });

            this.chatbot.say(`Hey ${name}, thank you sou much for gifting ${req.body.event.total} to the community! <3`);

            this.twitch.getSubscriptions()
              .then((subscriptionData) => {
                console.log(subscriptionData);
                this.stream.emit('push', 'message', {
                  eventType: 'subscriptions',
                  eventData: subscriptionData
                });
              });
          }

          res.send('Ok')
        }
      }
    });

    this.app.get('/*', (req,res) => {
      res.sendFile('index.html', { root: process.cwd() + '/../client/dist/client' });
    });

    this.app.listen(port, async() => {
      if (this.serviceType === ServiceType.Twitch) {
        Promise.resolve(this.twitch.authorize())
          .then(() => this.twitch.deleteAllEventSubSubscriptions())
          .then(() => this.twitch.getUserByUsername(process.env.TWITCH_USERNAME ?? ''))
          .then((user: User) => this.twitch.setUser(user))
          .then(() => this.twitch.createEventSubSubscriptionFollow())
          .then(() => this.twitch.createEventSubSubscriptionRaid())
          .then(() => console.log('Done for now.'))
          .catch((error) => {
            console.log(error);
          });
      }

      console.log('Listening for requests...');
    });
  }
}

const server = new Server();
server.listen(process.env.SERVER_PORT ?? 3080);