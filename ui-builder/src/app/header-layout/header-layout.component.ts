import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-layout.component.html'
})
export class HeaderLayoutComponent {
  notifications: number = 3;

  onSearch(query: string) {
    console.log('Search query:', query);
  }

  clearNotifications() {
    this.notifications = 0;
  }
}