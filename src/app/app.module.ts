import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';
import {HttpClientModule} from '@angular/common/http';
import {CoinMarketModule} from './coinmarket/coinmarket.module';
import {CryptoCompareModule} from './cryptocompare/cryptocompare.module';
import {DiscordModule} from './discord/discord.module';
import {CoreModule} from './core/core.module';
import {LocalStorageModule} from 'angular-2-local-storage';
import {AngularFireModule} from 'angularfire2';
import {Routes, RouterModule} from '@angular/router';

import {AppComponent} from './app.component';
import {MessagingService} from './core/messaging.service';
import {WatchListFormComponent} from './watch-list-form/watch-list-form.component';
import {ExceptionFormComponent} from './exception-form/exception-form.component';
import {environment} from '../environments/environment';


import {UserProfileComponent} from './user-profile/user-profile.component';

import {AuthGuard} from './core/auth.guard';
import { PortfolioFormComponent } from './portfolio-form/portfolio-form.component';

const routes: Routes = [
  { path: 'notes', component: AppComponent,  canActivate: [AuthGuard] },
];

@NgModule({
  declarations: [
    AppComponent,
    WatchListFormComponent,
    ExceptionFormComponent,
    UserProfileComponent,
    PortfolioFormComponent,
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    CoreModule,
    HttpModule,
    HttpClientModule,
    CoinMarketModule,
    CryptoCompareModule,
    DiscordModule,
    LocalStorageModule.withConfig({
      prefix: 'my-app',
      storageType: 'localStorage'
    }),
    RouterModule.forRoot(routes, {useHash: true}),
  ],
  providers: [AppComponent, MessagingService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
