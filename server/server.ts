import axios from 'axios';
import bodyParser from 'body-parser';
import express from 'express';
import dotenv from 'dotenv';
import EventEmitter from 'events';

import { LightCommand } from './interfaces/lightCommand';
import { User } from './interfaces/user';

import { Debug } from './services/debug';
import { Light } from './services/light';
import { Twitch } from './services/twitch';
import { TwitchChatbot } from './services/twitchChabot';

export default class Server {
  private app: express.Application;
  private debug: Debug;
  private port: string;
  private stream: EventEmitter;
  private twitch: Twitch;
  private chatbot: TwitchChatbot;
  private light: Light;

  constructor() {
    dotenv.config();

    this.port = '';

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

    this.chatbot = new TwitchChatbot(
                        process.env.TWITCH_CHATBOT_LOGIN ?? '',
                        process.env.TWITCH_CHATBOT_OAUTH ?? '',
                        process.env.TWITCH_USERNAME ?? '',
                        this.twitch);

    this.light = new Light();
  }

  public listen(port: any): void {
    this.port = port;

    this.app.get('/authorize', (req,res) => {
      Promise.resolve(this.twitch.authorizeUser(req.query.code, req.query.scope))
        .then(() => this.twitch.createEventSubSubscriptionSubscribe())
        .then(() => this.twitch.createEventSubSubscriptionCheer())
        .then(() => this.twitch.createEventSubSubscriptionPointsRedemption())
        .then(() => console.log('Done for now.'));
      res.send('Ok')
    });

    this.app.get('/commands', (req, res) => {
      if (req.query.debug && typeof req.query.debug == 'string') {
        this.debug.sendDebugAlert(req.query.debug, this.stream);
      }
      res.send('Ok')
    });

    this.app.get('/events', (req, res) => {
      console.log('Client has connected');
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
          if (req.body.subscription.type === 'channel.cheer') {
            let name: string = req.body.event.is_anonymus === false ? 'Anonymous' : req.body.event.user_name;

            this.stream.emit('push', 'message', {
              name: name,
              bits: req.body.event.bits,
              type: 'cheer'
            });

          } else if (req.body.subscription.type === 'channel.follow') {
            this.light.addLightCommand({
              name: 'brightnessFlash',
              value: 3,
              reset: true
            });
            this.stream.emit('push', 'message', {
              name: req.body.event.user_name,
              type: 'follow'
            });

          } else if (req.body.subscription.type === 'channel.channel_points_custom_reward_redemption.add') {
            if (req.body.event.reward.cost === 128) {
              let chars = '0123456789abcdef';
              let color = '#' + chars.charAt(Math.random() * 16) + chars.charAt(Math.random() * 16) + chars.charAt(Math.random() * 16) + chars.charAt(Math.random() * 16) + chars.charAt(Math.random() * 16) + chars.charAt(Math.random() * 16);
              this.light.setColor(color, 5);
            }

          } else if (req.body.subscription.type === 'channel.raid') {
            this.light.addLightCommand({
              name: 'redAlert',
              value: 5,
              reset: true
            });
            this.stream.emit('push', 'message', {
              name: req.body.event.from_broadcaster_user_name,
              viewers: req.body.event.viewers,
              type: 'raid'
            });

          } else if (req.body.subscription.type === 'channel.subscribe') {
            if (req.body.event.is_gift === false) {
              let tier: string = req.body.event.tier;

              if (tier === '3000') {
                tier = '3';
              } else if (tier === '2000') {
                tier = '2';
              } else {
                tier = '1';
              }


              this.stream.emit('push', 'message', {
                name: req.body.event.user_name,
                tier: tier,
                type: 'sub'
              });

              this.chatbot.say(`Hey ${req.body.event.user_name}, thanks a lot for subscribing! <3`);
            }

          } else if (req.body.subscription.type === 'channel.subscription.gift') {
            let name: string = req.body.event.is_anonymous === false ? req.body.event.from_broadcaster_user_name : 'Anonymous';
            let tier: string = req.body.event.tier;

            if (tier === '3000') {
              tier = '3';
            } else if (tier === '2000') {
              tier = '2';
            } else {
              tier = '1';
            }


            this.stream.emit('push', 'message', {
              name: req.body.event.user_name,
              tier: tier,
              gifted: req.body.event.total,
              type: 'subGift'
            });

            this.chatbot.say(`Hey ${name}, thank you sou much for gifting ${req.body.event.total} to the community! <3`);
          } else {
          }
          res.send('Ok')
        }
      }
    });

    this.app.get('/*', (req,res) => {
      res.sendFile('index.html', { root: process.cwd() + '/../client/dist/client'});
    });

    this.app.listen(port, async() => {
      Promise.resolve(this.twitch.authorize())
        .then(() => this.twitch.deleteAllEventSubSubscriptions())
        .then(() => this.twitch.getUserByUsername(process.env.TWITCH_USERNAME ?? ''))
        .then((user: User) => this.twitch.setUser(user))
        .then(() => this.twitch.createEventSubSubscriptionFollow())
        .then(() => this.twitch.createEventSubSubscriptionRaid())
        .then(() => console.log('Done for now.'));

      console.log('Listening for requests...');
    });
  }
}

const server = new Server();
server.listen(process.env.SERVER_PORT ?? 3080);