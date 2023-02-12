import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PersonListComponent } from './person-list/person-list.component';
import { PersonEditComponent } from './person-edit/person-edit.component';
import { PointerComponent } from './pointer/pointer.component';
import { CollaboratorComponent } from './collaborator/collaborator.component';


@NgModule({
  declarations: [
    AppComponent,
    PersonListComponent,
    PersonEditComponent,
    PointerComponent,
    CollaboratorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
