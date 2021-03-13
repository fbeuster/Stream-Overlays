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

    this.app = express();
    this.twitch = new Twitch(
      process.env.TWITCH_CLIENT_ID ?? '',
      process.env.TWITCH_CLIENT_SECRET ?? '');
  }

  public listen(port: any): void {
    this.port = port;

    this.app.listen(port, async() => {
      console.log('Listening for requests...');

      Promise.resolve(this.twitch.authorize())
        .then(() => this.twitch.deleteAllEventSubSubscriptions())
        .then(() => this.twitch.getUserByUsername(process.env.TWITCH_USERNAME ?? ''))
        .then(() => console.log('Done for now.'));
    });
  }
}

const server = new Server();
server.listen(3080);