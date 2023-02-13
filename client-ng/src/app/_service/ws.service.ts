import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { calcTextColorFromBgColor } from 'src/utils';
import { Collaborator } from '@model/collaborator.model';
// import * as SockJS from 'sockjs-client';

// declare var SockJS;
declare var Stomp;


@Injectable({
  providedIn: 'root',
})
export class WsService {

  collaborators: Collaborator[] = [];


  private events: Subject<any> = new Subject();

  public nickName = '';
  public status = 'disconnected';
  public stompClient;
  private ws;


  public connect(nickName: string, nickColor: string): void {
    this.collaborators = [];

    const url = 'ws://localhost:8080/ws';
    // const ws = new SockJS(url);
    this.ws = new WebSocket(url);
    this.stompClient = Stomp.over(this.ws);
    // this.stompClient.debug = () => {};

    this.stompClient.connect(
      {
        nick: nickName,
        color: nickColor,
      },
      (frame) => {
        this.nickName = nickName;
        this.status = 'connected';

        this.events.next('connected');
        this.stompClient.subscribe('/topic/login', (message:any) => {
          if (message.body) {
            console.log('login');
            const collaborator = JSON.parse(message.body);
            collaborator.bgColor = collaborator.color;
            collaborator.textColor = calcTextColorFromBgColor(collaborator.color);
            this.collaborators.push(collaborator);
          }
        });
        this.stompClient.subscribe('/topic/logout', (message:any) => {
          if (message.body) {
            console.log('logout');
            const collaborator: Collaborator = JSON.parse(message.body);
            const index = this.collaborators.findIndex(x => x.sessionId === collaborator.sessionId);
            if (index !== -1) {
              this.collaborators.splice(index, 1);
            }
          }
        });

				this.stompClient.subscribe("/app/clients", (message: any) => {
					const collaborators = JSON.parse(message.body);

          console.log("collaborators: ", collaborators);
          collaborators.forEach(c => {
            c.bgColor = c.color;
            c.textColor = calcTextColorFromBgColor(c.color);
          })
          this.collaborators = collaborators;
				});

      },
      (error) => {
        alert('error');
        console.log(error);
        this.events.next('disconnected');
        this.status = 'disconnected';
      }
    );

  }

  public disconnect() {
    if (this.ws) {
      this.status = 'disconnected';
      this.stompClient.disconnect();
      this.ws.close();
      setTimeout(() => {
        this.stompClient = null;
        this.ws = null;
      });
    }
  }

  getOnEvents$(): Observable<any> {
      return this.events.asObservable();
  }

  sendMessage(path, obj) {
    this.stompClient.send(path, {}, JSON.stringify(obj));
  }

}
