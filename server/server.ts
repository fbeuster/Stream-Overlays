import axios from 'axios';
import express from 'express';
import dotenv from 'dotenv';

import { Twitch } from './services/twitch';

export default class Server {
  private app: express.Application;
  private port: string;
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
  }

  public listen(port: any): void {
    this.port = port;

    this.app.get('/', (req,res) => {
      res.sendFile(process.cwd() + '/../client/dist/client/index.html');
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