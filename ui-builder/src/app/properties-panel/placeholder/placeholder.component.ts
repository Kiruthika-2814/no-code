import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

interface DashboardComponent {
  type: string;
  id: string;
  placeholder?: string;
  value?: string;
  displayText?: string;
}

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './placeholder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaceholderComponent implements OnChanges {
  @Input() selectedComponent: DashboardComponent | null = null;
  @Output() componentUpdated = new EventEmitter<DashboardComponent>();

  placeholderControl = new FormControl('');
  valueControl = new FormControl('');
  private updateSubject = new Subject<DashboardComponent>();

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    this.placeholderControl.valueChanges.pipe(debounceTime(300)).subscribe(value => {
      if (this.selectedComponent) {
        this.selectedComponent.placeholder = value || '';
        this.updateCanvasComponent();
      }
    });
    this.valueControl.valueChanges.pipe(debounceTime(300)).subscribe(value => {
      if (this.selectedComponent) {
        this.selectedComponent.value = value || '';
        this.updateCanvasComponent();
      }
    });
    this.updateSubject.pipe(debounceTime(300)).subscribe(updatedComponent => {
      this.componentUpdated.emit(updatedComponent);
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedComponent'] && this.selectedComponent) {
      this.selectedComponent = { ...this.selectedComponent };
      this.placeholderControl.setValue(this.selectedComponent.placeholder || '', { emitEvent: false });
      this.valueControl.setValue(this.selectedComponent.value || '', { emitEvent: false });
      this.updateCanvasComponent();
      this.changeDetectorRef.markForCheck();
    }
  }

  updateCanvasComponent(): void {
    if (!this.selectedComponent?.id || !this.selectedComponent?.type) return;

    this.selectedComponent.displayText = this.selectedComponent.value?.trim()
      ? this.selectedComponent.value
      : this.selectedComponent.placeholder || '';

    const updatedComponent: DashboardComponent = { ...this.selectedComponent };
    this.updateSubject.next(updatedComponent);
  }
}