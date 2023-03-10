import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import * as Stomp from 'stompjs';
// import * as SockJS from 'sockjs-client';

import { calcTextColorFromBgColor } from 'src/utils';
import { Collaborator } from '@model/collaborator.model';
import { Snapshot } from '@model/snapshot.model';
import { MouseMoveEvent } from '@model/mouse-move.model';
import { Leave } from '@model/leave.model';
import { FieldAction } from '@model/field-action.model';

type CollaboratorEx = Collaborator & { color: string };
export type StompSubscription = Stomp.Subscription;


@Injectable({
  providedIn: 'root',
})
export class WsService {

  collaborators: Collaborator[] = [];
  collaboratorsMap = new Map<string, Collaborator>();

  private events: Subject<string> = new Subject();
  private loginSub: Stomp.Subscription | undefined;
  private logoutSub: Stomp.Subscription | undefined;
  private clientsSub: Stomp.Subscription | undefined;

  private nickName = '';
  private client!: Stomp.Client | undefined;
  private ws!: WebSocket | undefined;

  get isConnected(): boolean {
    return this.client ? this.client.connected : false;
  }

  get nick(): string {
    return this.nickName;
  }

  getOnEvents$(): Observable<any> {
    return this.events.asObservable();
  }

  connect(nickName: string, nickColor: string): void {
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

  disconnect() {
    if (this.ws) {
      this.client?.disconnect(this.disconnectCallback, {});
    }
  }

  connectSuccess = (frame: Stomp.Frame | undefined) => {
    console.log('connectSuccess [' + frame?.command + ']');

    this.events.next('connected');

    this.loginSub = this.client?.subscribe('/topic/login', this.loginCallback);
    this.logoutSub = this.client?.subscribe('/topic/logout', this.logoutCallback);
    this.clientsSub = this.client?.subscribe('/app/collaborators', this.clientsCallback);
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
    this.fillCollaboratorsMap(this.collaborators);
  }

  logoutCallback = (message: Stomp.Frame) => {
    console.log('logout');

    const collaborator: Collaborator = JSON.parse(message.body);
    const index = this.collaborators.findIndex(x => x.sessionId === collaborator.sessionId);
    if (index !== -1) {
      this.collaborators.splice(index, 1);
      this.collaboratorsMap.delete(collaborator.nick);
      this.sortCollaboratorsByTime(this.collaborators);
      this.fillCollaboratorsMap(this.collaborators);
    }
  }

  clientsCallback = (message: Stomp.Frame) => {
    console.log('clients');

    const collaborators: CollaboratorEx[] = JSON.parse(message.body);
    collaborators.forEach(c => this.preProcessCollaborator(c));

    this.collaborators = collaborators;
    this.sortCollaboratorsByTime(this.collaborators);
    this.fillCollaboratorsMap(this.collaborators);
  }

  sendMouseMovement(entityId: string, event: MouseEvent): void {
    this.send(
      `/app/editing/${entityId}/mouse-moving`,
      {
        nick: this.nickName,
        x: event.clientX, // TODO: calc proper pos based on scroll etc.
        y: event.clientY
      }
    );
  }

  sendFieldInput(entityId: string, fieldName: string, fieldValue: any): void {
    this.send(
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
    this.send(
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
    this.send(
      `/app/editing/${entityId}/field`,
      {
        type: 'blur',
        nick: this.nickName,
        field: fieldName,
        value: '',
      }
    );
  }

  sendLeave(entityId: string): void {
    this.send(
      `/app/editing/${entityId}/leave`,
      {
        nick: this.nickName
      }
    );
  }

  join(
    entityId: string,
    collaboratorsOnThisEntity: Collaborator[],
    localSnapshot: any
  ): Promise<any> {
    localSnapshot.nick = this.nickName;
    collaboratorsOnThisEntity.length = 0;
    return new Promise(
      (resolve, reject) => {

        const sub = this.client?.subscribe(
          `/app/begin/${entityId}`,
          (frame: Stomp.Frame) => {
            const receivedSnapshot: Snapshot = JSON.parse(frame.body);

            this.collaborators.forEach(c => {
              if (receivedSnapshot.collaboratorNames.includes(c.nick)) {
                collaboratorsOnThisEntity.push(c);
              }
            });

            sub?.unsubscribe();

            resolve(receivedSnapshot);
          },
          {
            snapshot: JSON.stringify(localSnapshot)
          }
        );

      }
    );
  }

  listenToMouseMoves(entityId: string, collaborators: Collaborator[]): Stomp.Subscription | undefined {
    return this.client?.subscribe(
      `/topic/editing/${entityId}/mouse-moving`,
      (frame: Stomp.Frame) => {
        const msg: MouseMoveEvent = JSON.parse(frame.body);

        const collaborator = this.collaboratorsMap.get(msg.nick);
        if (collaborator) {
          collaborator.mouseX = msg.x;
          collaborator.mouseY = msg.y;
        }
      }
    );
  }

  listenToJoiners(entityId: string, collaborators: Collaborator[]): Stomp.Subscription | undefined {
    return this.client?.subscribe(
      `/topic/${entityId}/joiner`,
      (frame: Stomp.Frame) => {
        const newJoiner = this.collaboratorsMap.get(frame.body);
        if (newJoiner) {
          collaborators.push(newJoiner);
        }
      }
    );
  }

  listenToLeavers(entityId: string, collaborators: Collaborator[]): Stomp.Subscription | undefined {
    return this.client?.subscribe(
      `/topic/editing/${entityId}/leave`,
      (frame: Stomp.Frame) => {
        const leave: Leave = JSON.parse(frame.body);
        const index = collaborators.findIndex(c => c.nick === leave.nick);
        if (index !== -1) {
          collaborators.splice(index, 1);
        }
      }
    );
  }

  listenToFieldActions(entityId: string, callbackFn: Function): Stomp.Subscription | undefined {
    return this.client?.subscribe(
      `/topic/editing/${entityId}/field`,
      (frame: Stomp.Frame) => {
        const fieldAction: FieldAction = JSON.parse(frame.body);
        callbackFn(fieldAction);
      }
    );
  }

  private send(path: string, obj: any): void {
    this.client?.send(path, {}, JSON.stringify(obj));
  }

  private preProcessCollaborator(c: CollaboratorEx): void {
    c.bgColor = c.color;
    c.textColor = calcTextColorFromBgColor(c.color);
    c.time = new Date(c.time);
  }

  private sortCollaboratorsByTime(collaborators: Collaborator[]): void {
    collaborators.sort((a, b) => a.time.getTime() - b.time.getTime());
  }

  private fillCollaboratorsMap(collaborators: Collaborator[]): void {
    this.collaboratorsMap.clear();
    this.collaborators.forEach(c => {
      this.collaboratorsMap.set(c.nick, c);
    });
  }

  private calcUrl(): string {
    return 'ws://localhost:8080/ws';
  }

}
