import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';


import { AppComponent } from './app.component';

import {CoinMarketModule} from "./coinmarket/coinmarket.module";
import {CryptoCompareModule} from "./cryptocompare/cryptocompare.module";


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    CoinMarketModule,
    CryptoCompareModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
