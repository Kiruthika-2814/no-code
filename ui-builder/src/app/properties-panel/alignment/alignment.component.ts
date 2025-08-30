import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DashboardComponent {
  type: string;
  id: string;
  style?: string;
  textAlign?: string;
}

@Component({
  selector: 'app-alignment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alignment.component.html'
})
export class AlignmentComponent implements OnChanges {
  @Input() selectedComponent: DashboardComponent | null = null;
  @Output() componentUpdated = new EventEmitter<DashboardComponent>();

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedComponent'] && this.selectedComponent) {
      this.selectedComponent = { ...this.selectedComponent };
      this.selectedComponent.textAlign = this.selectedComponent.textAlign || 'left';
      this.changeDetectorRef.detectChanges();
    }
  }

  setAlign(align: string) {
    if (this.selectedComponent) {
      this.selectedComponent.textAlign = align;
      this.updateCanvasComponent();
    }
  }

  isTextEditable(): boolean {
    if (!this.selectedComponent) return false;
    return ['text', 'button', 'card', 'input', 'email', 'password', 'number', 'date', 'textarea', 'select', 'radio-group', 'checkbox', 'table']
      .includes(this.selectedComponent.type);
  }

  updateCanvasComponent(): void {
    if (!this.selectedComponent?.id || !this.selectedComponent?.type) return;
    const updatedComponent: DashboardComponent = { ...this.selectedComponent };
    updatedComponent.style = `text-align:${updatedComponent.textAlign || 'left'}`;
    this.componentUpdated.emit(updatedComponent);
    this.changeDetectorRef.detectChanges();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.selectedComponent) return;
    if (event.ctrlKey && event.shiftKey) {
      switch (event.key.toLowerCase()) {
        case 'l':
          this.setAlign('left');
          break;
        case 'e':
          this.setAlign('center');
          break;
        case 'r':
          this.setAlign('right');
          break;
        case 'j':
          this.setAlign('justify');
          break;
      }
    }
  }
}