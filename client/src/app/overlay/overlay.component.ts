import { Component, OnInit } from '@angular/core';

import { environment } from './../../environments/environment';
import { OverlayService } from './overlay.service';

@Component({
  selector: 'overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss']
})
export class OverlayComponent implements OnInit {

  constructor(private appService: OverlayService) {}

  ngOnInit() {
    this.listen();
  }

  listen(): void {
    this.appService.getServerSentEvent(environment.serverEventUri).subscribe(event => {
      console.log(event.data);
    });
  }

}