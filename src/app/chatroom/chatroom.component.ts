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

  chatForm!: FormGroup;
  username: string = '';
  roomkey: string = '';
  owner: string = '';
  text: string = "";
  users: any[] = [];
  messages: IChat[] = [];
  matcher = new MyErrorStateMatcher();
  private isNearBottom = true;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    public datepipe: DatePipe) {
    this.username = localStorage.getItem('username') || "";
    this.roomkey = this.route.snapshot.params.roomkey;
    console.log("ENTER ROOM " + this.roomkey)
    let chatroomRef = firebase.database().ref('rooms').child(this.roomkey);
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
      this.scrollToBottom();
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
    chat.username = this.username;
    chat.date = this.datepipe.transform(new Date(), 'MM-dd-yyyy HH:mm:ss');
    chat.type = 'message';
    const newMessage = firebase.database().ref('rooms').child(this.roomkey).child("messages").push();
    newMessage.set(chat);
    this.chatForm = this.formBuilder.group({
      'text': [null, Validators.required]
    });
  }

  private isUserNearBottom(): boolean {
    const threshold = 150;
    const position = this.chatcontent.nativeElement.scrollTop + this.chatcontent.nativeElement.offsetHeight;
    const height = this.chatcontent.nativeElement.scrollHeight;
    return position > height - threshold;
  }

  private scrollToBottom(): void {
    this.chatcontent.nativeElement.scrollTop = this.chatcontent.nativeElement.scrollHeight;
  }

  exitChat() {
    const chat: IChat = { username: '', text: '', date: '', type: '' };
    chat.username = this.username;
    chat.date = this.datepipe.transform(new Date(), 'MM-dd-yyyy HH:mm:ss') || "";
    chat.text = this.username + ' left the room.';
    chat.type = 'exit';
    const room = firebase.database().ref('rooms').child(this.roomkey);
    room.child("messages").push(chat);
    room.child("users").child(this.username).remove();
    this.router.navigate(['roomlist']);
  }

}