import {Component, Input, OnInit} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {Form} from '@angular/forms';

@Component({
  selector: 'app-portfolio-form',
  templateUrl: './portfolio-form.component.html',
  styleUrls: ['./portfolio-form.component.css']
})
export class PortfolioFormComponent implements OnInit {
  portfolio;
  @Input() portfolioForm: Form;
  portfolioEntry: string;

  constructor(private db: AngularFirestore) {
    this.portfolio = db.collection('/portfolio').valueChanges();
  }

  ngOnInit() {
  }

  onDelete(symbol) {
    this.db.collection('/portfolio').doc(symbol).delete().then(function () {
      console.log('Document successfully deleted!');
    }).catch(function (error) {
      console.error('Error removing document: ', error);
    });
  }

  onSubmit() {
    console.log(this.portfolioEntry);
    this.db.collection('/portfolio').doc(this.portfolioEntry).set({
      symbol: this.portfolioEntry,
      date: new Date(),
    });
  }

}
