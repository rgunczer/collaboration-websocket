import { Component, OnInit } from '@angular/core';
import { Person } from '@model/person.model';
import { PersonService } from '@service/person.service';


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
