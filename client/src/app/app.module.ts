import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OverlayComponent } from './overlay/overlay.component';
import { SubCounterComponent } from './subCounter/subCounter.component';
import { AlertboxComponent } from './alertbox/alertbox.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    OverlayComponent,
    SubCounterComponent,
    AlertboxComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
