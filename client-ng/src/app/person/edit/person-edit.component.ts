import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, fromEvent, sampleTime, Subject, takeUntil } from 'rxjs';
import { Collaborator } from '@model/collaborator.model';
import { FieldAction } from '@model/field-action.model';
import { PersonService } from '@service/person.service';
import { WsService } from '@service/ws.service';


@Component({
  selector: 'app-person-edit',
  templateUrl: './person-edit.component.html',
  styleUrls: ['./person-edit.component.scss']
})
export class PersonEditComponent implements OnInit {

  private destroy$ = new Subject();
  private entityId = '';

  id!: string | null;
  name = "";
  age = 0;
  nick = "-";

  nameOwner: Collaborator | null = null;
  nameStatus = "-";

  ageOwner: Collaborator | null = null;
  ageStatus = "-";


  collaborators: Collaborator[] = [];



  constructor(
    private route: ActivatedRoute,
    private ws: WsService,
    public svc: PersonService
  ) {

  }

  ngOnInit(): void {
      this.nick = this.ws.nickName;

      this.id = this.route.snapshot.paramMap.get('id');
      if (this.id) {
        const person = this.svc.getPersonById(parseInt(this.id));

        if (person) {
          this.name = person.name;
          this.age = person.age;

          this.entityId = 'edit.' + this.id;

          fromEvent<MouseEvent>(document, 'mousemove')
            .pipe(
              filter(() => this.ws.status === 'connected'),
              sampleTime(100),
              takeUntil(this.destroy$)
            )
            .subscribe((e: MouseEvent) => {
              const path = `/app/editing/${this.entityId}/mouse-moving`;
              this.ws.sendMessage(
                path,
                {
                  name: this.ws.nickName,
                  mx: e.clientX,
                  my: e.clientY
                }
              );
            });


          if (this.ws.status === 'connected') {
            this.ws.sendMessage(`/app/editing/${this.entityId}/enter`, {
              type: 'person',
              entity_id: this.id,
              nick: this.ws.nickName,
              fields: [
                {
                  name: 'name',
                  value: this.name,
                  owner: '-'
                },
                {
                  name: 'age',
                  value: this.age,
                  owner: '-'
                }
              ]
            });

            this.ws.stompClient?.subscribe(`/topic/editing/${this.entityId}/enter`, (message:any) => {
              if (message.body) {
                const msg = JSON.parse(message.body);

                // debugger;
                this.collaborators = [];
                this.ws.collaborators.forEach(c => {
                  if (msg.collaboratorNames.includes(c.nick)) {
                    this.collaborators.push(c);
                  }
                });

              }
            });

            this.ws.stompClient?.subscribe(`/topic/editing/${this.entityId}/mouse-moving`, (message:any) => {
              if (message.body) {
                const msg = JSON.parse(message.body);

                for(let i = 0; i < this.ws.collaborators.length; ++i) {
                  const collaborator = this.ws.collaborators[i];
                  if (collaborator.nick === msg.name) {
                    collaborator.mouseX = msg.mx;
                    collaborator.mouseY = msg.my;

                    break;
                  }
                }

              }
            });

            this.ws.stompClient?.subscribe(`/topic/editing/${this.entityId}/field`, (message: any) => {
              if (message.body) {
                const msg: FieldAction = JSON.parse(message.body);

                for (let i = 0; i < this.ws.collaborators.length; ++i) {
                  const collaborator = this.ws.collaborators[i];
                  if (collaborator.nick === msg.nick) {
                    if (msg.field === 'name') {
                      if (msg.type === 'focus') {
                        this.nameOwner = collaborator;
                      }
                      if (msg.type === 'blur' && this.nameOwner === collaborator) {
                        this.nameOwner = null;
                      }
                      if (msg.type === 'input' && this.nameOwner === collaborator) {
                        this.name = msg.value;
                      }
                    }

                    if (msg.field === 'age') {
                      if (msg.type === 'focus') {
                        this.ageOwner = collaborator;
                      }
                      if (msg.type === 'blur' && this.ageOwner === collaborator) {
                        this.ageOwner = null;
                      }
                      if (msg.type === 'input' && this.ageOwner === collaborator) {
                        this.age = parseInt(msg.value);
                      }
                    }


                  }
                }

              }
            });

          }

        }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  onFocus(event): void {
    const elementName = event.target.name;
    console.log(`focus [${elementName}]`);

    this.ws.sendMessage(`/app/editing/${this.entityId}/field`, {
      type: 'focus',
      nick: this.nick,
      field: elementName,
      value: '',
    });
  }

  onBlur(event): void {
    const elementName = event.target.name;

    console.log(`blur [${elementName}]`);

    this.ws.sendMessage(`/app/editing/${this.entityId}/field`, {
      type: 'blur',
      nick: this.nick,
      field: elementName,
      value: '',
    });
  }

  onInput(event): void {
    const elementName = event.target.name;
    const text = event.target.value;

    console.log(`input [${elementName}]`);

    this.ws.sendMessage(`/app/editing/${this.entityId}/field`, {
      type: 'input',
      nick: this.nick,
      field: elementName,
      value: text,
    });

  }

}
