import { Injectable } from '@angular/core';
import { Person } from '@model/person.model';


@Injectable({
  providedIn: 'root',
})
export class PersonService {

  private data: Person[] = [
    {
      id: 1,
      name: 'Micah',
      age: 42
    },
    {
      id: 2,
      name: 'Arthur',
      age: 44
    },
    {
      id: 3,
      name: 'Bill',
      age: 39
    }
  ];

  public getPersons(): Person[] {
    return this.data;
  }

  public getPersonById(id: number): Person | null {
    for(let i = 0; i < this.data.length; ++i) {
      const person = this.data[i];
      if (person.id === id) {
        return person;
      }
    }
    return null;
  }

}
