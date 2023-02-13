import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// person
import { PersonListComponent } from './person/list/person-list.component';
import { PersonEditComponent } from './person/edit/person-edit.component';

// collaborator
import { CollaboratorPointerComponent } from './collaborator/pointer/collaborator-pointer.component';
import { CollaboratorAvatarComponent } from './collaborator/avatar-global/collaborator-avatar.component';
import { CollaboratorLocalComponent } from './collaborator/avatar-local/collaborator-local.component';
import { CollaboratorFieldOwnerComponent } from './collaborator/field-owner/collaborator-field-owner.component';


@NgModule({
  declarations: [
    AppComponent,
    PersonListComponent,
    PersonEditComponent,
    CollaboratorPointerComponent,
    CollaboratorAvatarComponent,
    CollaboratorLocalComponent,
    CollaboratorFieldOwnerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
