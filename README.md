# Stream Overlays
Add alert overlays to your stream.

**Disclaimer:** This is still a prototype. You can see the app in action over on my [DeadFixel Twitch channel](https://www.twitch.tv/deadfixel).

## Features
* Twitch Alerts for Follows and Raids
* Testing tools in a dashboard
* Chatbot for commands like ```!uptime```

### Built-in chat commands
| Command           | Meaning                                                   |
| ----------------- | --------------------------------------------------------- |
| ```!danceparty``` | Repeats a random dance emote from the ```commands.json``` |
| ```!so channel``` | Shout out to a channel                                    |
| ```!uptime```     | Shows the current stream runtime                          |

## Outlook
These are some ideas, in no particular order. So take them with a grain of salt.
* More alert types
* Customizable alerts
* Effects on chat messages

## How to use

### Requirements
This tool is written in TypeScript, and runs on a Node.js server. I'm currently using:
* Node.js v15.10.0
* npm 7.5.3

This tool is using the [Twitch EventSub mechanic](https://dev.twitch.tv/docs/eventsub) mechanic, thus we need a publicly available callback URL. I'm using [ngrok](https://ngrok.com/) locally, but feel free to use a tool of your choice, in case you need one.

### Setup
On the server side, you'll need the following config file: ```/server/.env```
```
NGROK_URI=your_callbacl_uri
AUTHORIZE_CALLBACK_URI=your_authorize_callback_uri
SERVICE_TYPE=none
TWITCH_CLIENT_ID=your_twtich_api_client_id
TWITCH_CLIENT_SECRET=your_twitch_api_client_secret
TWITCH_USERNAME=your_twitch_user_to_observe
TWITCH_CHATBOT_LOGIN=your_twitchbot_login
TWITCH_CHATBOT_OAUTH=oauth:your_twitchbot_oauth
SERVER_PORT=your_app_port
```

For the Twitch chat bot, this project relies on [tmi.js](https://github.com/tmijs/tmi.js). All you need to provide a bot login name in the ```.env```, along with an OAuth code, that you can get [here](https://twitchapps.com/tmi/).

The field `SERVICE_TYPE` selects the streaming service, that is being used. Possible values are `twitch`, `youtube` and `none`.

Next to the ```.env``` file, you need to provide a ```/server/commands.json``` file. Emote names in ```dances``` will be used for the ```!danceparty``` command, ```text_commands``` is a collection for static text replacements. You can follow this structure:
```json
{
  "dances" : ["emote_1", "emote_2"],
  "text_commands" : [{
    "command" : "!hello",
    "text" : "Hello world!",
    "roles" : []
  },{
    "command" : "!hello2",
    "text" : "Hello world from someone with more rights!",
    "roles" : ["subscriber", "mod", "broadcaster"]
  }]
}
```

On the client side, you'lld need to adjust the ```/client/src/environments/envrionment.ts``` and ```/client/src/environments/envrionment.prod.ts```. Things to look out for here are the server URLs.

### Start
The ```run.ps1``` script is your starting point.

This will build the Angular app and compile the server code, and then starts the server:
```
...> ./run.ps1 -b
```

If you leave out the option ```-b```, the building part will be skipped, and the application will be started directly.

Of course you can build the Angular app directly through
```
...\client> npm run ng build
```

The server has two commands, ```build_server``` and ```run_server```, which are used in the server directory:
```
...\server> npm run build_server
```

After the server has started, you can find the overlays under ```http://localhost:your_app_port/overlay``` and the dashboard under ```http://localhost:your_app_port/dashboard```.