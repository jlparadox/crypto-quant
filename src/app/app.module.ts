import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

import {CoinMarketModule} from "./coinmarket/coinmarket.module";
import {CryptoCompareModule} from "./cryptocompare/cryptocompare.module";
import { LocalStorageModule } from 'angular-2-local-storage';
import { WatchListFormComponent } from './watch-list-form/watch-list-form.component';
import { ExceptionFormComponent } from './exception-form/exception-form.component';

@NgModule({
  declarations: [
    AppComponent,
    WatchListFormComponent,
    ExceptionFormComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    CoinMarketModule,
    CryptoCompareModule,
    LocalStorageModule.withConfig({
        prefix: 'my-app',
        storageType: 'localStorage'
    })

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
