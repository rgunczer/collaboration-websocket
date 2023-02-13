import { Component, Input } from '@angular/core';
import { Collaborator } from '@model/collaborator.model';

@Component({
  selector: 'app-collaborator-field-owner',
  templateUrl: './collaborator-field-owner.component.html',
  styleUrls: ['./collaborator-field-owner.component.scss']
})
export class CollaboratorFieldOwnerComponent {
  @Input() owner!: Collaborator | null;
}
