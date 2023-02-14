import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import * as Stomp from 'stompjs';
// import * as SockJS from 'sockjs-client';

import { calcTextColorFromBgColor } from 'src/utils';
import { Collaborator } from '@model/collaborator.model';

type CollaboratorEx = Collaborator & { color: string };


@Injectable({
  providedIn: 'root',
})
export class WsService {

  collaborators: Collaborator[] = [];

  private events: Subject<string> = new Subject();
  private loginSub: Stomp.Subscription | undefined;
  private logoutSub: Stomp.Subscription | undefined;
  private clientsSub: Stomp.Subscription | undefined;

  public nickName = '';
  public client!: Stomp.Client | undefined;
  private ws!: WebSocket | undefined;

  public get isConnected(): boolean {
    return this.client ? this.client.connected : false;
  }

  private calcUrl(): string {
    return 'ws://localhost:8080/ws';
  }

  public connect(nickName: string, nickColor: string): void {
    this.nickName = nickName;
    this.collaborators = [];

    const url = this.calcUrl();
    // const ws = new SockJS(url);
    this.ws = new WebSocket(url);
    this.client = Stomp.over(this.ws);
    // this.noStompDebug();

    const headers = {
      nick: nickName,
      color: nickColor,
    };

    this.client.connect(headers, this.connectSuccess, this.connectError);
  }

  private noStompDebug() {
    if (this.client) {
      this.client.debug = () => {};
    }
  }

  public disconnect() {
    if (this.ws) {
      this.client?.disconnect(this.disconnectCallback, {});
    }
  }

  connectSuccess = (frame: Stomp.Frame | undefined) => {
    console.log('connectSuccess [' + frame?.command + ']');

    this.events.next('connected');

    this.loginSub = this.client?.subscribe('/topic/login', this.loginCallback);
    this.logoutSub = this.client?.subscribe('/topic/logout', this.logoutCallback);
    this.clientsSub = this.client?.subscribe('/app/clients', this.clientsCallback);
  }

  connectError = (error) => {
    alert('error');
    console.log(error);
    this.events.next('disconnected');
  }

  disconnectCallback = () => {
    this.collaborators = [];
    this.ws?.close();

    // TODO: check proper cleanup
    // this.loginSub?.unsubscribe();
    // this.logoutSub?.unsubscribe();
    // this.clientsSub?.unsubscribe();

    this.client = undefined;
    this.ws = undefined;
  }

  loginCallback = (message: Stomp.Frame) => {
    console.log('login');

    const collaborator = JSON.parse(message.body);
    this.preProcessCollaborator(collaborator);
    this.collaborators.push(collaborator);
    this.sortCollaboratorsByTime(this.collaborators);
  }

  logoutCallback = (message: Stomp.Frame) => {
    console.log('logout');

    const collaborator: Collaborator = JSON.parse(message.body);
    const index = this.collaborators.findIndex(x => x.sessionId === collaborator.sessionId);
    if (index !== -1) {
      this.collaborators.splice(index, 1);
      this.sortCollaboratorsByTime(this.collaborators);
    }
  }

  clientsCallback = (message: Stomp.Frame) => {
    console.log('clients');

    const collaborators: CollaboratorEx[] = JSON.parse(message.body);
    collaborators.forEach(c => this.preProcessCollaborator(c));

    this.collaborators = collaborators;
    this.sortCollaboratorsByTime(this.collaborators);
  }

  getOnEvents$(): Observable<any> {
    return this.events.asObservable();
  }

  private sendMessage(path: string, obj: any): void {
    this.client?.send(path, {}, JSON.stringify(obj));
  }

  sendMouseMovement(entityId: string, event: MouseEvent): void {
    this.sendMessage(
      `/app/editing/${entityId}/mouse-moving`,
      {
        name: this.nickName,
        mx: event.clientX, // TODO: calc proper pos based on scroll etc.
        my: event.clientY
      }
    );
  }

  sendFieldInput(entityId: string, fieldName: string, fieldValue: any): void {
    this.sendMessage(
      `/app/editing/${entityId}/field`,
      {
        type: 'input',
        nick: this.nickName,
        field: fieldName,
        value: fieldValue,
      }
    );
  }

  sendFieldFocus(entityId: string, fieldName: string): void {
    this.sendMessage(
      `/app/editing/${entityId}/field`,
      {
        type: 'focus',
        nick: this.nickName,
        field: fieldName,
        value: '',
      }
    );
  }

  sendFieldBlur(entityId: string, fieldName: string): void {
    this.sendMessage(
      `/app/editing/${entityId}/field`,
      {
        type: 'blur',
        nick: this.nickName,
        field: fieldName,
        value: '',
      }
    );
  }

  getCollaboratorsAndCurrentState(
    entityId: string,
    collaboratorsOnThisEntity: Collaborator[],
    currentEntityStatus: any
  ): Promise<any> {
    collaboratorsOnThisEntity.length = 0;
    return new Promise(
      (resolve, reject) => {

        const sub = this.client?.subscribe(
          `/app/begin/${entityId}`,
          (frame: Stomp.Frame) => {
            const msg = JSON.parse(frame.body);

            debugger;

            this.collaborators.forEach(c => {
              if (msg.collaboratorNames.includes(c.nick)) {
                collaboratorsOnThisEntity.push(c);
              }
            });

            sub?.unsubscribe();

            resolve({ msg });
          },
          {
            snapshot: JSON.stringify(currentEntityStatus)
          }
        );

      }
    );
  }


  private preProcessCollaborator(c: CollaboratorEx): void {
    c.bgColor = c.color;
    c.textColor = calcTextColorFromBgColor(c.color);
    c.time = new Date(c.time);
  }

  private sortCollaboratorsByTime(collaborators: Collaborator[]): void {
    collaborators.sort((a, b) => a.time.getTime() - b.time.getTime());
  }

}
