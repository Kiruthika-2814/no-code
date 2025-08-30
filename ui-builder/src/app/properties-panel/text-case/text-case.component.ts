import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DashboardComponent {
  type: string;
  id: string;
  style?: string;
  text?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'sentence';
}

@Component({
  selector: 'app-text-case',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './text-case.component.html'
})
export class TextCaseComponent implements OnChanges {
  @Input() selectedComponent: DashboardComponent | null = null;
  @Output() componentUpdated = new EventEmitter<DashboardComponent>();

  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'sentence' = 'none';

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedComponent'] && this.selectedComponent) {
      this.selectedComponent = { ...this.selectedComponent };
      this.textTransform = this.selectedComponent.textTransform || 'none';
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
    const updatedComponent: DashboardComponent = { ...this.selectedComponent };
    if (this.isTextEditable() && updatedComponent.text && this.textTransform === 'sentence') {
      updatedComponent.text = this.toSentenceCase(updatedComponent.text);
      updatedComponent.textTransform = 'none';
    } else {
      updatedComponent.textTransform = this.textTransform;
    }
    updatedComponent.style = `text-transform:${updatedComponent.textTransform || 'none'}`;
    this.componentUpdated.emit(updatedComponent);
    this.changeDetectorRef.detectChanges();
  }

  toSentenceCase(str: string): string {
    return str ? str.toLowerCase().replace(/(^\s*|[.?!]\s*)\w/g, c => c.toUpperCase()) : '';
  }
}