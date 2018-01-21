import { Component, OnInit, } from '@angular/core';

import {CoinMarketService} from './coinmarket/coinmarket.service';
import {CryptoCompareService} from './cryptocompare/cryptocompare.service';
import { LocalStorageService } from 'angular-2-local-storage';

import * as tfy from 'taffy';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers:[CoinMarketService]
})
export class AppComponent {
  title = 'Crypto Quant';
  private limit=100;
  private coinData;
  private Top7Day;
  private Top24h;
  private Top1H;
  private TopVol;
  private lastUpdated;
  private Last7Day;
  private Last24h;
  private Last1H;
  private volBuzz = [];
  private d;


  constructor(private coinservice: CoinMarketService,
              private cryptocompare: CryptoCompareService,
              private localStorageService: LocalStorageService
            ){}

  ngOnInit(){
    let $this = this;
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
                    //this.getTop10Vol(data);

                    data.forEach(coin => {
                        $this.getVolumBuzz(coin);
                    });
                },
                err => {
                    console.log(err);
                }
            );
  }

  getHistoData(coin){
    let s = coin['symbol'];

    return this.cryptocompare.getHistoData(s);
  }

  getAveVolumeChange(volSrc){
    let aggregateVol = [];

    if(volSrc['Response']=='Success'){
      volSrc['Data'].forEach(src => {
        //console.log('volume: ', src['volumeto']);
        aggregateVol.push(src['volumeto']);
      });
      if(aggregateVol.length > 0){
        let sum = aggregateVol.reduce((previous, current) => current += previous);
        return (sum / aggregateVol.length);
      }
    }
    
  }

  getCurrentVolumeChange(volSrc){
    let $this = this;
    let curDate;
    return new Promise((resolve, reject) => {
      if(volSrc['Response']=='Success'){
        curDate = (Math.max.apply(null, volSrc['Data'].map(function(src) {
          return new Date(src['time']);
        })));
  
        volSrc['Data'].forEach(src => {
           if (src['time'] == curDate){
              resolve(src['volumeto']);
           }
        });
      }
      else
        resolve(0);
    });
  }

  getVolumBuzz(coin, increase=50){
    let $this = this;
    let buzz;

    this.getHistoData(coin).subscribe(histo => {
      let ave = $this.getAveVolumeChange(histo);
      $this.getCurrentVolumeChange(histo).then(current=> {
        let percentIncrease = (Number(current)-ave)/ave * 100;
        if(percentIncrease > increase){
          buzz = coin['symbol'] + ': ' + percentIncrease + '% ';
          $this.volBuzz.push(buzz);
          $this.localStorageService.set('volume_buzz', $this.volBuzz);
        }
      });
      
    });

  }

  getUpdatedDate(data){
    data.forEach(coin => {
        let d = new Date();
        d.setDate(coin['last_updated']);
    });
  }

  getTopCoin(data, field, param, isValOnly=false){
      let coinsChange = [];
      data.forEach(coin => {
        coinsChange.push(Math.round(coin[field]));
      });

      let top = coinsChange.reduce(function(a, b) {
          if(param=='max')
            return Math.max(a, b);
          else
            return Math.min(a, b);
      });

      let i = coinsChange.indexOf(top);
          
      if(i>-1)
        if(!isValOnly)
          return ('symbol: ' + data[i]['symbol'] + ' name: ' + data[i]['name'] + ': ' + top);
        else
          return top;


  }
  
  getTop10Vol(data){
    let top10Vol = [];
    this.d = data;
    let $this = this;
    data.forEach(coin => {
        let top = $this.getTopCoin($this.d, '24h_volume_usd', 'max', true);
        top10Vol.push(top);
        $this.d = $this.arrayRemove($this.d, top);
    });

    console.log(top10Vol);
  }

  equate(data, val, field){
    return data.field === val;
  }

  arrayRemove(obj, val) {
      console.log(obj.find(this.equate(obj,val,'24h_volume_usd'))) ;
      let i = -1;
      if (i >= 0) {
        delete obj.i; 
        return obj.splice( i, 1 );
      }
  }
}
