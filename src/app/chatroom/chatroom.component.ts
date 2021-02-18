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
  message: string,
  date: string,
  type: string
}

@Component({
  selector: 'app-chatroom',
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
  message: string = "";
  users: any[] = [];
  chats: any[] = [];
  matcher = new MyErrorStateMatcher();

  constructor(private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    public datepipe: DatePipe) {
    this.username = localStorage.getItem('username') || "";
    this.roomname = this.route.snapshot.params.roomname;
    firebase.database().ref('rooms').orderByChild('users').on('value', (resp: any) => {
      this.users = snapshotToArray(resp) || [];
    });
  }

  ngOnInit(): void {
    this.chatForm = this.formBuilder.group({
      'message': [null, Validators.required]
    });
  }

  onFormSubmit(form: any) {
    const chat = form;
    chat.roomname = this.roomname;
    chat.username = this.username;
    chat.date = this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss');
    chat.type = 'message';
    const newMessage = firebase.database().ref('rooms').child("messages").push();
    newMessage.set(chat);
    this.chatForm = this.formBuilder.group({
      'message': [null, Validators.required]
    });
  }

  exitChat() {
    const chat: IChat = { roomname: '', username: '', message: '', date: '', type: '' };
    chat.roomname = this.roomname;
    chat.username = this.username;
    chat.date = this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss') || "";
    chat.message = this.username + ' left the room';
    chat.type = 'exit';
    const newMessage = firebase.database().ref('rooms').child("messages").push();
    newMessage.set(chat);

    this.router.navigate(['roomlist/']);
  }

}