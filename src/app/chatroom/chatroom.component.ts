import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import firebase from 'firebase';
import { DatePipe } from '@angular/common';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

export const snapshotToArray = (snapshot: any) => {
  const returnArr: any[] = [];

  snapshot.forEach((childSnapshot: any) => {
    const item = childSnapshot.val();
    item.key = childSnapshot.key;
    returnArr.push(item);
  });

  return returnArr;
};

interface IChat {
  roomname: string,
  username: string,
  text: string,
  date: string,
  type: string
}

@Component({
  selector: 'app-chatroom',
  host: { 'window:unload': 'exitChat' },
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.scss']
})
export class ChatroomComponent implements OnInit {

  @ViewChild('chatcontent')
  chatcontent!: ElementRef;
  scrolltop: number = 0;

  chatForm!: FormGroup;
  username: string = '';
  roomname: string = '';
  owner: string = '';
  text: string = "";
  users: any[] = [];
  messages: IChat[] = [];
  matcher = new MyErrorStateMatcher();

  constructor(private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    public datepipe: DatePipe) {
    this.username = localStorage.getItem('username') || "";
    this.roomname = this.route.snapshot.params.roomname;
    console.log("ENTER ROOM " + this.roomname)
    let chatroomRef = firebase.database().ref('rooms').child(this.roomname);
    chatroomRef.child("users").on('value', (resp: any) => {
      const usersArray: any[] = [];
      resp.forEach((childSnapshot: any) => {
        if (childSnapshot.val() == true) {
          usersArray.push(childSnapshot.key);
        }
      });
      this.users = usersArray;
    });
    chatroomRef.child("messages").on('value', (resp: any) => {
      this.messages = snapshotToArray(resp) || [];
    });
    chatroomRef.child("owner").on('value', (resp: any) => {
      this.owner = resp.val();
    });
  }

  ngOnInit(): void {
    this.chatForm = this.formBuilder.group({
      'text': [null, Validators.required]
    });
  }

  onFormSubmit(form: any) {
    const chat = form;
    chat.roomname = this.roomname;
    chat.username = this.username;
    chat.date = this.datepipe.transform(new Date(), 'MM-dd-yyyy HH:mm:ss');
    chat.type = 'message';
    const newMessage = firebase.database().ref('rooms').child(this.roomname).child("messages").push();
    newMessage.set(chat);
    this.chatForm = this.formBuilder.group({
      'text': [null, Validators.required]
    });
  }

  exitChat() {
    const chat: IChat = { roomname: '', username: '', text: '', date: '', type: '' };
    chat.roomname = this.roomname;
    chat.username = this.username;
    chat.date = this.datepipe.transform(new Date(), 'MM-dd-yyyy HH:mm:ss') || "";
    chat.text = this.username + ' left the room.';
    chat.type = 'exit';
    const room = firebase.database().ref('rooms').child(this.roomname);
    room.child("messages").push(chat);
    room.child("users").child(this.username).remove();
    this.router.navigate(['roomlist']);
  }

}