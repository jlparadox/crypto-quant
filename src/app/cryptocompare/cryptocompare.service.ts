import {Http, Headers} from '@angular/http';
import {Injectable} from '@angular/core';
import "rxjs/Rx";
import "rxjs/add/observable/interval";
import "rxjs/observable/IntervalObservable";

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import {LocalStorageService} from 'angular-2-local-storage';
import {QuantService} from '../quant/quant.service';

@Injectable()
export class CryptoCompareService {

  constructor(
    private http: Http,
    private quantService: QuantService,
    private localStorageService: LocalStorageService) {
  }

  getHistoData(symA, symB = 'BTC', limit = 10, exchange = 'Binance', reset=false) {
    symB = symA === 'BTC' ? 'USDT' : symB;
    const coinData = this.localStorageService.get(symA)
    this.localStorageService.set('stored_data', this.quantService.formatDate(new Date()));
    if(coinData && coinData['Response'] === 'Success' && coinData['Data'].length > limit && reset==false){
      var source = Observable.create(observer => {
        coinData['Data'] = coinData['Data'].slice(limit,-(coinData['Data'].length))
        observer.onNext(coinData);
      });
      return source;
    }
    else
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
