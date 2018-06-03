import {Component, OnInit} from '@angular/core';

import {MessagingService} from './core/messaging.service';
import {HttpClient} from '@angular/common/http';
import {AuthService} from './core/auth.service';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/filter';

import {CoinMarketService} from './coinmarket/coinmarket.service';
import {CryptoCompareService} from './cryptocompare/cryptocompare.service';
import {LocalStorageService} from 'angular-2-local-storage';
import {DiscordService} from './discord/discord.service';
import {QuantService} from './quant/quant.service';
import {AngularFirestore} from 'angularfire2/firestore';
import {Observable} from 'rxjs/Observable';
import {environment} from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [CoinMarketService]
})
export class AppComponent implements OnInit {
  title = 'Crypto Quant';
  private coinData;
  private volBuzz = [];
  vol_buzz: Observable<any[]>;
  message;

  constructor(private coinservice: CoinMarketService,
              private cryptocompare: CryptoCompareService,
              private localStorageService: LocalStorageService,
              private discordService: DiscordService,
              private quantService: QuantService,
              public msg: MessagingService,
              private db: AngularFirestore,
              public auth: AuthService) {
    this.vol_buzz = db.collection('/volume_buzz').valueChanges();
  }

  ngOnInit() {
    const $this = this;

    this.auth.user
      .filter(user => !user)
      .take(1)
      .subscribe(user => {
        if (user) {
          this.msg.getPermission(user);
          this.msg.monitorRefresh(user);
          this.msg.receiveMessages();
        }
      });

    if (this.localStorageService.get('binance_data')) {
      this.initializeApp();
    } else {
      this.getBinancePairs();
    }

  }

  initializeApp() {
    const $this = this;
    const dataBinance = this.localStorageService.get('binance_data');
    const coins = Object.keys(dataBinance);
    coins.forEach(coin => {
      const currentDate = this.quantService.formatDate(new Date());
      const triggerReset: boolean = (currentDate == this.localStorageService.get('stored_date')) ? false : true;
      this.cryptocompare.getHistoData(coin, 'BTC', 50, 'Binance', triggerReset).subscribe(histo => {
        this.localStorageService.set(coin, histo);
        this.quantService.getVolumeBuzz(coin);
      });
    });
    this.filterByWatchList();
    this.filterByPortfolio();
  }

  filterByWatchList() {
    const $this = this;
    let listString = '';
    const watchlist = this.db.collection('/watchlist').valueChanges();
    watchlist.subscribe((list) => {
      list.forEach(function (watchItem) {
        listString += listString == '' ? watchItem['symbol'] : ',' + watchItem['symbol'];
        $this.quantService.setFibonacci(watchItem);
        $this.quantService.checkFibonacci(watchItem);
        $this.quantService.getAbsMomentum(watchItem);
      });
    });
  }

  filterByPortfolio() {
    const portfolio = this.db.collection('/portfolio').valueChanges();
    portfolio.subscribe((list) => {
      list.forEach(function (item) {
        // apply your functions here
        // console.log('test: ', item);
      });
    });
  }

  getBinancePairs() {
    this.cryptocompare.getExchangeData().subscribe(
      data => {
        this.localStorageService.set('binance_data', data['Binance']);
        this.initializeApp();
      },
      err => {
        console.log(err);
      }
    );
  }

}
