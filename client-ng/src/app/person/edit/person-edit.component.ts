import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { filter, fromEvent, sampleTime, Subject, takeUntil } from 'rxjs';
import { Collaborator } from '@model/collaborator.model';
import { FieldAction } from '@model/field-action.model';
import { PersonService } from '@service/person.service';
import { StompSubscription, WsService } from '@service/ws.service';
import { Snapshot } from '@model/snapshot.model';


@Component({
  selector: 'app-person-edit',
  templateUrl: './person-edit.component.html',
  styleUrls: ['./person-edit.component.scss']
})
export class PersonEditComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject();
  private entityId = '';

  subMouseMoves: StompSubscription | undefined;
  subJoiners: StompSubscription | undefined;
  subLeavers: StompSubscription | undefined;
  subFieldActions: StompSubscription | undefined;

  id!: string | null;

  get nick(): string {
    return this.ws.nick;
  }

  nameOwner: Collaborator | null = null;
  ageOwner: Collaborator | null = null;

  collaborators: Collaborator[] = [];

  frm = this.fb.group({
    name: [''],
    age: [0],
    city: [''],
  });


  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
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

      this.frm.setValue({
        name: person.name,
        age: person.age,
        city: 'New York'
      });

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

    const localSnapshot = {
      type: 'person',
      entity_id: this.id,
      fields: [
        {
          name: 'name',
          value: this.frm.get('name')?.value,
          owner: '-'
        },
        {
          name: 'age',
          value: this.frm.get('age')?.value,
          owner: '-'
        }
      ]
    };

    this.ws.join(this.entityId, this.collaborators, localSnapshot)
      .then((snapshot: Snapshot) => {
        this.updateFieldsFromSnapshot(snapshot);
        this.listenToCollaboratorMouseMoves();
        this.listenToCollaboratorFieldActions();
        this.listenToJoiners();
        this.listenToLeavers();
        this.sendMouseMovements();
      });
  }

  private updateFieldsFromSnapshot(snapshot: Snapshot): void {
    let field = snapshot.fields['name'];
    if (field) {
      this.frm.get('name')?.setValue(field.value);
      const ownerName = field.owner;
      this.nameOwner = this.collaborators.find(c => c.nick === ownerName) ?? null;
    }

    field = snapshot.fields['age'];
    if (field) {
      this.frm.get('age')?.setValue(field.value);
      const ownerName = field.owner;
      this.nameOwner = this.collaborators.find(c => c.nick === ownerName) ?? null;
    }
  }

  private listenToJoiners(): void {
    this.subJoiners = this.ws.listenToJoiners(this.entityId, this.collaborators);
  }

  private listenToLeavers(): void {
    this.subLeavers = this.ws.listenToLeavers(this.entityId, this.collaborators);
  }

  private listenToCollaboratorMouseMoves(): void {
    console.log('listenToCollaboratorMouseMoves');
    this.subMouseMoves = this.ws.listenToMouseMoves(this.entityId, this.collaborators);
  }

  private listenToCollaboratorFieldActions(): void {
    console.log('listenToCollaboratorFieldActions');

    this.subFieldActions = this.ws.listenToFieldActions(this.entityId, (msg: FieldAction) => {
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
              this.frm.get('name')?.setValue(msg.value, { emitEvent: false });
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
              this.frm.get('age')?.setValue(parseInt(msg.value), { emitEvent: false });
            }
          }
        }
      }
    });
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
    console.log('ngOnDestroy');

    if (this.ws.isConnected) {
      this.ws.sendLeave(this.entityId);
    }

    this.destroy$.next(null);
    this.destroy$.complete();

    if (this.subMouseMoves) {
      this.subMouseMoves.unsubscribe();
      this.subMouseMoves = undefined;
    }

    if (this.subJoiners) {
      this.subJoiners.unsubscribe();
      this.subJoiners = undefined;
    }

    if (this.subLeavers) {
      this.subLeavers.unsubscribe();
      this.subLeavers = undefined;
    }

    if (this.subFieldActions) {
      this.subFieldActions.unsubscribe();
      this.subFieldActions = undefined;
    }
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

  onSubmit(): void {
    console.log('onSubmit');

    console.warn(this.frm.value);
  }

}
