import { Component, OnInit } from '@angular/core';
import { Person } from '../person.model';
import { PersonService } from '../person.service';

@Component({
  selector: 'app-person-list',
  templateUrl: './person-list.component.html',
  styleUrls: ['./person-list.component.scss']
})
export class PersonListComponent implements OnInit {

  persons: Person[] = [];


  constructor(
    public svc: PersonService
  ) {

  }

  ngOnInit(): void {
    this.persons = this.svc.getPersons();
  }

}
