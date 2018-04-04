import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {AngularFirestoreModule} from 'angularfire2/firestore';
import {AngularFireStorageModule} from 'angularfire2/storage';
import {AngularFireAuthModule} from 'angularfire2/auth';
import { AuthService } from './auth.service';

@NgModule({
  imports: [
    CommonModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
  ],
  declarations: [],
  providers: [AuthService]
})
export class CoreModule { }
