import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-field-size',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fieldsize.component.html',
  styleUrls: ['./fieldsize.component.scss']
})
export class FieldSizeComponent implements OnInit, OnChanges {
  @Input() selectedComponent: any;
  @Output() componentUpdated = new EventEmitter<any>();

  selectedSize: string = 'Customize';
  customWidth: number | null = null;
  customHeight: number | null = null;
  customWidthUnit: string = 'px';
  customHeightUnit: string = 'px';
  units = ['px', '%', 'em', 'rem', 'vw', 'vh'];

  ngOnInit() {
    this.initializeSize();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedComponent'] && this.selectedComponent) {
      this.initializeSize();
    }
  }

  initializeSize() {
    if (!this.selectedComponent) return;
    if (!this.selectedComponent.style) {
      this.selectedComponent.style = {};
    }
    if (!this.selectedComponent.classList) {
      this.selectedComponent.classList = [];
    }

    const width = this.selectedComponent.style.width || '';
    const height = this.selectedComponent.style.height || '';
    const classList = this.selectedComponent.classList || [];

    // Preselect size based on width, height, or classList
    if (width === '100px' && height === '30px' && classList.includes('zf-small')) {
      this.selectedSize = 'Small';
    } else if (width === '200px' && height === '40px' && classList.includes('zf-medium')) {
      this.selectedSize = 'Medium';
    } else if (width === '300px' && height === '50px' && classList.includes('zf-large')) {
      this.selectedSize = 'Large';
    } else {
      this.selectedSize = 'Customize';
      this.parseCustomSize(width, height);
    }
  }

  parseCustomSize(width: string, height: string) {
    const widthMatch = width.match(/^(\d+)(.*)$/);
    const heightMatch = height.match(/^(\d+)(.*)$/);
    
    this.customWidth = widthMatch ? parseInt(widthMatch[1], 10) : null;
    this.customWidthUnit = widthMatch && this.units.includes(widthMatch[2]) ? widthMatch[2] : 'px';
    
    this.customHeight = heightMatch ? parseInt(heightMatch[1], 10) : null;
    this.customHeightUnit = heightMatch && this.units.includes(heightMatch[2]) ? heightMatch[2] : 'px';
  }

  setSize(option: string) {
    if (!this.selectedComponent) return;
    if (!this.selectedComponent.style) {
      this.selectedComponent.style = {};
    }
    if (!this.selectedComponent.classList) {
      this.selectedComponent.classList = [];
    }

    let width = '';
    let height = '';
    const classList = ['zf-small', 'zf-medium', 'zf-large'];
    this.selectedComponent.classList = this.selectedComponent.classList.filter((cls: string) => !classList.includes(cls));

    switch (option.toLowerCase()) {
      case 'small':
        width = '100px';
        height = '30px';
        this.selectedComponent.classList.push('zf-small');
        break;
      case 'medium':
        width = '200px';
        height = '40px';
        this.selectedComponent.classList.push('zf-medium');
        break;
      case 'large':
        width = '300px';
        height = '50px';
        this.selectedComponent.classList.push('zf-large');
        break;
      case 'customize':
        width = this.customWidth !== null ? `${this.customWidth}${this.customWidthUnit}` : '';
        height = this.customHeight !== null ? `${this.customHeight}${this.customHeightUnit}` : '';
        break;
    }

    this.selectedComponent.style.width = width;
    this.selectedComponent.style.height = height;
    this.selectedSize = option;
    this.emitUpdate();
  }

  applyCustomSize() {
    if (!this.selectedComponent) return;
    if (!this.selectedComponent.style) {
      this.selectedComponent.style = {};
    }
    if (!this.selectedComponent.classList) {
      this.selectedComponent.classList = [];
    }

    const width = this.customWidth !== null ? `${this.customWidth}${this.customWidthUnit}` : '';
    const height = this.customHeight !== null ? `${this.customHeight}${this.customHeightUnit}` : '';
    this.selectedComponent.classList = this.selectedComponent.classList.filter((cls: string) => !['zf-small', 'zf-medium', 'zf-large'].includes(cls));

    this.selectedComponent.style.width = width;
    this.selectedComponent.style.height = height;
    this.selectedSize = 'Customize';
    this.emitUpdate();
  }

  handleKeyDown(event: KeyboardEvent, field: 'width' | 'height') {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      if (field === 'width') {
        this.customWidth = null;
        this.customWidthUnit = 'px';
      } else {
        this.customHeight = null;
        this.customHeightUnit = 'px';
      }
      this.applyCustomSize();
    }
  }

  private emitUpdate() {
    // Emit a deep copy to ensure change detection
    this.componentUpdated.emit({ ...this.selectedComponent, style: { ...this.selectedComponent.style }, classList: [...this.selectedComponent.classList] });
  }
}