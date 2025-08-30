import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

interface Page {
  name: string;
  components: { type: string; value?: string; label?: string }[];
}

@Component({
  selector: 'app-page-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, DragDropModule],
  templateUrl: './page-manager.component.html',
  styleUrls: ['./page-manager.component.scss']
})
export class PageManagerComponent {
  pages: Page[] = [];
  selectedPage: Page | null = null;
  apiUrl = 'http://localhost:3000/ui'; // Backend API endpoint

  // For undo/redo
  history: Page[][] = [];
  future: Page[][] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPages();
    this.setupKeyboardShortcuts();
  }

  // -------- PAGE ACTIONS --------
  addPage() {
    const newPage: Page = { name: `Untitled-${this.pages.length + 1}`, components: [] };
    this.pages.push(newPage);
    this.selectedPage = newPage;
    this.saveState();
    this.savePages();
  }

  renamePage(page: Page, newName: string) {
    page.name = newName;
    this.saveState();
    this.savePages();
  }

  deletePage(page: Page) {
    this.pages = this.pages.filter(p => p !== page);
    this.selectedPage = this.pages.length ? this.pages[0] : null;
    this.saveState();
    this.savePages();
  }

  duplicatePage(page: Page) {
    const copy = JSON.parse(JSON.stringify(page));
    copy.name = page.name + ' Copy';
    this.pages.push(copy);
    this.saveState();
    this.savePages();
  }

  addComponent(type: string) {
    if (this.selectedPage) {
      this.selectedPage.components.push({ type, value: `${type} content` });
      this.saveState();
      this.savePages();
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    if (this.selectedPage) {
      moveItemInArray(this.selectedPage.components, event.previousIndex, event.currentIndex);
      this.saveState();
      this.savePages();
    }
  }

  // -------- SAVE / LOAD --------
  savePages() {
    this.http.post(this.apiUrl, this.pages).subscribe(() => console.log('Saved to ui.json'));
  }

  loadPages() {
    this.http.get<Page[]>(this.apiUrl).subscribe(data => {
      this.pages = data || [];
      this.selectedPage = this.pages.length ? this.pages[0] : null;
      this.saveState(true); // save initial state, no reset
    });
  }

  // -------- HISTORY MANAGEMENT (UNDO/REDO) --------
  private saveState(initial = false) {
    if (!initial) {
      this.history.push(JSON.parse(JSON.stringify(this.pages)));
      this.future = []; // clear redo stack when new action happens
    }
  }

  undo() {
    if (this.history.length > 0) {
      this.future.push(JSON.parse(JSON.stringify(this.pages)));
      this.pages = this.history.pop() || [];
      this.selectedPage = this.pages.length ? this.pages[0] : null;
      this.savePages();
    }
  }

  redo() {
    if (this.future.length > 0) {
      this.history.push(JSON.parse(JSON.stringify(this.pages)));
      this.pages = this.future.pop() || [];
      this.selectedPage = this.pages.length ? this.pages[0] : null;
      this.savePages();
    }
  }

  // -------- KEYBOARD SHORTCUTS --------
  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 'n') { event.preventDefault(); this.addPage(); }     // Ctrl+N → New Page
      if (event.ctrlKey && event.key === 's') { event.preventDefault(); this.savePages(); }   // Ctrl+S → Save
      if (event.ctrlKey && event.key === 'd' && this.selectedPage) { event.preventDefault(); this.duplicatePage(this.selectedPage); } // Ctrl+D → Duplicate
      if (event.key === 'Delete' && this.selectedPage) { event.preventDefault(); this.deletePage(this.selectedPage); } // Delete → Delete Page
      if (event.ctrlKey && event.key.toLowerCase() === 'z') { event.preventDefault(); this.undo(); } // Ctrl+Z → Undo
      if (event.ctrlKey && event.key.toLowerCase() === 'y') { event.preventDefault(); this.redo(); } // Ctrl+Y → Redo
      if (event.ctrlKey && event.key.toLowerCase() === 'r' && this.selectedPage) { // Ctrl+R → Rename
        event.preventDefault();
        const newName = prompt('Enter new page name:', this.selectedPage.name);
        if (newName) this.renamePage(this.selectedPage, newName);
      }
      if (event.ctrlKey && event.key === 'ArrowRight') { // Ctrl+→ → Next Page
        event.preventDefault();
        this.selectNextPage();
      }
      if (event.ctrlKey && event.key === 'ArrowLeft') { // Ctrl+← → Previous Page
        event.preventDefault();
        this.selectPrevPage();
      }
    });
  }

  private selectNextPage() {
    if (this.selectedPage && this.pages.length > 1) {
      const index = this.pages.indexOf(this.selectedPage);
      const nextIndex = (index + 1) % this.pages.length;
      this.selectedPage = this.pages[nextIndex];
    }
  }

  private selectPrevPage() {
    if (this.selectedPage && this.pages.length > 1) {
      const index = this.pages.indexOf(this.selectedPage);
      const prevIndex = (index - 1 + this.pages.length) % this.pages.length;
      this.selectedPage = this.pages[prevIndex];
    }
  }

  renamePagePrompt(page: Page) {
  const newName = window.prompt('Rename page:', page.name);
  if (newName && newName.trim()) {
    this.renamePage(page, newName.trim());
  }
}

} 