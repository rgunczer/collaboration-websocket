import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { calcTextColorFromBgColor } from 'src/utils';


@Component({
  selector: 'app-collaborator-pointer',
  templateUrl: './collaborator-pointer.component.html',
  styleUrls: ['./collaborator-pointer.component.scss']
})
export class CollaboratorPointerComponent implements OnChanges {
  @Input() color = '#0000ff';
  @Input() label = 'Marjory';
  textColor = 'white';
  @Input() tx = 100;
  @Input() ty = 20;


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['color']) {
      const bgColor = changes['color'].currentValue;
      if (bgColor) {
        this.textColor = calcTextColorFromBgColor(bgColor);
      }
    }
  }

}
