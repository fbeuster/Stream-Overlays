import axios from 'axios';
import randomstring from 'randomstring';

import { AuthorizationData } from '../interfaces/authorizationData';
import { EventSubSubscription } from '../interfaces/eventSubSubscription';
import { User } from '../interfaces/user';

export class Twitch {
  private HELIX_API = 'https://api.twitch.tv/helix';
  private EVENT_SUB_API = this.HELIX_API + '/eventsub/subscriptions';

  private authorizationData: AuthorizationData;
  private callbackUri: string;
  private clientId: string;
  private clientSecret: string;
  private user: User;
  private webhookSecret: string;

  constructor(clientId: string, clientSecret: string, callbackUri: string) {
    this.callbackUri = callbackUri;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.webhookSecret = randomstring.generate(32);

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

  createEventSubSubscriptionFollow() {
    return new Promise((resolve, reject) => {
      console.log('Create EventSub Subscription...')

      var url = this.EVENT_SUB_API;
      var data = {
        'type': 'channel.follow',
        'version': '1',
        'condition' : {
          'broadcaster_user_id': this.user.id
        },
        'transport' : {
          'method' : 'webhook',
          'callback': this.callbackUri + '/notification',
          'secret' : this.webhookSecret
        }
      }
      var config = {
        headers: this.createRequestHeader()
      }

      axios
        .post<{
          data: EventSubSubscription[],
          total: number,
          limit: number
         }>(url, data, config)
        .then(res => {
          console.log('Listening for followers...');
          resolve('');
        })
        .catch(error => {
          console.log(error);
          reject('');
        });
    });
  }

  createRequestHeader() {
    return {
      'Content-Type': 'application/json',
      'Client-ID': this.clientId,
      'Authorization': 'Bearer ' + this.authorizationData.access_token
    };
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
          headers: this.createRequestHeader()
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

      var url = this.EVENT_SUB_API + '?id=' +id;

      axios
        .delete<any>(url, {
          headers: this.createRequestHeader()
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
          headers: this.createRequestHeader()
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