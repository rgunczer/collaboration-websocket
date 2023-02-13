import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PersonEditComponent } from './person/edit/person-edit.component';
import { PersonListComponent } from './person/list/person-list.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'list'
  },
  {
    path: 'list',
    component: PersonListComponent
  },
  {
    path: 'edit/:id',
    component: PersonEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
