import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { calcTextColorFromBgColor } from 'src/utils';


@Component({
  selector: 'app-collaborator',
  templateUrl: './collaborator.component.html',
  styleUrls: ['./collaborator.component.scss']
})
export class CollaboratorComponent implements OnChanges {
  @Input() color = '#0000ff';
  @Input() label = 'Anonymous';
  textColor = 'white';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['color']) {
      const bgColor = changes['color'].currentValue;
      if (bgColor) {
        this.textColor = calcTextColorFromBgColor(bgColor);
      }
    }
  }

}
