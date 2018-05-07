import {Http, Headers} from '@angular/http';
import {Injectable} from '@angular/core';


import 'rxjs/add/operator/map';

@Injectable()
export class CoinMarketService {

  private limit = 100;
  private Top7Day;
  private Top24h;
  private Top1H;
  private TopVol;
  private lastUpdated;
  Last7Day;
  Last24h;
  Last1H;
  private d;

  constructor(
    private http: Http) {
    const $this = this;
    this.getCoinData(this.limit).subscribe(
      data => {
        this.Top24h = this.getTopCoin(data, 'percent_change_24h', 'max');
        this.Top7Day = this.getTopCoin(data, 'percent_change_7d', 'max');
        this.Top1H = this.getTopCoin(data, 'percent_change_1h', 'max');
        this.TopVol = this.getTopCoin(data, '24h_volume_usd', 'max');
        this.Last24h = this.getTopCoin(data, 'percent_change_24h', 'min');
        this.Last7Day = this.getTopCoin(data, 'percent_change_7d', 'min');
        this.Last1H = this.getTopCoin(data, 'percent_change_1h', 'min');
        this.lastUpdated = this.getUpdatedDate(data);
      },
      err => {
        console.log(err);
      }
    );
  }

  getCoinData(limit = 10) {
    return this.http.get('https://api.coinmarketcap.com/v1/ticker/?limit=' + limit)
      .map(res => res.json());
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

  getUpdatedDate(data) {
    data.forEach(coin => {
      const d = new Date();
      d.setDate(coin['last_updated']);
    });
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
