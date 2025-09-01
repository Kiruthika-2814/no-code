import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DashboardComponent {
  type: string;
  id: string;
  style?: string;
  listType?: 'ordered' | 'unordered';
}

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lists.component.html'
})
export class ListsComponent implements OnChanges {
  @Input() selectedComponent: DashboardComponent | null = null;
  @Output() componentUpdated = new EventEmitter<DashboardComponent>();

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedComponent'] && this.selectedComponent) {
      this.selectedComponent = { ...this.selectedComponent };
      this.selectedComponent.listType = this.selectedComponent.listType || undefined;
      this.changeDetectorRef.detectChanges();
    }
  }

  applyList(listType: 'ul' | 'ol') {
    if (this.selectedComponent) {
      this.selectedComponent.listType = listType === 'ul' ? 'unordered' : 'ordered';
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
    updatedComponent.style = updatedComponent.listType ? `list-style-type:${updatedComponent.listType === 'unordered' ? 'disc' : 'decimal'}` : '';
    this.componentUpdated.emit(updatedComponent);
    this.changeDetectorRef.detectChanges();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.selectedComponent) return;
    if (event.ctrlKey && event.shiftKey) {
      switch (event.key.toLowerCase()) {
        case 'u':
          this.applyList('ul');
          break;
        case 'o':
          this.applyList('ol');
          break;
      }
    }
  }
}