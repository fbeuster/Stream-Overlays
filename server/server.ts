import axios from 'axios';
import express from 'express';

export default class Server {
  private app: express.Application;
  private port: string;

  constructor() {
    this.port = '';

    this.app = express();
  }

  public listen(port: any): void {
    this.port = port;

    this.app.listen(port, async() => {
      console.log('Listening for requests...');
    });
  }
}

const server = new Server();
server.listen(3080);