# Stream Overlays
Add alert overlays to your stream.

**Disclaimer:** This is still a prototype. You can see the app in action over on my [DeadFixel Twitch channel](https://www.twitch.tv/deadfixel).

## Features
* Twitch Alerts for Follows and Raids
* Testing tools in a dashboard

### Outlook
* More alert types
* Customizable alerts
* Chatbot
* Effects on chat messages

## How to use

### Requirements
This tool is written in TypeScript, and runs on a Node.js server. I'm currently using:
* Node.js v15.10.0
* npm 7.5.3

This tool is using the [Twitch EventSub mechanic](https://dev.twitch.tv/docs/eventsub) mechanic, thus we need a publicly available callback URL. I'm using [ngrok](https://ngrok.com/) locally, but feel free to use a tool of your choice.

### Setup
On the server side, you'll need the following config file: ```/server/.env```
```
NGROK_URI=your_callbacl_uri
TWITCH_CLIENT_ID=your_twtich_api_client_id
TWITCH_CLIENT_SECRET=your_twitch_api_client_secret
TWITCH_USERNAME=your_twitch_user_to_observe
SERVER_PORT=your_app_port
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

After the server has started, you can find the overlays under ```http://localhost:3081/overlay``` and the dashboard under ```http://localhost:3081/dashboard```.