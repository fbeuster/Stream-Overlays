import axios from 'axios';

import { AuthorizationData } from '../interfaces/authorizationData';
import { EventSubSubscription } from '../interfaces/eventSubSubscription';
import { User } from '../interfaces/user';

export class Twitch {
  private HELIX_API = 'https://api.twitch.tv/helix';

  private authorizationData: AuthorizationData;
  private clientId: string;
  private clientSecret: string;
  private user: User;

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

    this.user = {
      id: '',
      login: '',
      display_name: '',
      type: '',
      broadcaster_type: '',
      description: '',
      profile_image_url: '',
      offline_image_url: '',
      view_count: 0,
      email: '',
      created_at: ''
    }
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

  deleteAllEventSubSubscriptions() {
    return new Promise((resolve, reject) => {
      console.log('Getting subscriptions...');

      var url = this.HELIX_API + '/eventsub/subscriptions';

      axios
        .get<{
          data: EventSubSubscription[],
          total: number,
          limit: number,
          pagination: any
        }>(url, {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': 'Bearer ' + this.authorizationData.access_token
          }
        })
        .then(res => {
          if (res.data.total == 0) {
            console.log('No subscriptions found');
            resolve('');

          } else {
            let promises:Array<any> = [];
            res.data.data.forEach(subscription => {
              promises.push(this.deleteEventSubSubscription(subscription.id));
            });

            Promise.all(promises).then(() => {
              resolve('');
            })
          }
        })
        .catch(error => {
          console.error(error);
          reject('');
        });
    });
  }

  deleteEventSubSubscription(id: string) {
    return new Promise((resolve, reject) => {
      console.log('Deleting subscription ' + id + '...');

      var url = this.HELIX_API + '/eventsub/subscriptions?id=' + id;

      axios
        .delete<any>(url, {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': 'Bearer ' + this.authorizationData.access_token
          }
        })
        .then(res => {
          console.log('Deleted');
          resolve('');
        })
        .catch(error => {
          console.error(error);
          reject('');
        });
    });
  }

  getUserByUsername(username: string) {
    return new Promise((resolve, reject) => {
      console.log('Get user ' + username + '...');

      var url = this.HELIX_API + '/users?login=' + username;

      axios
        .get<{
          data: User[]
        }>(url, {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': 'Bearer ' + this.authorizationData.access_token
          }
        })
        .then(res => {
          if (res.data.data.length !== 1) {
            console.log('User ' + username + ' not found.');
            reject('');

          } else {
            this.user = res.data.data[0];
            resolve('');
          }
        })
        .catch(error => {
          console.error(error);
          reject('');
        });
    });
  }
}