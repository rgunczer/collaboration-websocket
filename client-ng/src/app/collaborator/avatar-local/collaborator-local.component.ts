import { Component, Input } from '@angular/core';
import { Collaborator } from '@model/collaborator.model';


@Component({
  selector: 'app-collaborator-local',
  templateUrl: './collaborator-local.component.html',
  styleUrls: ['./collaborator-local.component.scss']
})
export class CollaboratorLocalComponent {

  @Input() c!: Collaborator;

}
