import { Http, Headers } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";


import 'rxjs/add/operator/map';

@Injectable()
export class CryptoCompareService {

    constructor(
        private http: Http) {}
    
    getHistoData(symA, symB='BTC', limit=10, exchange='Binance'){
        return this.http.get('https://min-api.cryptocompare.com/data/histoday?fsym='+symA+'&tsym='+symB+'&limit=' + limit + '&aggregate=5&e='+exchange)
        .map(res => res.json());
                  
    }
}
