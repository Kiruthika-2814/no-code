import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DashboardComponent {
  type: string;
  id: string;
  text?: string;
  btnStyle?: string;
  class?: string;
}

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './button.component.html'
})
export class ButtonComponent implements OnChanges {
  @Input() selectedComponent: DashboardComponent | null = null;
  @Output() componentUpdated = new EventEmitter<DashboardComponent>();

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedComponent'] && this.selectedComponent) {
      this.selectedComponent = { ...this.selectedComponent };
      this.selectedComponent.text = this.selectedComponent.text ?? '';
      this.selectedComponent.btnStyle = this.selectedComponent.btnStyle ?? '';
      this.changeDetectorRef.detectChanges();
    }
  }

  updateCanvasComponent(): void {
    if (!this.selectedComponent?.id || !this.selectedComponent?.type) return;
    const updatedComponent: DashboardComponent = { ...this.selectedComponent };
    updatedComponent.class = updatedComponent.btnStyle || '';
    this.componentUpdated.emit(updatedComponent);
    this.changeDetectorRef.detectChanges();
  }
}