import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PersonService } from '../person.service';

@Component({
  selector: 'app-person-edit',
  templateUrl: './person-edit.component.html',
  styleUrls: ['./person-edit.component.scss']
})
export class PersonEditComponent implements OnInit {

  id!: string | null;
  name = "";
  age = 0;

  nameStatus = "-";
  ageStatus = "-";


  constructor(
    private route: ActivatedRoute,
    public svc: PersonService
  ) {

  }

  ngOnInit(): void {
      this.id = this.route.snapshot.paramMap.get('id');
      if (this.id) {
        const person = this.svc.getPersonById(parseInt(this.id));

        if (person) {
          this.name = person.name;
          this.age = person.age;
        }

      }
  }

}
