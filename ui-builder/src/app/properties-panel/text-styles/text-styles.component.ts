import { Component, Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DashboardComponent {
  type: string;
  id: string;
  style?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
}

@Component({
  selector: 'app-text-styles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './text-styles.component.html',
  styleUrls: ['./text-styles.component.scss']
})
export class TextStylesComponent {

  // ✅ Fix: Allow parent to pass `selectedComponent`
 @Input() selectedComponent: any;   // 👈 this enables binding

  @Output() componentUpdated = new EventEmitter<any>(); // 👈 output event

  isTextEditable() {
    return true; // replace with your logic
  }

  toggleBold() {
    this.selectedComponent.fontWeight =
      this.selectedComponent.fontWeight === 'bold' ? 'normal' : 'bold';
    this.componentUpdated.emit(this.selectedComponent);  // 🔥 notify parent
  }

  toggleItalic() {
    this.selectedComponent.fontStyle =
      this.selectedComponent.fontStyle === 'italic' ? 'normal' : 'italic';
    this.componentUpdated.emit(this.selectedComponent);
  }

  toggleUnderline() {
    this.selectedComponent.textDecoration =
      this.selectedComponent.textDecoration === 'underline' ? 'none' : 'underline';
    this.componentUpdated.emit(this.selectedComponent);
  }
}

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements OnInit {
  @Input('appTooltip') tooltipText: string = '';
  @Input() shortcut?: string;
  tooltip: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    if (this.shortcut) {
      this.tooltipText = `${this.tooltipText} (${this.shortcut})`;
    }
  }

  @HostListener('mouseenter') onMouseEnter() {
    if (!this.tooltip) {
      this.tooltip = this.renderer.createElement('span');
   if (this.tooltip) {
  this.tooltip.innerText = this.tooltipText;
}

      this.renderer.addClass(this.tooltip, 'custom-tooltip');
      this.renderer.appendChild(document.body, this.tooltip);

      const rect = this.el.nativeElement.getBoundingClientRect();
      this.renderer.setStyle(this.tooltip, 'top', `${rect.top - 35}px`);
      this.renderer.setStyle(this.tooltip, 'left', `${rect.left + rect.width / 2}px`);
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.tooltip) {
      this.renderer.removeChild(document.body, this.tooltip);
      this.tooltip = null;
    }
  }

  // --- Keyboard shortcuts ---
  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      if (range.collapsed) return;

      let wrapper: HTMLElement;

      switch (event.key.toLowerCase()) {
        case 'b':
          event.preventDefault();
          wrapper = document.createElement('strong');
          range.surroundContents(wrapper);
          break;

        case 'i':
          event.preventDefault();
          wrapper = document.createElement('em');
          range.surroundContents(wrapper);
          break;

        case 'u':
          event.preventDefault();
          wrapper = document.createElement('u');
          range.surroundContents(wrapper);
          break;
      }
    }
  }
}
