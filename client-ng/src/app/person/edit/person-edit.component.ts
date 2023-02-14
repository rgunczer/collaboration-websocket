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

  get nick(): string {
    return this.ws.nickName;
  }

  nameOwner: Collaborator | null = null;
  ageOwner: Collaborator | null = null;

  collaborators: Collaborator[] = [];


  constructor(
    private route: ActivatedRoute,
    private ws: WsService,
    public svc: PersonService
  ) {

  }

  ngOnInit(): void {
    console.log('ngOnInit');

    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      const id = parseInt(this.id)
      this.load(id);
    }
  }

  private load(id: number): void {
    console.log('load [' + id + ']');

    const person = this.svc.getPersonById(id);
    if (person) {
      this.name = person.name;
      this.age = person.age;

      this.entityId = 'edit|' + id;

      setTimeout(() => this.beginCollaboration());
    } else {
      console.warn('Person with [id: ${id}] NOT found!');
    }
  }

  private beginCollaboration(): void {
    console.log('beginCollaboration');

    if (!this.ws.isConnected) {
      console.log('not connected collaboration aborted');
      return;
    }

    const currentEntityStatus = {
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
    };

    this.ws.getCollaboratorsAndCurrentState(this.entityId, this.collaborators, currentEntityStatus)
      .then((msg: any) => {
        debugger;
        this.listenToCollaboratorMouseMoves();
        this.listenToCollaboratorFieldActions();
        this.sendMouseMovements();
      });
  }

  private listenToCollaboratorMouseMoves(): void {
    console.log('listenToCollaboratorMouseMoves');

    // this.ws.client?.subscribe(`/topic/editing/${this.entityId}/mouse-moving`, (message:any) => {
    //   if (message.body) {
    //     const msg = JSON.parse(message.body);

    //     for(let i = 0; i < this.ws.collaborators.length; ++i) {
    //       const collaborator = this.ws.collaborators[i];
    //       if (collaborator.nick === msg.name) {
    //         collaborator.mouseX = msg.mx;
    //         collaborator.mouseY = msg.my;

    //         break;
    //       }
    //     }

    //   }
    // });
  }

  private listenToCollaboratorFieldActions(): void {
    console.log('listenToCollaboratorFieldActions');

    // this.ws.client?.subscribe(`/topic/editing/${this.entityId}/field`, (message: any) => {
    //   if (message.body) {
    //     const msg: FieldAction = JSON.parse(message.body);

    //     for (let i = 0; i < this.ws.collaborators.length; ++i) {
    //       const collaborator = this.ws.collaborators[i];
    //       if (collaborator.nick === msg.nick) {
    //         if (msg.field === 'name') {
    //           if (msg.type === 'focus') {
    //             this.nameOwner = collaborator;
    //           }
    //           if (msg.type === 'blur' && this.nameOwner === collaborator) {
    //             this.nameOwner = null;
    //           }
    //           if (msg.type === 'input' && this.nameOwner === collaborator) {
    //             this.name = msg.value;
    //           }
    //         }

    //         if (msg.field === 'age') {
    //           if (msg.type === 'focus') {
    //             this.ageOwner = collaborator;
    //           }
    //           if (msg.type === 'blur' && this.ageOwner === collaborator) {
    //             this.ageOwner = null;
    //           }
    //           if (msg.type === 'input' && this.ageOwner === collaborator) {
    //             this.age = parseInt(msg.value);
    //           }
    //         }


    //       }
    //     }

    //   }
    // });

  }

  private sendMouseMovements(): void {
    console.log('sendMouseMovements');

    fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(
        filter(() => this.ws.isConnected),
        sampleTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe(
        (e: MouseEvent) => this.ws.sendMouseMovement(this.entityId, e)
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  onFocus(event: any): void {
    const fieldName = event.target.name;
    this.ws.sendFieldFocus(this.entityId, fieldName);
  }

  onBlur(event): void {
    const fieldName = event.target.name;
    this.ws.sendFieldBlur(this.entityId, fieldName);
  }

  onInput(event: any): void {
    const elementName = event.target.name;
    const text = event.target.value;

    this.ws.sendFieldInput(
      this.entityId,
      elementName,
      text,
    );
  }

}
