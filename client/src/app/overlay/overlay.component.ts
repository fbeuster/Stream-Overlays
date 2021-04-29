import { trigger, transition, animate, style } from '@angular/animations';
import { Component, OnInit } from '@angular/core';

import { Alertbox } from './../alertbox/alertbox';
import { environment } from './../../environments/environment';
import { OverlayService } from './overlay.service';

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

  constructor(private appService: OverlayService) {}

  ngOnInit() {
    this.listen();
  }

  listen(): void {
    this.appService.getServerSentEvent(environment.serverEventUri).subscribe(event => {
      this.visible = false;

      setTimeout(() => {
        let data = JSON.parse(event.data);
        console.log(data);
        this.alertbox = data;
        this.visible = true;

        this.playAlertSound();

        setTimeout(() => {
          this.visible = false;
        }, environment.times.alerts.display);
      }, environment.times.alerts.cooldown);
    });
  }

  playAlertSound(): void {
      let audio = new Audio();

      if (this.alertbox.type === 'follow') {
        audio.src = '../assets/sfx/shipBell.mp3';
      } else {
        audio.src = '../assets/sfx/battleCrowd.mp3';
      }

      audio.load();
      audio.play();
  }

}