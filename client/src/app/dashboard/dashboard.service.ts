import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  sendDebugCommand(type: string) {
    this.http
      .get<any>(environment.serverCommandUri + '?debug=' + type)
      .subscribe({
        next: data => {
        },
        error: error => {
          console.error(error);
        }
      });
  }
}