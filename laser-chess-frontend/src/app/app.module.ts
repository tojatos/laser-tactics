import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { MainNavComponent } from './components/main-nav/main-nav.component';
import { LoginComponent } from './components/login/login.component';
import { GameModule } from './game/game.module';

@NgModule({
  declarations: [
    AppComponent,
    MainNavComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    GameModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
