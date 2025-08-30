
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
  selector: 'app-heading-paragraph',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './heading-paragraph.component.html',
  styleUrls: ['./heading-paragraph.component.scss']
})
export class HeadingParagraphComponent implements OnChanges {
  @Input() selectedComponent: DashboardComponent | null = null;
  @Output() componentUpdated = new EventEmitter<DashboardComponent>();

  selectedStyle = 'font_9'; // Default to Paragraph 3*

  // Map style values to font sizes
  private styleFontSizes: { [key: string]: number } = {
    font_9: 12, // Paragraph 3*
    font_1: 16, // Paragraph 1
    font_2: 14, // Paragraph 2
    font_3: 32, // Heading 1
    font_4: 28, // Heading 2
    font_5: 24, // Heading 3
    font_6: 20, // Heading 4
    font_7: 18, // Heading 5
    font_8: 16  // Heading 6
  };

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedComponent'] && this.selectedComponent) {
      this.selectedComponent = { ...this.selectedComponent };
      const fontSize = this.selectedComponent.fontSize
        ? parseInt(this.selectedComponent.fontSize, 10)
        : 12;
      this.selectedStyle = Object.keys(this.styleFontSizes).find(
        key => this.styleFontSizes[key] === fontSize
      ) || 'font_9';
      this.changeDetectorRef.detectChanges();
    }
  }

  onStyleChange(newStyle: string) {
    if (this.selectedComponent) {
      this.selectedStyle = newStyle;
      const fontSize = this.styleFontSizes[newStyle];
      this.selectedComponent.fontSize = `${fontSize}px`;
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
    updatedComponent.style = `font-size:${updatedComponent.fontSize || '12px'}`;
    this.componentUpdated.emit(updatedComponent);
    this.changeDetectorRef.detectChanges();
  }
}
