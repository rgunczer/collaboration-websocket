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
      age: 42,
      city: 1,
    },
    {
      id: 2,
      name: 'Arthur',
      age: 44,
      city: 3,
    },
    {
      id: 3,
      name: 'Bill',
      age: 39,
      city: 1,
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
