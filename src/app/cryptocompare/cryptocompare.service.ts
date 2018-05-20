import {Http, Headers} from '@angular/http';
import {Injectable} from '@angular/core';


import 'rxjs/add/operator/map';

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
    return this.http.get('https://min-api.cryptocompare.com/data/subsWatchlist?fsyms='
    + list + '&tsym=USD');
  }


}
