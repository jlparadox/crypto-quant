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

    this.discordService.send_to_discord('Discord service');

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
  }

  getBinancePairs() {
    const $this = this;
    this.cryptocompare.getExchangeData().subscribe(
      data => {
        console.log('updated binance data: ', data['Binance']);
        this.localStorageService.set('binance_data', data['Binance']);
        this.initializeApp();
      },
      err => {
        console.log(err);
      }
    );
  }

  getHistoData(coin) {
    const s = coin['symbol'];

    return this.cryptocompare.getHistoData(s);
  }

  getAveVolumeChange(volSrc) {
    const aggregateVol = [];

    if (volSrc['Response'] === 'Success') {
      volSrc['Data'].forEach(src => {
        aggregateVol.push(src['volumeto']);
      });
      if (aggregateVol.length > 0) {
        const sum = aggregateVol.reduce((previous, current) => current += previous);
        return (sum / aggregateVol.length);
      }
    }

  }

  getCurrentVolumeChange(volSrc) {
    const $this = this;
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

  getVolumeBuzz(coin, increase = 50) {
    const $this = this;
    let buzz;

    this.getHistoData(coin).subscribe(histo => {
      const ave = $this.getAveVolumeChange(histo);
      $this.getCurrentVolumeChange(histo).then(current => {
        const percentIncrease = (Number(current) - ave) / ave * 100;
        const buzzDate = this.formatDate(new Date());
        // check if buzz is already recorded
        if (percentIncrease > increase) {
          this.vol_buzz.subscribe(
            (buzzes) => {

              buzzes.forEach(function (buzzItem) {
                if (buzzItem['symbol'] !== 'SYS' && buzzItem['date'] !== buzzDate) {
                  buzz = buzzDate + ': ' + coin['symbol'] + ': ' + Math.ceil(percentIncrease) + '% ';
                  // Add a new document in collection "cities"
                  $this.db.collection('/volume_buzz').doc(coin['symbol']).set({
                    name: coin['name'],
                    symbol: coin['symbol'],
                    percent: Math.ceil(percentIncrease),
                    date: buzzDate
                  })
                    .then(function () {
                      console.log('buzz saved: ', buzz);
                    })
                    .catch(function (error) {
                      console.error('Error writing document: ', error);
                    });
                  $this.discordService.send_to_discord('Yo, Volume buzz!: ' + 'crypto: ' + coin['name']
                    + ' symbol: ' + coin['symbol'] + ' at ' + Math.ceil(percentIncrease) + '% ');
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
