import axios from 'axios';

import { AuthorizationData } from '../interfaces/authorizationData';

export class Twitch {
  private authorizationData: AuthorizationData;
  private clientId: string;
  private clientSecret: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    this.authorizationData = {
      access_token: '',
      refresh_token: '',
      expires_in: 0,
      scope: [],
      token_type: ''
    };
  }

  authorize() {
    return new Promise((resolve, reject) => {
      console.log('Authorize Twitch...');

      var url = 'https://id.twitch.tv/oauth2/token' +
        '?client_id=' + this.clientId +
        '&client_secret=' + this.clientSecret +
        '&grant_type=client_credentials';

      axios
        .post<AuthorizationData>(url)
        .then(res => {
          this.authorizationData.access_token = res.data.access_token;
          this.authorizationData.expires_in = res.data.expires_in;
          this.authorizationData.token_type = res.data.token_type;
          resolve('');
        })
        .catch(error => {
          console.error(error);
          reject('');
        });
    });
  }
}