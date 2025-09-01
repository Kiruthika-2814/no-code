import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-font-family',
  standalone: true,
  imports: [CommonModule, FormsModule],   // 👈 required for ngModel + ngStyle
  templateUrl: './font-family.component.html',
  styleUrls: ['./font-family.component.scss']
})
export class FontFamilyComponent {
  @Input() selectedComponent: any;
  @Output() componentUpdated = new EventEmitter<any>();

  fonts: string[] = [
    'Arial', 'Verdana', 'Tahoma', 'Trebuchet MS',
    'Times New Roman', 'Georgia', 'Garamond',
    'Courier New', 'Brush Script MT', 'Impact',
    'Lucida Console', 'Palatino Linotype',
    'Comic Sans MS', 'Segoe UI', 'Roboto',
    'Open Sans', 'Lato', 'Poppins', 'Montserrat'
  ];

  selectedFont: string = this.fonts[0];   // 👈 define this to fix error

  onFontChange() {
    if (this.selectedComponent) {
      this.selectedComponent.fontFamily = this.selectedFont;
      this.componentUpdated.emit(this.selectedComponent);
    }
  }
}
