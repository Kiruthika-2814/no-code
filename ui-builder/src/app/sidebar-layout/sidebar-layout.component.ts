import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar-layout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar-layout.component.html'
  
})
export class SidebarLayoutComponent {
  sidebarCollapsed: boolean = false;
  activeModule: string = 'Home';

  notifications: string[] = [
    'New user registered',
    'Server backup completed',
    'You have 3 pending tasks'
  ];

  searchText: string = '';

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  setModule(module: string) {
    this.activeModule = module;
  }

  clearNotifications() {
    this.notifications = [];
  }

  search() {
    console.log('Searching for:', this.searchText);
  }
}