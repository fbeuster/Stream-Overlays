import { trigger, transition, animate, style } from '@angular/animations';
import { Component, OnInit } from '@angular/core';

import { Alertbox } from './../alertbox/alertbox';
import { environment } from './../../environments/environment';
import { ServerEventService } from '../serverEvent/serverEvent.service';

@Component({
  selector: 'overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateX(100%)'}),
        animate('500ms ease-in-out', style({transform: 'translateX(0%)'}))
      ]),
      transition(':leave', [
        animate('500ms ease-in-out', style({transform: 'translateX(100%)'}))
      ])
    ])
  ]
})
export class OverlayComponent implements OnInit {

  alertbox: Alertbox;
  visible = false;

  constructor(private serverEventService: ServerEventService) {}

  ngOnInit() {
    this.listen();
  }

  listen(): void {
    this.serverEventService.getServerSentEvent(environment.serverEventUri).subscribe(event => {
      this.visible = false;

      setTimeout(() => {
        let data = JSON.parse(event.data);
        if (data.eventType === 'alertbox') {
          this.alertbox = data.eventData;

          if (this.alertbox.type !== 'explosion' &&
              this.alertbox.type !== 'raveparty') {
            this.visible = true;
          }

          this.playAlertSound();

          if (this.alertbox.type !== 'explosion' &&
              this.alertbox.type !== 'raveparty') {
            setTimeout(() => {
              this.visible = false;
            }, environment.times.alerts.display);
          }
        }
      }, environment.times.alerts.cooldown);
    });
  }

  playAlertSound(): void {
      let audio = new Audio();

      if (this.alertbox.type === 'channel.cheer') {
        audio.src = '../assets/sfx/coins.mp3';
      } else if (this.alertbox.type === 'channel.follow') {
        audio.src = '../assets/sfx/shipBell.mp3';
      } else if (this.alertbox.type === 'channel.subscribe') {
        audio.src = '../assets/sfx/drums.mp3';
      } else if (this.alertbox.type === 'subGift') {
        audio.src = '../assets/sfx/drums.mp3';
      } else if (this.alertbox.type === 'channel.raid'){
        audio.src = '../assets/sfx/battleCrowd.mp3';
      } else if (this.alertbox.type === 'explosion') {
        audio.src = '../assets/sfx/explosion.wav';
      } else if (this.alertbox.type === 'raveparty') {
        audio.src = '../assets/sfx/rave.wav';
      }

      audio.load();
      audio.play();
  }

}