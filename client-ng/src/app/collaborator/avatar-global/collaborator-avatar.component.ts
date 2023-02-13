import { Component, Input } from '@angular/core';
import { Collaborator } from '@model/collaborator.model';


@Component({
  selector: 'app-collaborator-avatar',
  templateUrl: './collaborator-avatar.component.html',
  styleUrls: ['./collaborator-avatar.component.scss']
})
export class CollaboratorAvatarComponent {

  @Input() c!: Collaborator;

}
