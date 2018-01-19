import {NgModule} from '@angular/core';

import {CryptoCompareService} from './cryptocompare.service';

import { BrowserModule  } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { HttpModule } from '@angular/http';

@NgModule({
    imports: [
    	// Modules
      HttpModule,
      BrowserModule,

    ],
    providers: [
    	// Services
        CryptoCompareService
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
export class CryptoCompareModule {


}