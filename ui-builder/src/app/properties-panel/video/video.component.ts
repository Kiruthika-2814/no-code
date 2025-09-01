import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DashboardComponent {
  type: string;
  id: string;
  src?: string;
  controls?: boolean;
  autoplay?: boolean;
}

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './video.component.html'
})
export class VideoComponent implements OnChanges {
  @Input() selectedComponent: DashboardComponent | null = null;
  @Output() componentUpdated = new EventEmitter<DashboardComponent>();

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedComponent'] && this.selectedComponent) {
      this.selectedComponent = { ...this.selectedComponent };
      this.selectedComponent.src = this.selectedComponent.src ?? '';
      this.selectedComponent.controls = this.selectedComponent.controls ?? false;
      this.selectedComponent.autoplay = this.selectedComponent.autoplay ?? false;
      this.changeDetectorRef.detectChanges();
    }
  }

  updateCanvasComponent(): void {
    if (!this.selectedComponent?.id || !this.selectedComponent?.type) return;
    const updatedComponent: DashboardComponent = { ...this.selectedComponent };
    this.componentUpdated.emit(updatedComponent);
    this.changeDetectorRef.detectChanges();
  }
}