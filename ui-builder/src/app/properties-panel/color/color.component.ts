import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DashboardComponent {
  type: string;
  id: string;
  style?: string;
  color?: string;
  opacity?: number;
  backgroundColor?: string;
}

@Component({
  selector: 'app-color',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './color.component.html'
})
export class ColorComponent implements OnChanges {
  @Input() selectedComponent: DashboardComponent | null = null;
  @Output() componentUpdated = new EventEmitter<DashboardComponent>();

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedComponent'] && this.selectedComponent) {
      this.selectedComponent = { ...this.selectedComponent };
      this.selectedComponent.color = this.selectedComponent.color ?? '#000000';
      this.selectedComponent.opacity = this.selectedComponent.opacity ?? 1;
      this.changeDetectorRef.detectChanges();
    }
  }

  isTextEditable(): boolean {
    if (!this.selectedComponent) return false;
    return ['text', 'button', 'card', 'input', 'email', 'password', 'number', 'date', 'textarea', 'select', 'radio-group', 'checkbox', 'table']
      .includes(this.selectedComponent.type);
  }

  updateCanvasComponent(): void {
    if (!this.selectedComponent?.id || !this.selectedComponent?.type) return;

    const color = this.selectedComponent.color || '#000000';
    const opacity = this.selectedComponent.opacity ?? 1;

    // Determine text color based on background contrast if background exists
    let textColor = color;
    if (this.selectedComponent.backgroundColor) {
      textColor = this.getContrastColor(this.selectedComponent.backgroundColor);
    }

    // Convert text color to RGBA with opacity
    const rgbaColor = this.hexToRgba(textColor, opacity);

    // Create new style string
    const updatedComponent: DashboardComponent = { ...this.selectedComponent };
    updatedComponent.style = `color: ${rgbaColor};${this.selectedComponent.backgroundColor ? ` background-color: ${this.selectedComponent.backgroundColor};` : ''}`;
    updatedComponent.color = textColor;

    this.componentUpdated.emit(updatedComponent);
    this.changeDetectorRef.detectChanges();
  }

  private hexToRgba(hex: string, opacity: number): string {
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${opacity})`;
  }

  private getContrastColor(hex: string): string {
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  }
}