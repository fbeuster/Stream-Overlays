import tmi from 'tmi.js';

import commands from '../../commands.json';

import { User } from '../../interfaces/user';
import { Stream } from '../../interfaces/stream';

import { Twitch } from '../twitch';
import { Chatbot } from './chatbot';

export class TwitchChatbot implements Chatbot {
  private client: tmi.Client;
  private target_channel: string;
  private twitch: Twitch;

  constructor(bot_login: string, bot_password: string, target_channel: string, twitch: Twitch) {
    this.client = new tmi.Client({
      options : {
        debug: true,
        messagesLogLevel: 'info'
      },
      connection: {
        reconnect: true,
        secure: true
      },
      identity: {
        username: bot_login,
        password: bot_password
      },
      channels: [target_channel]
    });

    this.client
        .connect()
        .then(() => this.scheduleRepeatedTextCommands())
        .catch(console.error);
    this.client.on('message', this.onMessage);

    this.target_channel = target_channel;
    this.twitch = twitch;
  }

  scheduleRepeatedTextCommands() {
    commands.repeated_text_commands.forEach((command) => {
      let command_interval = command.interval * 1000;
      let command_function = () => {
        let j = Math.floor(Math.random() * command.texts.length);
        this.client.say(this.target_channel, command.texts[j]);

        setTimeout(function() {
          command_function();
        }, command_interval);
      };

      setTimeout(() => {
        command_function();
      }, command_interval);
    });

  }

  formatPlural(word: string, count: number): string
  {
    return count === 1 ? word : word + 's';
  }

  handleShoutOut(tags: tmi.ChatUserstate, username: string) {
    if (!this.isRequirementMet(tags, ['broadcaster', 'mod', 'subscriber'])) {
      return;
    }

    Promise.resolve(this.twitch.getUserByUsername(username))
      .then((user: User) => {
        Promise.resolve(this.twitch.getStreamByUsername(user.login))
          .then((stream: Stream) => {
            this.client.say(this.target_channel, `Shoutout to ${user.display_name}, check them out at https://twitch.tv/${user.login} playing some ${stream.game_name}. Ghost`);
          })
          .catch((error) => {
            this.client.say(this.target_channel, `Shoutout to ${user.display_name}, check them out at https://twitch.tv/${user.login}. Ghost`);
            console.error(error);
          });
      })
      .catch((error) => {
        this.client.say(this.target_channel, `Shoutout to ${username} Ghost!`);
        console.error(error);
      });
  }

  handleTextCommands(tags: tmi.ChatUserstate, message: string): boolean {
    for (var i = 0; i < commands.text_commands.length; i++) {
      var text_command = commands.text_commands[i];
      if (text_command.command === message) {
        if (this.isRequirementMet(tags, text_command.roles)) {
          this.client.say(this.target_channel, text_command.text);
          return true;
        }
      }
    }

    return false;
  }

  handleRandomTextCommands(tags: tmi.ChatUserstate, message: string): boolean {
    for (var i = 0; i < commands.random_text_commands.length; i++) {
      var text_command = commands.random_text_commands[i];
      if (text_command.command === message) {
        if (this.isRequirementMet(tags, text_command.roles)) {
          var j = Math.floor(Math.random() * text_command.texts.length);
          var message = text_command.texts[j] + ' ';
          this.client.say(this.target_channel, message.repeat(text_command.repeat));
          return true;
        }
      }
    }

    return false;
  }

  handleUptime() {
    Promise.resolve(this.twitch.getStreamByUsername(this.twitch.getUser().login))
      .then((stream: Stream) => {
        var date_start = Date.parse(stream.started_at);
        var date_now = Date.now();
        var diff = date_now - date_start;
        var diff_s = Math.floor(diff / 1000);
        var diff_m = Math.floor(diff / (1000 * 60));
        var diff_h = Math.floor(diff / (1000 * 60 * 60));
        var time = '';

        if (diff_h > 0) {
          time = time + diff_h + this.formatPlural(' hour', diff_h) + ' ';
        }
        if (diff_m > 0) {
          time = time + (diff_m % 60) + this.formatPlural(' minute', diff_m % 60) + ' and ';
        }
        time = time + (diff_s % 60) + this.formatPlural(' second', diff_s % 60);

        this.client.say(this.target_channel, `${this.twitch.getUser().display_name} is streaming for ${time}. catDance`);
      })
      .catch((error) => {
        this.client.say(this.target_channel, `${this.twitch.getUser().display_name} is not streaming right now. ThisIsFine`);
      });
  }

  isRequirementMet(tags: tmi.ChatUserstate, roles: string[]): boolean {
    if (roles.length === 0) {
      return true;
    }

    if (typeof tags === 'undefined') {
      return false;
    }

    return typeof tags.badges !== 'undefined'
            && (this.meetsRequirement(tags.badges, roles, 'subscriber')
                || this.meetsRequirement(tags.badges, roles, 'mod')
                || this.meetsRequirement(tags.badges, roles, 'broadcaster'));
  }

  meetsRequirement(badges: tmi.Badges, roles: string[], role: string): boolean {
    return badges && role in badges && badges[role] === '1';
  }

  onMessage = (channel: string, tags: tmi.ChatUserstate, message: string, self: boolean) => {
    if (message.indexOf('!') !== 0) {
      return;
    }

    if (this.handleRandomTextCommands(tags, message)) {
      return;
    }

    if (this.handleTextCommands(tags, message)) {
      return;
    }

    if (message === '!uptime') {
      this.handleUptime();
      return;
    }

    var message_command = message.split(/\s(.+)/)[0];
    var message_values = message.split(/\s(.+)/)[1];

    if (message_command === '!so') {
      this.handleShoutOut(tags, message_values);
      return;
    }
  }

  public say(text: string) {
    this.client.say(this.target_channel, text);
  }
}