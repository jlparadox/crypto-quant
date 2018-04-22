import {NgModule} from '@angular/core';

import {CoinMarketService} from './coinmarket.service';

import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {HttpModule} from '@angular/http';

@NgModule({
  imports: [
    // Modules
    HttpModule,
    BrowserModule,

  ],
  providers: [
    // Services
    CoinMarketService
  ],
  declarations: [
    // Controllers

    // Components
  ],
  exports: [
    // Controllers

    // Components
  ]
})
export class CoinMarketModule {


}
