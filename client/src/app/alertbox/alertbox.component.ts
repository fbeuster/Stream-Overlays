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

}
