import { Injectable } from '@angular/core';
import { City } from '@model/city.model';


@Injectable({
  providedIn: 'root',
})
export class CityService {

  private data: City[] = [
    {
      id: 1,
      name: 'Ohio'
    },
    {
      id: 2,
      name: 'Boston'
    },
    {
      id: 3,
      name: 'Denver'
    },
  ];

  public getCities(): City[] {
    return this.data;
  }

  public getCityById(id: number): City | null {
    for(let i = 0; i < this.data.length; ++i) {
      const item = this.data[i];
      if (item.id === id) {
        return item;
      }
    }
    return null;
  }

}
