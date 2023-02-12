import { Component, OnInit } from '@angular/core';
import { filter, fromEvent, sampleTime, Subscription } from 'rxjs';
import { Collaborator } from './collaborator.model';
import { WsService } from './ws.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  greeting: any;
  nickName = 'anonymous';
  nickColor = '#0000ff';

  subsGreetings!: Subscription;
  subsPublic!: Subscription;
  subsLogins!: Subscription;
  subsLogouts!: Subscription;
  subsClients!: Subscription;
  status = 'disconnected';
  topicName = 'none';

  collaborators: Collaborator[] = [];


  constructor(
    private ws: WsService
  ) {

  }

  ngOnInit() {
    console.log('AppComponent::ngOnInit');

    fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(
        filter(() => this.status === 'connected'),
        sampleTime(100)
      )
      .subscribe((e: MouseEvent) => {
        const path = `/app/hello/${this.topicName}`;
        this.ws.sendMessage(
          path,
          {
            // type: 'mm',
            name: this.nickName,
            mx: e.clientX,
            my: e.clientY
          }
        );
      });

    this.ws.getOnEvents$().subscribe(event => {
      this.status = event;

      if (event === 'connected') {
        this.subsGreetings = this.ws.stompClient.subscribe(`/topic/greetings/${this.topicName}`, (message:any) => {
          if (message.body) {
            const msg = JSON.parse(message.body);

            for(let i = 0; i < this.collaborators.length; ++i) {
              const collaborator = this.collaborators[i];
              if (collaborator.nick === msg.name) {
                collaborator.mouseX = msg.mx;
                collaborator.mouseY = msg.my;

                break;
              }
            }

          }
        });

        this.subsPublic = this.ws.stompClient.subscribe('/topic/public', (message: any) => {
          console.log('GOT ', message);
        });

      }

      if (event === 'disconnected') {
        this.status = event;

        if (this.subsGreetings) {
          this.subsGreetings.unsubscribe();
        }
        if (this.subsPublic) {
          this.subsPublic.unsubscribe();
        }
        if (this.subsLogins) {
          this.subsLogins.unsubscribe();
        }
        if (this.subsLogouts) {
          this.subsLogouts.unsubscribe();
        }
        if (this.subsClients) {
          this.subsClients.unsubscribe();
        }
      }

    });

    this.subsLogins = this.ws.getOnLogins$().subscribe(
      (collaborator: Collaborator) => {
        this.collaborators.push(collaborator);
      }
    );

    this.subsLogouts = this.ws.getOnLogout$().subscribe(
      (collaborator: Collaborator) => {
        const index = this.collaborators.findIndex(x => x.sessionId === collaborator.sessionId);
        if (index !== -1) {
          this.collaborators.splice(index, 1);
        }
      }
    );

    this.subsClients = this.ws.getOnClients$().subscribe(
      (collaborators: Collaborator[]) => {
        this.collaborators = collaborators;
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

  onSendMessage() {
    const path = `/app/hello/${this.topicName}`;
    this.ws.sendMessage(path, "jancsi es juliska");
  }


}
