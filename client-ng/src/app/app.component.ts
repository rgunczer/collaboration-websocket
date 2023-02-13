import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { getRandomUsername, getRandomColorRGBAsString } from 'src/utils';
import { WsService } from './_service/ws.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  nickName = getRandomUsername();
  nickColor = getRandomColorRGBAsString();
  status = 'disconnected';

  get collaborators() {
    return this.ws.collaborators;
  }


  constructor(
    private router: Router,
    private ws: WsService
  ) {

  }

  ngOnInit() {
    console.log('AppComponent -> ngOnInit');
    this.router.navigate(['']);

    this.ws.getOnEvents$().subscribe(
      event => {
        this.status = event;
      }
    );
  }

  onConnect() {
    this.ws.connect(this.nickName, this.nickColor);
  }

  onDisconnect() {
    this.ws.disconnect();
    this.status = 'disconnected';
  }

}
