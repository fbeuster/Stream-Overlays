import { formatNumber } from '@angular/common';
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
    if (this.alertbox.type === 'channel.cheer') {
      return 'Just dropped <span class="highlight">' + formatNumber(this.alertbox.bits, 'en_us') + '</span> bits on the table!';
    }

    if (this.alertbox.type === 'channel.follow') {
      return 'Just followed your channel.';
    }

    if (this.alertbox.type === 'channel.raid') {
      return 'Just raided your channel with <span class="highlight">' + formatNumber(this.alertbox.viewers, 'en_us') + '</span> viewer' + (this.alertbox.viewers == 1 ? '' : 's') + '.';
    }

    if (this.alertbox.type === 'channel.subscribe') {
      return 'Just subscribed with a Tier ' + this.alertbox.tier + ' subscription.';
    }

    if (this.alertbox.type === 'subGift') {
      return 'Just gifted <span class="highlight">' + formatNumber(this.alertbox.gifted, 'en_us') + '</span> Tier ' + this.alertbox.tier + ' subscription' + (this.alertbox.gifted == 1 ? '' : 's') + '.';
    }

    return '';
  }

}
