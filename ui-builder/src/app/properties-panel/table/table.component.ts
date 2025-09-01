import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DashboardComponent {
  type: string;
  id: string;
  style?: string;
  headerBgColor?: string;
  oddColumnColor?: string;
  evenColumnColor?: string;
  oddRowColor?: string;
  evenRowColor?: string;
  specificCellColor?: string;
  rowNumber?: number;
  colNumber?: number;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table.component.html'
})
export class TableComponent implements OnChanges {
  @Input() selectedComponent: DashboardComponent | null = null;
  @Output() componentUpdated = new EventEmitter<DashboardComponent>();

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedComponent'] && this.selectedComponent) {
      this.selectedComponent = { ...this.selectedComponent };
      this.selectedComponent.headerBgColor = this.selectedComponent.headerBgColor ?? '#ffffff';
      this.selectedComponent.oddColumnColor = this.selectedComponent.oddColumnColor ?? '#ffffff';
      this.selectedComponent.evenColumnColor = this.selectedComponent.evenColumnColor ?? '#ffffff';
      this.selectedComponent.oddRowColor = this.selectedComponent.oddRowColor ?? '#ffffff';
      this.selectedComponent.evenRowColor = this.selectedComponent.evenRowColor ?? '#ffffff';
      this.selectedComponent.specificCellColor = this.selectedComponent.specificCellColor ?? '#ffffff';
      this.selectedComponent.rowNumber = this.selectedComponent.rowNumber ?? 0;
      this.selectedComponent.colNumber = this.selectedComponent.colNumber ?? 0;
      this.changeDetectorRef.detectChanges();
    }
  }

  updateCanvasComponent(): void {
    if (!this.selectedComponent?.id || !this.selectedComponent?.type) return;
    const updatedComponent: DashboardComponent = { ...this.selectedComponent };
    const styles: string[] = [];
    if (updatedComponent.headerBgColor) styles.push(`--header-bg-color:${updatedComponent.headerBgColor}`);
    if (updatedComponent.oddColumnColor) styles.push(`--odd-column-color:${updatedComponent.oddColumnColor}`);
    if (updatedComponent.evenColumnColor) styles.push(`--even-column-color:${updatedComponent.evenColumnColor}`);
    if (updatedComponent.oddRowColor) styles.push(`--odd-row-color:${updatedComponent.oddRowColor}`);
    if (updatedComponent.evenRowColor) styles.push(`--even-row-color:${updatedComponent.evenRowColor}`);
    if (updatedComponent.specificCellColor && updatedComponent.rowNumber !== undefined && updatedComponent.colNumber !== undefined) {
      styles.push(`--specific-cell-color:${updatedComponent.specificCellColor}`);
      styles.push(`--specific-cell-row:${updatedComponent.rowNumber}`);
      styles.push(`--specific-cell-col:${updatedComponent.colNumber}`);
    }
    updatedComponent.style = styles.join(';');
    this.componentUpdated.emit(updatedComponent);
    this.changeDetectorRef.detectChanges();
  }
}