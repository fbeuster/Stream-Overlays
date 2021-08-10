import axios from 'axios';
import { BehaviorSubject } from 'rxjs';
import { ElgatoLight } from '../interfaces/elgatoLight';
import { ElgatoLights } from '../interfaces/elgatoLights';
import { ElgatoLightMap } from '../interfaces/elgatoLightMap';
import { LightCommand } from '../interfaces/lightCommand';

export class LightManager {
  light_port = '9123';
  light_path = '/elgato/lights';
  state: ElgatoLightMap = {};
  original_state: ElgatoLightMap = {};
  stateSubject: BehaviorSubject<ElgatoLightMap>;

  constructor() {
    this.stateSubject = new BehaviorSubject(this.state);
  }

  public addLight(ip: string) {
    console.log('Adding light ' + ip);

    Promise.resolve(this.getLight(ip))
      .then((data) => {
        this.state[ip] = data.lights[0];
        this.original_state[ip] = data.lights[0];

        let light = this.stateSubject.subscribe(state => {
          let lights: ElgatoLight[] = [];
          lights.push(state[ip]);

          Promise.resolve(this.putLight(ip, {
            numberOfLights: 1,
            lights: lights
          }))
          .then(() => {})
          .catch(() => { console.error('error'); })
        });
      });
  }

  getLight(ip: string): Promise<ElgatoLights> {
    return new Promise((resolve, reject) => {
      let url = 'http://' + ip + ':' + this.light_port + this.light_path;

      axios
        .get<ElgatoLights>(url, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(res => {
          resolve(res.data);
        })
        .catch(error => {
          console.error(error);
          reject(null);
        });
    });
  }

  public getState(): ElgatoLightMap {
    return JSON.parse(JSON.stringify(this.state));
  }

  putLight(ip: string, value: ElgatoLights): Promise<ElgatoLights> {
    return new Promise((resolve, reject) => {
      let url = 'http://' + ip + ':' + this.light_port + this.light_path;

      axios
        .put<ElgatoLights>(url, value, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(res => {
          resolve(res.data);
        })
        .catch(error => {
          console.error(error);
          reject(null);
        });
    });
  }

  public reset() {
    this.state = JSON.parse(JSON.stringify(this.original_state));
    this.stateSubject.next(this.original_state);
  }

  public setState(state: ElgatoLightMap) {
    this.state = JSON.parse(JSON.stringify(state));
    this.stateSubject.next(this.state);
  }

  public setStateWithReset(state: ElgatoLightMap, resetAfter: number) {
    this.stateSubject.next(state);

    setTimeout(() => {
      this.stateSubject.next(this.state);
    }, resetAfter);
  }
}

export class Light {
  light_ips = ['192.168.0.148', '192.168.0.150'];
  lightManager: LightManager;
  lightCommands: LightCommand[];
  working = false;

  // queue as a subject?

  constructor() {
    this.lightManager = new LightManager();
    this.light_ips.forEach(ip => {
      this.lightManager.addLight(ip);
    });
    this.lightCommands = [];
  }

  public addLightCommand(command: LightCommand) {
    this.lightCommands.push(command);
    this.executeNextCommand();
  }

  public brightnessFlash(flashes: number) {
    const state = this.lightManager.getState();
    this.light_ips.forEach(ip => {
      state[ip].brightness = 100;
    });

    this.brightnessFlashStep(state, flashes * 2);
  }

  private brightnessFlashStep(state: ElgatoLightMap, steps: number) {
    setTimeout(() => {
      if (steps == 0) {
        this.working = false;
      } else if (steps % 2 == 0) {
        this.lightManager.reset();
      } else {
        this.lightManager.setState(state);
      }

      if (steps > 0) {
        this.brightnessFlashStep(state, steps - 1);
      }
    }, 250);
  }

  private executeNextCommand() {
    if (this.lightCommands.length == 0) {
        return;
    }

    if (this.working) {
      setTimeout(() => {
        this.executeNextCommand();
      }, 250);

      return;
    }

    let command = this.lightCommands.shift();

    if (command == null) {
      return;
    }

    this.working = true;

    if (command.reset) {
      this.lightCommands.push({
        name: 'reset',
        value: 0,
        reset: false
      });
    }

    if (command.name === 'redAlert') {
      this.redAlert(command.value);

    } else if (command.name === 'brightnessFlash') {
      this.brightnessFlash(command.value);

    } else if (command.name === 'reset') {
      this.reset();
    }

    if (this.lightCommands.length > 0) {
      this.executeNextCommand();
    }
  }

  private hexToRgb(hex: string) {
    var r = parseInt(hex.substr(1,2), 16);
    var g = parseInt(hex.substr(3,2), 16);
    var b = parseInt(hex.substr(5,2), 16);
    return [ r, g, b ];
  }

  public redAlert(seconds: number)
  {
    this.redAlertStep(seconds * 4 + 1);
  }

  private redAlertStep(steps: number) {
    setTimeout(() => {
      if (steps == 0) {
        this.working = false;
        return;
      }

      let state = this.lightManager.getState();

      this.light_ips.forEach(ip => {
        state[ip].hue = 0;
        state[ip].brightness = Math.random() * 100;
      });

      this.lightManager.setState(state);
      this.redAlertStep(steps - 1);
    }, 250);
  }

  private reset() {
    setTimeout(() => {
      this.lightManager.reset();
      this.working = false;
    }, 250);
  }

  private rgbToHsv(r: number, g: number, b: number): number[] {
    r /= 255, g /= 255, b /= 255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var s, v = max;
    let h: number = 0;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }

      h = h / 6;
    }

    return [ h * 360, s * 100, v * 100 ];
  }

  public setColor(color: string, seconds: number) {
    var rgb = this.hexToRgb(color);
    var hsv = this.rgbToHsv(rgb[0], rgb[1], rgb[2]);

    const state = this.lightManager.getState();
    this.light_ips.forEach(ip => {
      state[ip].hue = hsv[0];
      state[ip].saturation = hsv[1];
      state[ip].brightness = hsv[2];
    });

    this.lightManager.setState(state);

    setTimeout(() => {
      this.lightManager.reset();
    }, seconds * 1000);
  }
}
