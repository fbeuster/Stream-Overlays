import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { SubCounter } from './SubCounter';

@Injectable({
  providedIn: 'root'
})
export class SubCounterService {
  constructor(
    private _zone: NgZone,
    private http: HttpClient) {}

  getSubCount(url: string) : Observable<SubCounter> {
    return this.http.get<SubCounter>(url);
  }
}