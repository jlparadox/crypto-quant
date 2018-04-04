import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';

import {AppComponent} from './app.component';
import {MessagingService} from './core/messaging.service';

import {CoinMarketModule} from './coinmarket/coinmarket.module';
import {CryptoCompareModule} from './cryptocompare/cryptocompare.module';
import {CoreModule} from './core/core.module';
import {LocalStorageModule} from 'angular-2-local-storage';
import {WatchListFormComponent} from './watch-list-form/watch-list-form.component';
import {ExceptionFormComponent} from './exception-form/exception-form.component';
import {environment} from '../environments/environment';

import {AngularFireModule} from 'angularfire2';
import { UserProfileComponent } from './user-profile/user-profile.component';

@NgModule({
  declarations: [
    AppComponent,
    WatchListFormComponent,
    ExceptionFormComponent,
    UserProfileComponent,
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    CoreModule,
    HttpModule,
    CoinMarketModule,
    CryptoCompareModule,
    LocalStorageModule.withConfig({
      prefix: 'my-app',
      storageType: 'localStorage'
    })

  ],
  providers: [AppComponent, MessagingService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
