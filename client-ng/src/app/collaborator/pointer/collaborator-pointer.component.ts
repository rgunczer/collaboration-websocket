import { Component, Input } from '@angular/core';
import { Collaborator } from '@model/collaborator.model';


@Component({
  selector: 'app-collaborator-pointer',
  templateUrl: './collaborator-pointer.component.html',
  styleUrls: ['./collaborator-pointer.component.scss']
})
export class CollaboratorPointerComponent {
  @Input() c!: Collaborator;
  @Input() tx = 100;
  @Input() ty = 20;

}
