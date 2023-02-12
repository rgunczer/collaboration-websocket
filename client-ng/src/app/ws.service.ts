import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Collaborator } from './collaborator.model';
// import * as SockJS from 'sockjs-client';

// declare var SockJS;
declare var Stomp;


@Injectable({
  providedIn: 'root',
})
export class WsService {

  private events: Subject<any> = new Subject();
  private login$: Subject<Collaborator> = new Subject();
  private logout$: Subject<Collaborator> = new Subject();
  private clients$: Subject<Collaborator[]> = new Subject();

  public stompClient;
  private ws;


  public connect(nickName: string, nickColor: string): void {
    const url = 'ws://localhost:8080/ws';
    // const ws = new SockJS(url);
    this.ws = new WebSocket(url);
    this.stompClient = Stomp.over(this.ws);
    this.stompClient.debug = () => {};

    this.stompClient.connect(
      {
        zlatan: 'value-zlatan',
        milos: 'value-milos',
        nick: nickName,
        color: nickColor,
      },
      (frame) => {
        this.events.next('connected');
        this.stompClient.subscribe('/topic/login', (message:any) => {
          if (message.body) {
            console.log('login');
            this.login$.next(JSON.parse(message.body));
          }
        });
        this.stompClient.subscribe('/topic/logout', (message:any) => {
          if (message.body) {
            console.log('logout');
            this.logout$.next(JSON.parse(message.body));
          }
        });

				this.stompClient.subscribe("/app/clients", (message: any) => {
					const clients = JSON.parse(message.body);

          console.log("clients: ", clients);
          this.clients$.next(clients);
				});

      },
      (error) => {
        alert('error');
        console.log(error);
        this.events.next('disconnected');
      }
    );

  }

  public disconnect() {
    if (this.ws) {
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

  getOnLogins$(): Observable<Collaborator> {
      return this.login$.asObservable();
  }

  getOnLogout$(): Observable<Collaborator> {
      return this.logout$.asObservable();
  }

  getOnClients$(): Observable<Collaborator[]> {
      return this.clients$.asObservable();
  }

  sendMessage(path, obj) {
    this.stompClient.send(path, {}, JSON.stringify(obj));
  }

}
