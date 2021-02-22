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

interface IRoom {
  name: string,
  users: number
}

@Component({
  selector: 'app-roomlist',
  templateUrl: './roomlist.component.html',
  styleUrls: ['./roomlist.component.scss']
})
export class RoomlistComponent implements OnInit {

  username = '';
  displayedColumns: string[] = ['roomname', 'users'];
  rooms: IRoom[] = [];
  isLoadingResults = true;

  constructor(private route: ActivatedRoute, private router: Router, public datepipe: DatePipe) {
    this.username = localStorage.getItem('username') || "";
    firebase.database().ref('rooms').on('value', resp => {
      this.rooms = [];
      snapshotToArray(resp).forEach(room => {
        let newRoom: IRoom = { name: room.key, users: Object.keys(room.users).length };
        this.rooms.push(newRoom);
      });
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
  }

  enterChatRoom(roomname: string) {
    const chat = { roomname: '', username: '', text: '', date: '', type: '' };
    chat.roomname = roomname;
    chat.username = this.username;
    chat.date = this.datepipe.transform(new Date(), 'MM-dd-yyyy HH:mm:ss') || "";
    chat.text = this.username + ' entered the room';
    chat.type = 'join';
    const room = firebase.database().ref('rooms').child(roomname);
    room.child("messages").push(chat);
    room.child("users").child(this.username).set(true);

    this.router.navigate(['/chatroom/' + roomname]);
  }

  logout(): void {
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

}