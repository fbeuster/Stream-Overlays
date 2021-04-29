import { Component, Input, OnInit } from '@angular/core';
import { Alertbox } from './alertbox';

@Component({
  selector: 'alertbox',
  templateUrl: './alertbox.component.html',
  styleUrls: ['./alertbox.component.scss']
})
export class AlertboxComponent implements OnInit {
  @Input() alertbox: Alertbox;

  constructor() { }

  ngOnInit(): void {
  }

  getSubtitle(): string {
    if (this.alertbox.type === 'follow') {
      return 'Just followed your channel.';
    }

    if (this.alertbox.type === 'raid') {
      return 'Just raided your channel with ' + this.alertbox.viewers + ' viewer' + (this.alertbox.viewers == 1 ? '' : 's') + '.';
    }

    return '';
  }

}
