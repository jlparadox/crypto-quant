import {Injectable} from '@angular/core';
import {Component, OnInit} from '@angular/core';

import {MessagingService} from '../core/messaging.service';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../core/auth.service';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/filter';

import {CoinMarketService} from '../coinmarket/coinmarket.service';
import {CryptoCompareService} from '../cryptocompare/cryptocompare.service';
import {LocalStorageService} from 'angular-2-local-storage';
import {DiscordService} from '../discord/discord.service';
import {AngularFirestore} from 'angularfire2/firestore';
import {Observable} from 'rxjs/Observable';
import {environment} from '../../environments/environment';

@Injectable()
export class QuantService {
  private coinData;
  private volBuzz = [];
  vol_buzz: Observable<any[]>;
  current_fibo: Observable<any[]>;
  message;

  constructor(private coinservice: CoinMarketService,
              private cryptocompare: CryptoCompareService,
              private localStorageService: LocalStorageService,
              private discordService: DiscordService,
              public msg: MessagingService,
              private db: AngularFirestore,
              public auth: AuthService) {
    this.vol_buzz = db.collection('/volume_buzz').valueChanges();
    this.current_fibo = db.collection('/current_fibo_level').valueChanges();
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
                    'Yo, Volume buzz!: ' + 'crypto: ' + coin + ' at ' + Math.ceil(percentIncrease) + '% ', 'buzzBotId');
                }

              });

            });
        }
      });

    });
  }

  checkFibonacci(coin, days=5){
    const $this = this;
    let setFibo = true;
    let docRef = this.db.collection("/current_fibo_level").doc(coin.symbol);

    this.cryptocompare.getHistoData(coin.symbol, 'BTC', days).subscribe(histo => {
        const currentPrice =  histo['Data'][0]['close'];
        docRef.ref.get().then(function(doc) {
          if($this.isNearChange(currentPrice, doc.data().fib23)){
            console.log('Warn fib23');
          }
          else if($this.isNearChange(currentPrice, doc.data().fib38)){
            console.log('Warn fib23');
          }
          else if($this.isNearChange(currentPrice, doc.data().fib50)){
            console.log('Warn fib23');
          }
          else if($this.isNearChange(currentPrice, doc.data().fib61)){
            console.log('Warn fib23');
          }
          else if($this.isNearChange(currentPrice, doc.data().fib78)){
            console.log('Warn fib23');
          }
        });
    });
  }

  setFibonacci(coin, days=30){
    const $this = this;
    let setFibo = true;
    let docRef = this.db.collection("/current_fibo_level").doc(coin.symbol);

    this.cryptocompare.getHistoData(coin.symbol, 'BTC', days).subscribe(histo => {
      const hi = $this.getMaxOrMin(histo, true);
      const lo =  $this.getMaxOrMin(histo, false);
      const dist = hi - lo;
      const currentFibo = $this.db.collection('/current_fibo_level').doc(coin.symbol);
      if(currentFibo){
        if(hi > currentFibo['high'] || lo < currentFibo['low']){
          setFibo = true;
        } else{
          setFibo = false;
        }
      }
      if(setFibo){
        $this.db.collection('/current_fibo_level').doc(coin.symbol).set({
          high: hi,
          low: lo,
          fib23: dist * 0.236,
          fib38: dist * 0.236,
          fib50: dist * 0.50,
          fib61: dist * 0.618,
          fib78: dist * 0.786,
          last_updated: this.formatDate(new Date()), 
        })
        .then(function () {
          console.log('fibonacci retracement set: ', coin.symbol);
        })
        .catch(function (error) {
          console.error('Error writing document: ', error);
        });
      }
    });
  }

  isNearChange(price, refPrice, tolerance=5){
    const chng = refPrice - price;
    const prcntIncrease = (chng / price) * 100
    return ((Math.abs(prcntIncrease)) <= tolerance);
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
            console.log('Yo, High Momentum!: ' + coin.symbol + ' at ' + Math.ceil(absoluteMomentum) + '% ');
            $this.discordService.send_to_discord(
              'Yo, High Momentum!: ' + 'crypto: ' + coin.symbol + ' at ' + Math.ceil(absoluteMomentum) + '% ', 'momentumBotId');
          } // const smAbsoluteMomemntum = sma(rcdm,sm) // returns the moving average ((rcdm + sm) / sm)
        });
      }
    });
  }

  getTrendIntensity(coin, days = 20, increase = 100) {
    const $this = this;
    this.cryptocompare.getHistoData(coin.symbol, 'BTC', days).subscribe(histo => {
      if (histo['Response'] === 'Success') {
        const sma = this.getAverageValue(histo);
        let iter = 0;
        let item;
        const posDev = [];
        const negDev = [];
        for (item of histo['Data']) {
          const dev = item['close'] - sma;
          dev > 0 ? posDev.push(dev) : negDev.push(Math.abs(dev));
          if (iter > days / 2) {
            break;
          } else {
            iter++;
          }
        }
        const sdPos = posDev.reduce((previous, current) => current += previous);
        const sdNeg = negDev.reduce((previous, current) => current += previous);
        return (((sdPos) / (sdPos + sdNeg)) * 100);
      }
    });
  }

  getRelativeMomentum(coin, days = 20, mom = 4, ob = 70, os = 30) {
    const $this = this;
    this.cryptocompare.getHistoData(coin.symbol, 'BTC', days).subscribe(histo => {
      const up = $this.getEma(histo, true);
      const dn = $this.getEma(histo, false);
      const rmi = dn === 0 ? 0 : 100 - 100 / (1 + up / dn);
    });
  }

  getEma(dataSrc, indicator) {
    const aggregate = [];
    if (dataSrc['Response'] === 'Success') {
      for (let i = dataSrc['Data'].length; i > 0; i--) {
        const multiplier = (2 / (i + 1));
        if (indicator) {
          aggregate.push((dataSrc['high'] * multiplier));
        } else {
          aggregate.push((dataSrc['low'] * multiplier));
        }
      }
      if (aggregate.length > 0) {
        const sum = aggregate.reduce((previous, current) => current += previous);
        return (sum / aggregate.length);
      }
    }
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

  formatDate(date) {
    const today = new Date();
    const dd = today.getDate();
    const mm = today.getMonth() + 1; // January is 0!
    const yyyy = today.getFullYear();

    return mm + '/' + dd + '/' + yyyy;
  }


  getRateOfChange(o, n) {
    return (n / o) * 100;
  }

  getMaxOrMin(dataSrc, isMax){
    const aggregate = [];
    if (dataSrc['Response'] === 'Success') {
      dataSrc['Data'].forEach(src => {
        aggregate.push(src['high']);
      });
      if (aggregate.length > 0) {
        const minmax = aggregate.reduce((previous, current) => {
            return (isMax ? Math.max(previous, current) : Math.min(previous, current));
        });
        return (minmax);
      }
    }
  }

}
