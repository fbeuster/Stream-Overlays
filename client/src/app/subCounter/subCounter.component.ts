import { trigger, style } from '@angular/animations';
import { Component, OnInit } from '@angular/core';

import { environment } from './../../environments/environment';
import { ServerEventService } from '../serverEvent/serverEvent.service';

@Component({
  selector: 'subCounter',
  templateUrl: './subCounter.component.html',
  styleUrls: ['./subCounter.component.scss']
})
export class SubCounterComponent implements OnInit {
  current_sub_count: number = 42;

  constructor(private serverEventService: ServerEventService) {}

  ngOnInit() {
    this.serverEventService.getServerSentEvent(environment.serverApiUri + '/subs').subscribe(event => {

      let data = JSON.parse(event.data);
      console.log(event);
      if (data.eventType === 'subscriptions') {
        this.current_sub_count = data.eventData.total;
      }
    });
  }
}