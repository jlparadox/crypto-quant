import {Component, Input, OnInit} from '@angular/core';
import {Form, FormGroup} from '@angular/forms';
import {AngularFirestore} from 'angularfire2/firestore';

@Component({
  selector: 'app-watch-list-form',
  templateUrl: './watch-list-form.component.html',
  styleUrls: ['./watch-list-form.component.css']
})
export class WatchListFormComponent implements OnInit {
  watchlist;
  @Input() watchlistForm: Form;
  watchlistEntry: string;

  constructor(private db: AngularFirestore) {
    this.watchlist = db.collection('/watchlist').valueChanges();
  }

  ngOnInit() {
  }

  onDelete(symbol) {
    this.db.collection('/watchlist').doc(symbol).delete().then(function () {
      console.log('Document successfully deleted!');
    }).catch(function (error) {
      console.error('Error removing document: ', error);
    });
  }

  onSubmit() {
    console.log(this.watchlistEntry);
    this.db.collection('/watchlist').doc(this.watchlistEntry).set({
      symbol: this.watchlistEntry,
      date: new Date(),
    });
  }

}
