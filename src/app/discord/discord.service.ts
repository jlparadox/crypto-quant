import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';


@Injectable()
export class DiscordService {
  discord_url: string;

  constructor(private http: HttpClient) {
    this.discord_url = environment.baseDiscordUrl + environment.buzzBotId;
  }

  send_to_discord(message, botId){
    this.http.post(environment.baseDiscordUrl + environment[botId],
      {
        content: message,
      })
      .subscribe(
        res => {
          console.log(res);
        },
        err => {
          console.log('Error occured');
        }
      );
  }

}
