import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { calcTextColorFromBgColor } from 'src/utils';


@Component({
  selector: 'app-pointer',
  templateUrl: './pointer.component.html',
  styleUrls: ['./pointer.component.scss']
})
export class PointerComponent implements OnChanges {
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
