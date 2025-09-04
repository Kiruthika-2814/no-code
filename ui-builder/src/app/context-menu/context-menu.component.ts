import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from '../models/dashboard-model';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ContextMenuComponent {
  @Input() selectedComponent: DashboardComponent | null = null;
  @Input() components: DashboardComponent[] = [];

  @Output() componentsChange = new EventEmitter<DashboardComponent[]>();
  @Output() updateSelectedComponent = new EventEmitter<DashboardComponent>();

  contextMenuVisible = false;
  contextMenuStyle = { top: '0px', left: '0px' };

  clipboardProperties: any = null;
  clipboardComponent: DashboardComponent | null = null;

  /** Right-click trigger */
  showContextMenu(event: MouseEvent, component: DashboardComponent) {
    event.preventDefault();
    this.selectedComponent = component;
    this.updateSelectedComponent.emit(component); // ensure parent knows selected component

    this.contextMenuStyle = {
      top: `${event.clientY}px`,
      left: `${event.clientX}px`
    };
    this.contextMenuVisible = true;
  }

  /** Close menu on outside click */
  @HostListener('document:click')
  onDocumentClick() {
    this.contextMenuVisible = false;
  }

  /** Actions */
  cutComponent() {
    this.copyComponent();
    this.deleteComponent();
  }

  


  copyComponent() {
  if (!this.selectedComponent) return;
  this.clipboardComponent = { ...this.selectedComponent, id: Date.now().toString() }; // safe
  this.closeContextMenu();
}

closeContextMenu() {
  this.contextMenuVisible = false;
}


  pasteComponent() {
    if (!this.clipboardComponent) return;
    const newComp = JSON.parse(JSON.stringify(this.clipboardComponent));
    newComp.id = Date.now().toString();
    this.components.push(newComp);
    this.componentsChange.emit(this.components); // update parent immediately
  }

  duplicateComponent() {
    if (!this.selectedComponent) return;
    const newComp = JSON.parse(JSON.stringify(this.selectedComponent));
    newComp.id = Date.now().toString();
    this.components.push(newComp);
    this.componentsChange.emit(this.components);
  }

  deleteComponent() {
    if (!this.selectedComponent) return;
    this.components = this.components.filter(c => c.id !== this.selectedComponent!.id);
    this.componentsChange.emit(this.components);
    this.selectedComponent = null;
    this.updateSelectedComponent.emit(null!); // reset selected component in parent
  }

  /** Property copy-paste */
  copyProperties() {
    if (!this.selectedComponent) return;
    this.clipboardProperties = { ...this.selectedComponent.properties };
  }

  pasteProperties() {
    if (!this.selectedComponent || !this.clipboardProperties) return;
    this.selectedComponent.properties = { ...this.selectedComponent.properties, ...this.clipboardProperties };
    this.updateSelectedComponent.emit(this.selectedComponent); // update parent immediately
  }

  /** Keyboard shortcuts */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent) {
    if (!this.selectedComponent) return;

    const isCtrl = event.ctrlKey || event.metaKey;

    switch (true) {
      case isCtrl && event.key.toLowerCase() === 'x':
        event.preventDefault(); this.cutComponent(); break;
      case isCtrl && event.key.toLowerCase() === 'c':
        event.preventDefault(); this.copyComponent(); break;
      case isCtrl && event.key.toLowerCase() === 'v':
        event.preventDefault(); this.pasteComponent(); break;
      case isCtrl && event.key.toLowerCase() === 'd':
        event.preventDefault(); this.duplicateComponent(); break;
      case event.key === 'Delete' || event.key === 'Backspace':
        event.preventDefault(); this.deleteComponent(); break;
    }
  }
}
