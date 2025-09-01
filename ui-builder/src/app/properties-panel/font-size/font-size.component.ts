
import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DashboardComponent {
  type: string;
  id: string;
  style?: string;
  fontSize?: string;
}

@Component({
  selector: 'app-font-size',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './font-size.component.html'
})
export class FontSizeComponent implements OnChanges {
  @Input() selectedComponent: DashboardComponent | null = null;
  @Output() componentUpdated = new EventEmitter<DashboardComponent>();

  fontSizeValue = 14;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedComponent'] && this.selectedComponent) {
      this.selectedComponent = { ...this.selectedComponent };
      this.fontSizeValue = parseInt(this.selectedComponent.fontSize || '14', 10) || 14;
      this.selectedComponent.fontSize = this.selectedComponent.fontSize || '14px';
      this.changeDetectorRef.detectChanges();
    }
  }

  onFontSizeChange(newValue: number) {
    if (this.selectedComponent) {
      this.fontSizeValue = newValue;
      this.selectedComponent.fontSize = `${newValue}px`;
      this.updateCanvasComponent();
    }
  }

  resetFontSize() {
    if (this.selectedComponent) {
      this.fontSizeValue = 14;
      this.selectedComponent.fontSize = '14px';
      this.updateCanvasComponent();
    }
  }

  stopDrag(event: MouseEvent | TouchEvent) {
    event.stopPropagation();
  }

  isTextEditable(): boolean {
    if (!this.selectedComponent) return false;
    return ['text', 'button', 'card', 'input', 'email', 'password', 'number', 'date', 'textarea', 'select', 'radio-group', 'checkbox', 'table']
      .includes(this.selectedComponent.type);
  }

  updateCanvasComponent(): void {
    if (!this.selectedComponent?.id || !this.selectedComponent?.type) return;
    const updatedComponent: DashboardComponent = { ...this.selectedComponent };
    updatedComponent.style = `font-size:${updatedComponent.fontSize || '14px'}`;
    this.componentUpdated.emit(updatedComponent);
    this.changeDetectorRef.detectChanges();
  }
}
