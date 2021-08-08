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
    if (this.alertbox.type === 'cheer') {
      return 'Just dropped ' + this.alertbox.viewers + ' bits on the table!';
    }

    if (this.alertbox.type === 'follow') {
      return 'Just followed your channel.';
    }

    if (this.alertbox.type === 'raid') {
      return 'Just raided your channel with ' + this.alertbox.viewers + ' viewer' + (this.alertbox.viewers == 1 ? '' : 's') + '.';
    }

    if (this.alertbox.type === 'sub') {
      return 'Just subscribed with a Tier ' + this.alertbox.viewers + ' subscription.';
    }

    if (this.alertbox.type === 'subGift') {
      return 'Just gifted ' + this.alertbox.value2 + ' Tier ' + this.alertbox.viewers + ' subscription' + (this.alertbox.value2 == 1 ? '' : 's') + '.';
    }

    return '';
  }

}
