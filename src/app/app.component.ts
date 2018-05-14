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
import {AngularFirestore} from 'angularfire2/firestore';
import {Observable} from 'rxjs/Observable';
import {environment} from '../environments/environment';

import * as tfy from 'taffy';

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
              public msg: MessagingService,
              private db: AngularFirestore,
              public auth: AuthService) {
    this.vol_buzz = db.collection('/volume_buzz').valueChanges();
  }

  ngOnInit() {
    const $this = this;

    this.auth.user
      .filter(user => !!user)
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
      this.getVolumeBuzz(coin);
    });
    this.filterByWatchList();
    this.filterByPortfolio();
  }

  filterByWatchList() {
    const $this = this;
    const watchlist = this.db.collection('/watchlist').valueChanges();
    watchlist.subscribe((list) => {
      list.forEach(function (watchItem) {
        $this.getAbsMomentum(watchItem);
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

  getAverageValue(dataSrc) {
    const aggregate = [];

    if (dataSrc['Response'] === 'Success') {
      dataSrc['Data'].forEach(src => {
        aggregate.push(src['volumeto']);
      });
      if (aggregate.length > 0) {
        const sum = aggregate.reduce((previous, current) => current += previous);
        return (sum / aggregate.length);
      }
    }

  }

  getCurrentVolumeChange(volSrc) {
    let curDate;
    return new Promise((resolve, reject) => {
      if (volSrc['Response'] === 'Success') {
        curDate = (Math.max.apply(null, volSrc['Data'].map(function (src) {
          return new Date(src['time']);
        })));

        volSrc['Data'].forEach(src => {
          if (src['time'] === curDate) {
            resolve(src['volumeto']);
          }
        });
      } else {
        resolve(0);
      }
    });
  }

  getAbsMomentum(coin, days = 15, increase = 100) {
    const $this = this;
    this.cryptocompare.getHistoData(coin.symbol, 'BTC', days).subscribe(histo => {
      if (histo['Response'] === 'Success') {
        const rc = this.getRateOfChange(histo['Data'][0]['close'], histo['Data'][days - 1]['close']);
        const bil = this.cryptocompare.getHistoData('BTC', 'USDT', days);
        bil.subscribe(btc => {
          const bilr = $this.getRateOfChange(btc['Data'][0]['close'], btc['Data'][days - 1]['close']);
          const absoluteMomentum = rc - bilr;
          if (absoluteMomentum > increase) {
            $this.discordService.send_to_discord(
              'Yo, High Momentum!: ' + 'crypto: ' + coin + ' at ' + Math.ceil(absoluteMomentum) + '% ');
          } // const smAbsoluteMomemntum = sma(rcdm,sm) // returns the moving average ((rcdm + sm) / sm)
        });
      }
    });
  }

  getTrendIntensity(coin, days=20, increase = 100){
    const $this = this;
    this.cryptocompare.getHistoData(coin.symbol, 'BTC', days).subscribe(histo => {
      if (histo['Response'] === 'Success') {
        const sma = this.getAverageValue(histo);
        let iter = 0;
        let item;
        const posDev = [];
        const negDev = [];
        for(item of histo['Data']){
          let dev =  item['close'] - sma;
          dev > 0 ? posDev.push(dev) : negDev.push(Math.abs(dev));
          if(iter > days/2)
            break;
          else
            iter++;
        }
        const sdPos = posDev.reduce((previous, current) => current += previous);
        const sdNeg = negDev.reduce((previous, current) => current += previous);
        return (((sdPos) / (sdPos + sdNeg)) * 100);
      }
    });
  }

  getRelativeMomentum(coin, days=20, mom=4, ob=70, os=30){
    const $this = this;
    this.cryptocompare.getHistoData(coin.symbol, 'BTC', days).subscribe(histo => {
      const up = $this.getEma(histo, true);
      const dn = $this.getEma(histo, false);
      const rmi = dn == 0 ? 0 : 100 - 100 / (1 + up / dn)
    });
  }

  getEma(dataSrc, indicator){
    const aggregate = [];
    if (dataSrc['Response'] === 'Success') {
      for (let i = dataSrc['Data'].length; i > 0; i--) {
        let multiplier =  (2 / (i + 1) )
        if (indicator)
          aggregate.push((dataSrc['high']  * multiplier));
        else
        aggregate.push((dataSrc['low']  * multiplier));
      };
      if (aggregate.length > 0) {
        const sum = aggregate.reduce((previous, current) => current += previous);
        return (sum / aggregate.length);
      }
    }
  }


  getRateOfChange(o, n) {
    return (n / o) * 100;
  }

  getVolumeBuzz(coin, increase = 50) {
    const $this = this;
    let buzz;

    this.cryptocompare.getHistoData(coin).subscribe(histo => {
      const ave = $this.getAverageValue(histo);
      $this.getCurrentVolumeChange(histo).then(current => {
        const percentIncrease = (Number(current) - ave) / ave * 100;
        const buzzDate = this.formatDate(new Date());
        // check if buzz is already recorded
        if (percentIncrease > increase) {
          this.vol_buzz.subscribe(
            (buzzes) => {
              buzzes.forEach(function (buzzItem) {
                if (buzzItem['symbol'] !== buzz && buzzItem['date'] !== buzzDate) {
                  buzz = buzzDate + ': ' + coin['symbol'] + ': ' + Math.ceil(percentIncrease) + '% ';
                  // Add a new document in collection "cities"
                  $this.db.collection('/volume_buzz').doc(coin).set({
                    name: coin,
                    symbol: coin,
                    percent: Math.ceil(percentIncrease),
                    date: buzzDate
                  })
                    .then(function () {
                      console.log('buzz saved: ', buzz);
                    })
                    .catch(function (error) {
                      console.error('Error writing document: ', error);
                    });
                  $this.discordService.send_to_discord(
                    'Yo, Volume buzz!: ' + 'crypto: ' + coin + ' at ' + Math.ceil(percentIncrease) + '% ');
                }

              });

            });
        }
      });

    });

  }

  formatDate(date) {
    const today = new Date();
    const dd = today.getDate();
    const mm = today.getMonth() + 1; // January is 0!
    const yyyy = today.getFullYear();

    return mm + '/' + dd + '/' + yyyy;
  }

}
