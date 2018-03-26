import {Component, OnInit} from '@angular/core';
import {MessagingService} from './messaging.service';

import {CoinMarketService} from './coinmarket/coinmarket.service';
import {CryptoCompareService} from './cryptocompare/cryptocompare.service';
import {LocalStorageService} from 'angular-2-local-storage';
import {AngularFirestore} from 'angularfire2/firestore';
import {Observable} from 'rxjs/Observable';

import * as tfy from 'taffy';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [CoinMarketService]
})
export class AppComponent implements OnInit {
  title = 'Crypto Quant';
  private limit = 100;
  private coinData;
  private Top7Day;
  private Top24h;
  private Top1H;
  private TopVol;
  private lastUpdated;
  Last7Day;
  Last24h;
  Last1H;
  private volBuzz = [];
  private d;
  items: Observable<any[]>;
  message;

  constructor(private coinservice: CoinMarketService,
              private cryptocompare: CryptoCompareService,
              private localStorageService: LocalStorageService,
              private db: AngularFirestore,
              private msgService: MessagingService) {
    this.items = db.collection('watchlist').valueChanges();
    this.items.subscribe(items => {
      for (const item of items) {
        console.log(item.name);
      }
    });
  }

  ngOnInit() {
    const $this = this;
    this.getPushNotifications();
    this.coinservice.getCoinData(this.limit).subscribe(
      data => {
        this.Top24h = this.getTopCoin(data, 'percent_change_24h', 'max');
        this.Top7Day = this.getTopCoin(data, 'percent_change_7d', 'max');
        this.Top1H = this.getTopCoin(data, 'percent_change_1h', 'max');
        this.TopVol = this.getTopCoin(data, '24h_volume_usd', 'max');
        this.Last24h = this.getTopCoin(data, 'percent_change_24h', 'min');
        this.Last7Day = this.getTopCoin(data, 'percent_change_7d', 'min');
        this.Last1H = this.getTopCoin(data, 'percent_change_1h', 'min');
        this.lastUpdated = this.getUpdatedDate(data);

        data.forEach(coin => {
          $this.getVolumeBuzz(coin);
        });
      },
      err => {
        console.log(err);
      }
    );
  }

  getPushNotifications() {
    this.msgService.getPermission();
    this.msgService.receiveMessage();
    this.message = this.msgService.currentMessage;
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
    this.volBuzz = $this.localStorageService.get('volume_buzz');

    this.getHistoData(coin).subscribe(histo => {
      const ave = $this.getAveVolumeChange(histo);
      $this.getCurrentVolumeChange(histo).then(current => {
        const percentIncrease = (Number(current) - ave) / ave * 100;
        if (percentIncrease > increase) {
          buzz = this.formatDate(new Date()) + ': ' + coin['symbol'] + ': ' + percentIncrease + '% ';
          if (this.volBuzz.indexOf(buzz) < -1) {
            console.log('buzz!:', buzz);
            $this.volBuzz.push(buzz);
            $this.localStorageService.set('volume_buzz', $this.volBuzz);
          }
        }
      });

    });

  }

  getUpdatedDate(data) {
    data.forEach(coin => {
      const d = new Date();
      d.setDate(coin['last_updated']);
    });
  }

  formatDate(date) {
    const today = new Date();
    const dd = today.getDate();
    const mm = today.getMonth() + 1; // January is 0!
    const yyyy = today.getFullYear();

    return mm + '/' + dd + '/' + yyyy;
  }

  getTopCoin(data, field, param, isValOnly = false) {
    const coinsChange = [];
    data.forEach(coin => {
      coinsChange.push(Math.round(coin[field]));
    });

    const top = coinsChange.reduce(function (a, b) {
      if (param === 'max') {
        return Math.max(a, b);
      } else {
        return Math.min(a, b);
      }
    });

    const i = coinsChange.indexOf(top);

    if (i > -1) {
      if (!isValOnly) {
        return ('symbol: ' + data[i]['symbol'] + ' name: ' + data[i]['name'] + ': ' + top);
      } else {
        return top;
      }
    }

  }

  getTop10Vol(data) {
    const top10Vol = [];
    this.d = data;
    const $this = this;
    data.forEach(coin => {
      const top = $this.getTopCoin($this.d, '24h_volume_usd', 'max', true);
      top10Vol.push(top);
      $this.d = $this.arrayRemove($this.d, top);
    });

    console.log(top10Vol);
  }

  equate(data, val, field) {
    return data.field === val;
  }

  arrayRemove(obj, val) {
    console.log(obj.find(this.equate(obj, val, '24h_volume_usd')));
    const i = -1;
    if (i >= 0) {
      delete obj.i;
      return obj.splice(i, 1);
    }
  }
}
