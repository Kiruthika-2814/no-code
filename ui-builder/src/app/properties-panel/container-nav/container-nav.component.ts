
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DashboardComponent {
  type: string;
  id: string;
  style?: string;
  display?: 'flex' | 'grid';
  flexDirection?: 'row' | 'column';
  justifyContent?: string;
  alignItems?: string;
  gapValue?: number;
  gapUnit?: string;
  gap?: string;
  background?: string;
  gridColumns?: number;
  gridRows?: number;
  gridAutoFlow?: 'row' | 'column' | 'dense';
  justifyItems?: string;
  gridTemplateAreas?: string;
}

@Component({
  selector: 'app-container-nav',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './container-nav.component.html'
})
export class ContainerNavComponent implements OnChanges {
  @Input() selectedComponent: DashboardComponent | null = null;
  @Output() componentUpdated = new EventEmitter<DashboardComponent>();

  flexDirections: string[] = ['row', 'column'];
  justifyOptions: string[] = ['Left', 'Center', 'Right', 'Space Between', 'Space Around'];
  alignOptions: string[] = ['Top', 'Center', 'Bottom', 'Stretch'];
  gapUnits: string[] = ['px', 'em', 'rem', 'vw', 'vh', '%'];
  gridAlignOptions: string[] = ['start', 'center', 'end', 'stretch'];

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedComponent'] && this.selectedComponent) {
      this.selectedComponent = { ...this.selectedComponent };

      // Flex defaults
      if (!this.selectedComponent.display) this.selectedComponent.display = 'flex';
      if (!this.selectedComponent.flexDirection) this.selectedComponent.flexDirection = 'row';
      if (!this.selectedComponent.justifyContent) this.selectedComponent.justifyContent = 'Left';
      if (!this.selectedComponent.alignItems) this.selectedComponent.alignItems = 'Top';
      if (this.selectedComponent.gapValue === undefined) this.selectedComponent.gapValue = 16;
      if (!this.selectedComponent.gapUnit) this.selectedComponent.gapUnit = 'px';
      if (!this.selectedComponent.background) this.selectedComponent.background = '#ffffff';

      // Grid defaults
      if (!this.selectedComponent.gridColumns) this.selectedComponent.gridColumns = 3;
      if (!this.selectedComponent.gridRows) this.selectedComponent.gridRows = 2;
      if (!this.selectedComponent.gridAutoFlow) this.selectedComponent.gridAutoFlow = 'row';
      if (!this.selectedComponent.justifyItems) this.selectedComponent.justifyItems = 'stretch';
      if (!this.selectedComponent.gridTemplateAreas) this.selectedComponent.gridTemplateAreas = '';

      this.updateGap();
      this.updateCanvasComponent();
      this.changeDetectorRef.detectChanges();
    }
  }

  // ----------------- GAP HANDLING -----------------
  private updateGap(): void {
    if (this.selectedComponent) {
      const { gapValue, gapUnit } = this.selectedComponent;
      this.selectedComponent.gap = gapValue !== undefined ? `${gapValue}${gapUnit}` : '';
    }
  }

  onGapChange(): void {
    if (this.selectedComponent) {
      this.updateGap();
      this.updateCanvasComponent();
    }
  }

  resetGap(): void {
    if (this.selectedComponent) {
      this.selectedComponent.gapValue = 16;
      this.selectedComponent.gapUnit = 'px';
      this.updateGap();
      this.updateCanvasComponent();
    }
  }

  stopDrag(event: Event) {
    event.stopPropagation();
  }

  // ----------------- FLEX ALIGNMENT -----------------
  private mapJustify(value: string): string {
    switch (value) {
      case 'Left': return 'flex-start';
      case 'Right': return 'flex-end';
      case 'Center': return 'center';
      case 'Space Between': return 'space-between';
      case 'Space Around': return 'space-around';
      default: return 'flex-start';
    }
  }

  private mapAlign(value: string): string {
    switch (value) {
      case 'Top': return 'flex-start';
      case 'Bottom': return 'flex-end';
      case 'Center': return 'center';
      case 'Stretch': return 'stretch';
      default: return 'stretch';
    }
  }

  private buildFlexAlignment(updatedComponent: DashboardComponent, styles: string[]) {
    if (!updatedComponent.flexDirection) return;
    const isRow = updatedComponent.flexDirection === 'row';

    // Align X → horizontal
    if (updatedComponent.justifyContent) {
      const mapped = this.mapJustify(updatedComponent.justifyContent);
      if (isRow) styles.push(`justify-content:${mapped}`);
      else styles.push(`align-items:${mapped}`);
    }

    // Align Y → vertical
    if (updatedComponent.alignItems) {
      const mapped = this.mapAlign(updatedComponent.alignItems);
      if (isRow) styles.push(`align-items:${mapped}`);
      else styles.push(`justify-content:${mapped}`);
    }
  }

  // ----------------- GRID ALIGNMENT -----------------
  private buildGridAlignment(updatedComponent: DashboardComponent, styles: string[]) {
    if (updatedComponent.justifyItems) {
      styles.push(`justify-items:${updatedComponent.justifyItems}`);
    }
    if (updatedComponent.alignItems) {
      styles.push(`align-items:${updatedComponent.alignItems}`);
    }
  }

  // ----------------- GRID TEMPLATE -----------------
  private buildGridTemplate(updatedComponent: DashboardComponent, styles: string[]) {
    if (updatedComponent.gridColumns) {
      styles.push(`grid-template-columns: repeat(${updatedComponent.gridColumns}, 1fr)`);
    }
    if (updatedComponent.gridRows) {
      styles.push(`grid-template-rows: repeat(${updatedComponent.gridRows}, 1fr)`);
    }
    if (updatedComponent.gridAutoFlow) {
      styles.push(`grid-auto-flow: ${updatedComponent.gridAutoFlow}`);
    }
    if (updatedComponent.gridTemplateAreas) {
      // Format grid-template-areas for CSS
      const areas = updatedComponent.gridTemplateAreas
        .trim()
        .split('\n')
        .map(row => `'${row.trim()}'`)
        .join(' ');
      if (areas) {
        styles.push(`grid-template-areas: ${areas}`);
      }
    }
  }

  // ----------------- MAIN UPDATE -----------------
  updateCanvasComponent(): void {
    if (!this.selectedComponent?.id || !this.selectedComponent?.type) return;

    this.updateGap();
    const updatedComponent: DashboardComponent = { ...this.selectedComponent };
    const styles: string[] = [];

    if (updatedComponent.display) styles.push(`display:${updatedComponent.display}`);
    
    if (updatedComponent.display === 'flex') {
      if (updatedComponent.flexDirection) styles.push(`flex-direction:${updatedComponent.flexDirection}`);
      if (updatedComponent.gap) styles.push(`gap:${updatedComponent.gap}`);
      this.buildFlexAlignment(updatedComponent, styles);
    } else if (updatedComponent.display === 'grid') {
      if (updatedComponent.gap) styles.push(`gap:${updatedComponent.gap}`);
      this.buildGridAlignment(updatedComponent, styles);
      this.buildGridTemplate(updatedComponent, styles);
    }

    if (updatedComponent.background) styles.push(`background:${updatedComponent.background}`);
    updatedComponent.style = styles.join(';');

    this.componentUpdated.emit(updatedComponent);
    this.changeDetectorRef.detectChanges();
  }

  // ----------------- ALIGN HANDLERS -----------------
  onAlignXChange(value: string) {
    if (!this.selectedComponent) return;

    if (this.selectedComponent.flexDirection === 'row') {
      this.selectedComponent.justifyContent = value;
    } else {
      this.selectedComponent.alignItems = value;
    }

    this.updateCanvasComponent();
  }

  onAlignYChange(value: string) {
    if (!this.selectedComponent) return;

    if (this.selectedComponent.flexDirection === 'row') {
      this.selectedComponent.alignItems = value;
    } else {
      this.selectedComponent.justifyContent = value;
    }

    this.updateCanvasComponent();
  }

  onGridAlignXChange(): void {
    if (!this.selectedComponent) return;
    this.updateCanvasComponent();
  }

  onGridAlignYChange(): void {
    if (!this.selectedComponent) return;
    this.updateCanvasComponent();
  }
}


