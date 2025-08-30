import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

interface DashboardComponent {
  type: string;
  displayName?: string;
  icon?: string;
  id: string;
  text?: string;
  placeholder?: string;
  options?: string[];
  headers?: string[];
  rows?: any[][];
  children?: DashboardComponent[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() sidebarGroups: any[] = [];   // groups + dividers directly from JSON
  @Input() sidebarConnectedTo: string[] = [];
  @Output() componentAdded = new EventEmitter<DashboardComponent>();

  searchTerm: string = '';
  isCollapsed: boolean = false;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.changeDetectorRef.detectChanges();
  }

  addComponentToCanvas(comp: DashboardComponent) {
    const newComp: DashboardComponent = {
      ...comp,
      id: this.generateUniqueId(),
      text: comp.type === 'text' ? 'Sample Text' : comp.text
    };
    this.componentAdded.emit(newComp);
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Filters sidebarGroups based on search term while preserving dividers
   */
  get filteredSidebarGroups(): any[] {
    if (!this.searchTerm.trim()) return this.sidebarGroups;

    const lower = this.searchTerm.toLowerCase();

    return this.sidebarGroups
      .map(group => {
        if (group.type === 'divider') return group;

        const filteredComponents = group.components.filter((comp: DashboardComponent) =>
          (comp.displayName || comp.type).toLowerCase().includes(lower)
        );

        return filteredComponents.length > 0
          ? { ...group, components: filteredComponents }
          : null;
      })
      .filter(g => g !== null);
  }

  generateUniqueId(): string {
    return 'comp-' + Math.random().toString(36).substr(2, 9);
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}