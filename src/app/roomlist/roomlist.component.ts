import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import firebase from 'firebase';
import { DatePipe } from '@angular/common';

export const snapshotToArray = (snapshot: any) => {
  const returnArr = Array();

  snapshot.forEach((childSnapshot: any) => {
    const item = childSnapshot.val();
    item.key = childSnapshot.key;
    returnArr.push(item);
  });

  return returnArr;
};

@Component({
  selector: 'app-roomlist',
  templateUrl: './roomlist.component.html',
  styleUrls: ['./roomlist.component.scss']
})
export class RoomlistComponent implements OnInit {

  username = '';
  displayedColumns: string[] = ['roomname'];
  rooms = [];
  isLoadingResults = true;

  constructor(private route: ActivatedRoute, private router: Router, public datepipe: DatePipe) {
    this.username = localStorage.getItem('username') || "";
    firebase.database().ref('rooms/').on('value', resp => {
      this.rooms = [];
      this.rooms = snapshotToArray(resp) as any;
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
  }

  enterChatRoom(roomname: string) {
    const chat = { roomname: '', username: '', message: '', date: '', type: '' };
    chat.roomname = roomname;
    chat.username = this.username;
    chat.date = this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss') || "";
    chat.message = this.username + ' entered the room';
    chat.type = 'join';
    const room = firebase.database().ref('rooms').child(roomname)

    room.push(chat);

    this.router.navigate(['/chatroom/${roomname}']);
  }

  logout(): void {
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

}