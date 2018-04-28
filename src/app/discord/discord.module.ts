import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiscordService } from './discord.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [DiscordService]
})
export class DiscordModule { }
