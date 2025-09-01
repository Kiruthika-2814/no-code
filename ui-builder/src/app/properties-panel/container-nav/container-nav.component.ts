import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DashboardComponent {
  type: string;
  id: string;
  style?: string;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  gap?: string;
  padding?: string;
  background?: string;
  borderRadius?: string;
  shadow?: string;
  overflow?: string;
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

  flexDirections: string[] = ['row', 'column', 'row-reverse', 'column-reverse'];
  justifyContents: string[] = ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'];
  alignItems: string[] = ['flex-start', 'flex-end', 'center', 'baseline', 'stretch'];

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedComponent'] && this.selectedComponent) {
      this.selectedComponent = { ...this.selectedComponent };
      this.selectedComponent.flexDirection = this.selectedComponent.flexDirection ?? 'column';
      this.selectedComponent.justifyContent = this.selectedComponent.justifyContent ?? 'flex-start';
      this.selectedComponent.alignItems = this.selectedComponent.alignItems ?? 'stretch';
      this.selectedComponent.gap = this.selectedComponent.gap ?? '12';
      this.selectedComponent.padding = this.selectedComponent.padding ?? '';
      this.selectedComponent.background = this.selectedComponent.background ?? '#ffffff';
      this.selectedComponent.borderRadius = this.selectedComponent.borderRadius ?? '';
      this.selectedComponent.shadow = this.selectedComponent.shadow ?? 'none';
      this.selectedComponent.overflow = this.selectedComponent.overflow ?? 'visible';
      this.changeDetectorRef.detectChanges();
    }
  }

  updateCanvasComponent(): void {
    if (!this.selectedComponent?.id || !this.selectedComponent?.type) return;
    const updatedComponent: DashboardComponent = { ...this.selectedComponent };
    const styles: string[] = ['display:flex'];
    if (updatedComponent.flexDirection) styles.push(`flex-direction:${updatedComponent.flexDirection}`);
    if (updatedComponent.justifyContent) styles.push(`justify-content:${updatedComponent.justifyContent}`);
    if (updatedComponent.alignItems) styles.push(`align-items:${updatedComponent.alignItems}`);
    if (updatedComponent.gap) styles.push(`gap:${updatedComponent.gap}px`);
    if (updatedComponent.padding) styles.push(`padding:${updatedComponent.padding}`);
    if (updatedComponent.background) styles.push(`background:${updatedComponent.background}`);
    if (updatedComponent.borderRadius) styles.push(`border-radius:${updatedComponent.borderRadius}`);
    if (updatedComponent.shadow && updatedComponent.shadow !== 'none') {
      const shadows: { [key: string]: string } = {
        sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        md: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
        lg: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
      };
      styles.push(`box-shadow:${shadows[updatedComponent.shadow] || 'none'}`);
    }
    if (updatedComponent.overflow) styles.push(`overflow:${updatedComponent.overflow}`);
    updatedComponent.style = styles.join(';');
    this.componentUpdated.emit(updatedComponent);
    this.changeDetectorRef.detectChanges();
  }
}