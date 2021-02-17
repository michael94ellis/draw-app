import { Component } from '@angular/core';3
import firebase from 'firebase';

const config = {
  apiKey: 'uIG5vkoyCGg9Y2hSe8409im5DUdGjtEnd3MInBrz',
  databaseURL: 'https://drawer-7798a-default-rtdb.firebaseio.com'
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'draw-app';

  constructor() {
    firebase.initializeApp(config);
  }
}
