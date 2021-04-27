import axios from 'axios';
import bodyParser from 'body-parser';
import express from 'express';
import dotenv from 'dotenv';
import EventEmitter from 'events';

import { Twitch } from './services/twitch';

export default class Server {
  private app: express.Application;
  private port: string;
  private stream: EventEmitter;
  private twitch: Twitch;

  constructor() {
    dotenv.config();

    this.port = '';

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
  }

  public listen(port: any): void {
    this.port = port;

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
          this.stream.emit('push', 'message', {
            name: req.body.event.user_name,
            type: 'follow'
          });
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
        .then(() => this.twitch.createEventSubSubscriptionFollow())
        .then(() => console.log('Done for now.'));

      console.log('Listening for requests...');
    });
  }
}

const server = new Server();
server.listen(process.env.SERVER_PORT ?? 3080);