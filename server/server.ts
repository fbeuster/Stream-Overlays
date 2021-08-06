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
      process.env.NGROK_URI ?? '');

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
          if (req.body.subscription.type === 'channel.follow') {
            this.light.addLightCommand({
              name: 'brightnessFlash',
              value: 3,
              reset: true
            });
            this.stream.emit('push', 'message', {
              name: req.body.event.user_name,
              viewers: 0,
              type: 'follow'
            });
          } else {
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