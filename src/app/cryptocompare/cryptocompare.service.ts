import {Http, Headers} from '@angular/http';
import {Injectable} from '@angular/core';
import "rxjs/Rx";
import "rxjs/add/observable/interval";
import "rxjs/observable/IntervalObservable";

import 'rxjs/add/operator/map';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';

@Injectable()
export class CryptoCompareService {

  constructor(
    private http: Http) {
  }

  getHistoData(symA, symB = 'BTC', limit = 10, exchange = 'Binance') {
    symB = symA === 'BTC' ? 'USDT' : symB;
    return this.http.get('https://min-api.cryptocompare.com/data/histoday?fsym='
      + symA + '&tsym=' + symB + '&limit=' + limit + '&aggregate=5&e=' + exchange)
      .map(res => res.json());
  }

  getExchangeData() {
    return this.http.get('https://min-api.cryptocompare.com/data/all/exchanges')
      .map(res => res.json());
  }

  getStreamData(list){
    return IntervalObservable
        .create(5000) //5 second interval
        .flatMap(() => {
        return this.http.get('https://min-api.cryptocompare.com/data/subsWatchlist?fsyms='
        + list + '&tsym=USD').map(response => response.json());
    });
  }


}
