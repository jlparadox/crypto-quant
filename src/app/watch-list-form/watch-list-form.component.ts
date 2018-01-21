import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'angular-2-local-storage';

@Component({
  selector: 'app-watch-list-form',
  templateUrl: './watch-list-form.component.html',
  styleUrls: ['./watch-list-form.component.css']
})
export class WatchListFormComponent implements OnInit {
  watchlist = [];

  submitted = false;

  constructor() { }

  ngOnInit() {
  }

  onSubmit() { this.submitted = true; }

}
