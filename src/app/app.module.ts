import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';

import {AppComponent} from './app.component';

import {CoinMarketModule} from './coinmarket/coinmarket.module';
import {CryptoCompareModule} from './cryptocompare/cryptocompare.module';
import {LocalStorageModule} from 'angular-2-local-storage';
import {WatchListFormComponent} from './watch-list-form/watch-list-form.component';
import {ExceptionFormComponent} from './exception-form/exception-form.component';
import {AngularFireModule} from 'angularfire2';
import {AngularFirestoreModule} from 'angularfire2/firestore';
import {AngularFireStorageModule} from 'angularfire2/storage';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {environment} from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    WatchListFormComponent,
    ExceptionFormComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    HttpModule,
    CoinMarketModule,
    CryptoCompareModule,
    LocalStorageModule.withConfig({
      prefix: 'my-app',
      storageType: 'localStorage'
    })

  ],
  providers: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}
