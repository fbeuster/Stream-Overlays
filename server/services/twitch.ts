import axios from 'axios';
import crypto from 'crypto';
import randomstring from 'randomstring';

import { AuthorizationData } from '../interfaces/authorizationData';
import { EventSubSubscription } from '../interfaces/eventSubSubscription';
import { Stream } from '../interfaces/stream';
import { Subscriptions } from '../interfaces/subscriptions';
import { User } from '../interfaces/user';

export class Twitch {
  private HELIX_API = 'https://api.twitch.tv/helix';
  private EVENT_SUB_API = this.HELIX_API + '/eventsub/subscriptions';

  private authenticatedUser: User;
  private authorizationData: AuthorizationData;
  private authorizationDataUser: AuthorizationData;
  private authorizeCallbackUri: string;
  private callbackUri: string;
  private clientId: string;
  private clientSecret: string;
  private user: User;
  private webhookSecret: string;

  constructor(clientId: string, clientSecret: string, callbackUri: string, authorizeCallbackUri: string) {
    this.authorizeCallbackUri = authorizeCallbackUri;
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

    this.authorizationDataUser = {
      access_token: '',
      refresh_token: '',
      expires_in: 0,
      scope: [],
      token_type: ''
    };

    this.authenticatedUser = {
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
      console.log('Authorize app at Twitch...');

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

  authorizeUser(code: any, scope: any) {
    return new Promise((resolve, reject) => {
      console.log('Authorize user at Twitch...');

      var url = 'https://id.twitch.tv/oauth2/token' +
        '?client_id=' + this.clientId +
        '&client_secret=' + this.clientSecret +
        '&code=' + code +
        '&grant_type=authorization_code' +
        '&scope=' + scope +
        '&redirect_uri=' + this.authorizeCallbackUri;

      axios
        .post<AuthorizationData>(url)
        .then(res => {
          this.authorizationDataUser.access_token = res.data.access_token;
          this.authorizationDataUser.expires_in = res.data.expires_in;
          this.authorizationDataUser.token_type = res.data.token_type;
          resolve('');
        })
        .catch(error => {
          console.error(error);
          reject('');
        });
    });
  }

  createEventSubSubscriptionCheer() {
    return new Promise((resolve, reject) => {
      console.log('Create EventSub subscription for cheers...')

      var url = this.EVENT_SUB_API;
      var data = {
        'type': 'channel.cheer',
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
          console.log('Listening for cheers...');
          resolve('');
        })
        .catch(error => {
          console.log(error);
          reject('');
        });
    });
  }

  createEventSubSubscriptionFollow() {
    return new Promise((resolve, reject) => {
      console.log('Create EventSub subscription for followers...');

      var url = this.EVENT_SUB_API;
      var data = {
        'type': 'channel.follow',
        'version': '2',
        'condition' : {
          'broadcaster_user_id': this.user.id,
          'moderator_user_id': this.authenticatedUser.id
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

  createEventSubSubscriptionPointsRedemption() {
    return new Promise((resolve, reject) => {
      console.log('Create EventSub subscription for channel point redemptions...')

      var url = this.EVENT_SUB_API;
      var data = {
        'type': 'channel.channel_points_custom_reward_redemption.add',
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
          console.log('Listening for channel point redemptions...');
          resolve('');
        })
        .catch(error => {
          console.log(error);
          reject('');
        });
    });
  }

  createEventSubSubscriptionRaid() {
    return new Promise((resolve, reject) => {
      console.log('Create EventSub subscription for raids...')

      var url = this.EVENT_SUB_API;
      var data = {
        'type': 'channel.raid',
        'version': '1',
        'condition' : {
          'to_broadcaster_user_id': this.user.id
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
          console.log('Listening for raids...');
          resolve('');
        })
        .catch(error => {
          console.log(error);
          reject('');
        });
    });
  }

  createEventSubSubscriptionSubscribe() {
    return new Promise((resolve, reject) => {
      console.log('Create EventSub subscription for subscriptions...')

      var url = this.EVENT_SUB_API;
      var data = {
        'type': 'channel.subscribe',
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
          console.log('Listening for subscriptions...');
          resolve('');
        })
        .catch(error => {
          console.log(error);
          reject('');
        });
    });
  }

  createEventSubSubscriptionSubscriptionGift() {
    return new Promise((resolve, reject) => {
      console.log('Create EventSub subscription for gifted subscriptions...')

      var url = this.EVENT_SUB_API;
      var data = {
        'type': 'channel.subscription.gift',
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
          console.log('Listening for gift subscriptions...');
          resolve('');
        })
        .catch(error => {
          console.log(error);
          reject('');
        });
    });
  }

  createEventSubSubscriptionSubscriptionMessage() {
    return new Promise((resolve, reject) => {
      console.log('Create EventSub subscription for continued subscriptions...')

      var url = this.EVENT_SUB_API;
      var data = {
        'type': 'channel.subscription.message',
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
          console.log('Listening for continued subscriptions...');
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

  createRequestHeaderAuthorized() {
    return {
      'Content-Type': 'application/json',
      'Client-ID': this.clientId,
      'Authorization': 'Bearer ' + this.authorizationDataUser.access_token
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

  getStreamByUsername(username: string): Promise<Stream> {
    return new Promise((resolve, reject) => {
      console.log('Get user ' + username + '...');

      var url = this.HELIX_API + '/streams?user_login=' + username;

      axios
        .get<{
          data: Stream[]
        }>(url, {
          headers: this.createRequestHeader()
        })
        .then(res => {
          if (res.data.data.length === 0) {
            console.log('No streams found for ' + username + '.');
            reject(null);

          } else {
            resolve(res.data.data[0]);
          }
        })
        .catch(error => {
          console.error(error);
          reject(null);
        });
    });
  }

  getSubscriptions(): Promise<Subscriptions> {
    return new Promise((resolve, reject) => {
      console.log('Get subscriptions for ' + this.user.id + '...');

      var url = this.HELIX_API + '/subscriptions?broadcaster_id=' + this.user.id;

      axios.get<Subscriptions>(url, {
        headers: this.createRequestHeaderAuthorized()
      })
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        console.error(error);
        reject(null);
      })
    });
  }

  getUserByToken(): Promise<User> {
    return new Promise((resolve, reject) => {
      console.log('Get authenticated user...');

      var url = this.HELIX_API + '/users';

      axios
        .get<{
          data: User[]
        }>(url, {
          headers: this.createRequestHeaderAuthorized()
        })
        .then(res => {
          if (res.data.data.length !== 1) {
            console.log('User not found.');
            reject(null);

          } else {
            resolve(res.data.data[0]);
          }
        })
        .catch(error => {
          console.error(error);
          reject(null);
        });
    });
  }

  getUserByUsername(username: string): Promise<User> {
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
            reject(null);

          } else {
            resolve(res.data.data[0]);
          }
        })
        .catch(error => {
          console.error(error);
          reject(null);
        });
    });
  }

  getUser(): User {
    return this.user;
  }

  isAuthorized(): boolean {
    return this.authorizationDataUser.access_token !== '';
  }

  setAuthenticatedUser(user: User) {
    this.authenticatedUser = user;
  }

  setUser(user: User) {
    this.user = user;
  }

  verifySignature(
    messageSignature: string, messageID: string,
    messageTimestamp: string, body: string): boolean {
    let message = messageID + messageTimestamp + body;
    let signature = crypto.createHmac('sha256', this.webhookSecret).update(message);
    let expectedSignatureHeader = 'sha256=' + signature.digest('hex');
    return expectedSignatureHeader === messageSignature
  }
}