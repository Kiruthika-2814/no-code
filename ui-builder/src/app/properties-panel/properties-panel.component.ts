import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FontFamilyComponent } from './font-family/font-family.component';
import { FontSizeComponent } from './font-size/font-size.component';
import { TextStylesComponent } from './text-styles/text-styles.component';
import { AlignmentComponent } from './alignment/alignment.component';
import { ListsComponent } from './lists/lists.component';
import { HeadingParagraphComponent } from './heading-paragraph/heading-paragraph.component';
import { TextCaseComponent } from './text-case/text-case.component';
import { ColorComponent } from './color/color.component';
import { FontWeightComponent } from './font-weight/font-weight.component';
import { PlaceholderComponent } from './placeholder/placeholder.component';
import { ImageComponent } from './image/image.component';
import { ButtonComponent } from './button/button.component';
import { VideoComponent } from './video/video.component';
import { TableComponent } from './table/table.component';
import { ContainerNavComponent } from './container-nav/container-nav.component';
import { FieldSizeComponent } from './fieldsize/fieldsize.component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

interface DashboardComponent {
  type: string;
  id: string;
  style?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  listType?: 'ordered' | 'unordered';
  textStyle?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'sentence';
  color?: string;
  placeholder?: string;
  value?: string;
  width?: string; // e.g., 'small', 'medium', 'big', or '100px' for custom
  height?: string;
  src?: string;
  alt?: string;
  text?: string;
  btnStyle?: string;
  controls?: boolean;
  autoplay?: boolean;
  headerBgColor?: string;
  oddColumnColor?: string;
  evenColumnColor?: string;
  oddRowColor?: string;
  evenRowColor?: string;
  specificCellColor?: string;
  rowNumber?: number;
  colNumber?: number;

  flexDirection?: 'row' | 'column';
  justifyContent?: string;  // accepts "Left", "Right", etc.
  alignItems?: string;      // accepts "Top", "Space Between", etc.



  gap?: string;
  padding?: string;
  background?: string;
  borderRadius?: string;
  shadow?: string;
  overflow?: string;
  displayText?: string;
}

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    FontFamilyComponent,
    FontSizeComponent,
    TextStylesComponent,
    AlignmentComponent,
    ListsComponent,
    HeadingParagraphComponent,
    TextCaseComponent,
    ColorComponent,
    FontWeightComponent,
    PlaceholderComponent,
    ImageComponent,
    ButtonComponent,
    VideoComponent,
    TableComponent,
    ContainerNavComponent,
    FieldSizeComponent
  ],
  templateUrl: './properties-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertiesPanelComponent implements OnChanges {
  @Input() selectedComponent: DashboardComponent | null = null;
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() componentUpdated = new EventEmitter<DashboardComponent>();

  showCancelModal = false;
  fontSizeValue = 14;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'sentence' = 'none';
  fieldSizeValue: string = 'medium'; // Initialize field size
  private updateSubject = new Subject<DashboardComponent>();

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    this.updateSubject.pipe(debounceTime(300)).subscribe(updatedComponent => {
      this.componentUpdated.emit(updatedComponent);
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedComponent'] && this.selectedComponent) {
      this.selectedComponent = { ...this.selectedComponent };
      this.fontSizeValue = this.selectedComponent.fontSize
        ? parseInt(this.selectedComponent.fontSize, 10) || 14
        : 14;
      this.textTransform = this.selectedComponent.textTransform || 'none';
      this.fieldSizeValue = this.selectedComponent.width || 'medium'; // Initialize field size
      this.changeDetectorRef.markForCheck();
    }
  }

  onComponentUpdated(updatedComponent: DashboardComponent) {
    if (!updatedComponent) return;
    this.selectedComponent = { ...updatedComponent };
    this.fontSizeValue = this.selectedComponent.fontSize
      ? parseInt(this.selectedComponent.fontSize, 10) || 14
      : 14;
    this.textTransform = this.selectedComponent.textTransform || 'none';
    this.fieldSizeValue = this.selectedComponent.width || 'medium'; // Update field size
    this.updateSubject.next(this.selectedComponent);
  }

  onFieldSizeUpdated(width: string) {
    if (this.selectedComponent) {
      this.selectedComponent = { ...this.selectedComponent, width };
      this.fieldSizeValue = width;
      this.updateSubject.next(this.selectedComponent);
    }
  }

  onSave() {
    this.save.emit();
    this.showToast('✅ Saved successfully!');
  }

  onCancel() {
    this.showCancelModal = true;
  }

  closeModal() {
    this.showCancelModal = false;
    this.changeDetectorRef.markForCheck();
  }

  discardChanges() {
    this.showCancelModal = false;
    this.selectedComponent = null;
    this.cancel.emit();
    this.showToast('⚠️ Changes discarded');
    this.changeDetectorRef.markForCheck();
  }

  showToast(message: string) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 500);
    }, 2000);
  }

  capitalize(str: string): string {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }
}