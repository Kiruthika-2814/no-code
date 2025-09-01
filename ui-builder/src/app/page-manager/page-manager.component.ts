import { Component, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface ComponentItem {
  id: string;
  type: string;
  value?: string;
  text?: string;
  children?: ComponentItem[];
}

interface Page {
  id: string;
  name: string;
  components: ComponentItem[];
  showSettings?: boolean;
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
  selectedComponent: ComponentItem | null = null;

  showModal: boolean = false;
  newPageName: string = '';
  isSettingsMode: boolean = false; // true = Page Settings modal

  // Tooltip & breadcrumb highlight
  showTooltip: boolean = false;
  highlightedPage: Page | null = null;

  apiUrl: string = 'http://localhost:3000/ui';
  kebabSvg: SafeHtml;

  // Modal positioning
  modalPosition = { top: '60px', left: '150px' };

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    this.kebabSvg = this.sanitizer.bypassSecurityTrustHtml(
      '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">' +
      '<path fill-rule="evenodd" d="M9,11 L9,13 L7,13 L7,11 L9,11 Z M13,11 L13,13 L11,13 L11,11 L13,11 Z M17,11 L17,13 L15,13 L15,11 L17,11 Z"></path></svg>'
    );
  }

  ngOnInit() {
    this.loadPages();
  }

  // ---------------- PAGE ACTIONS ----------------

  openNewPageModal() {
    this.isSettingsMode = false;
    this.newPageName = '';
    this.showModal = true;

    // Position modal near Add Page button
    setTimeout(() => {
      const btn = document.querySelector<HTMLButtonElement>('button.btn-secondary');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        this.modalPosition = { top: rect.bottom + 'px', left: rect.left + 'px' };
      }
    }, 0);

    this.cdr.detectChanges();
  }

 createPageOnEnter(event: Event) {
  const keyboardEvent = event as KeyboardEvent; // cast here
  keyboardEvent.preventDefault(); // optional, stops form submission
  this.createPage();
}


  createPage() {
    if (!this.newPageName.trim()) return;

    const newPage: Page = {
      id: this.generateUUID(),
      name: this.newPageName.trim(),
      components: [], // No default container; canvas is always present
      showSettings: false
    };

    this.pages.push(newPage);
    this.selectedPage = newPage;
    this.showModal = false;
    this.savePages();
    this.cdr.detectChanges();

    this.showTooltipForUser();
  }

  selectPage(page: Page) {
    this.selectedPage = page;
    this.selectedComponent = null;
    this.cdr.detectChanges();
  }

  openPageSettingsModal(page: Page) {
    this.selectedPage = page;
    this.isSettingsMode = true;
    this.showModal = true;

    // Highlight breadcrumb briefly
    this.highlightedPage = page;
    setTimeout(() => (this.highlightedPage = null), 1000);
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showModal = false;
  }

  showTooltipForUser() {
    this.showTooltip = true;
    setTimeout(() => (this.showTooltip = false), 3000);
  }

  // ---------------- COMPONENT / CANVAS ACTIONS ----------------

  addNewContainer() {
    if (!this.selectedPage) return;

    const newContainer: ComponentItem = {
      id: this.generateUUID(),
      type: 'container',
      children: []
    };

    this.selectedPage.components.push(newContainer);
    this.savePages();
    this.cdr.detectChanges();
  }

  addComponent(type: string) {
    if (!this.selectedPage) return;

    const newComp: ComponentItem = {
      id: this.generateUUID(),
      type,
      value: `${type} content`
    };

    this.selectedPage.components.push(newComp);
    this.savePages();
    this.cdr.detectChanges();
  }

  selectComponent(comp: ComponentItem) {
    this.selectedComponent = comp;
    this.cdr.detectChanges();
  }

  drop(event: CdkDragDrop<ComponentItem[]>) {
    if (!this.selectedPage) return;

    const components = [...this.selectedPage.components];
    moveItemInArray(components, event.previousIndex, event.currentIndex);
    this.selectedPage.components = components;
    this.savePages();
    this.cdr.detectChanges();
  }

  getConnectedLists(): string[] {
    return this.pages.map(p => p.id);
  }

  // ---------------- PAGE SETTINGS ----------------

  renamePage(page: Page | null) {
    if (!page) return;
    const newName = prompt('Enter new page name', page.name);
    if (newName) page.name = newName;
    this.savePages();
    this.closeModal();
  }

  duplicatePage(page: Page | null) {
    if (!page) return;
    const copy: Page = {
      ...JSON.parse(JSON.stringify(page)),
      id: this.generateUUID(),
      name: page.name + ' Copy'
    };
    this.pages.push(copy);
    this.savePages();
    this.closeModal();
  }

  deletePage(page: Page | null) {
    if (!page) return;
    this.pages = this.pages.filter(p => p !== page);
    this.selectedPage = this.pages.length ? this.pages[0] : null;
    this.savePages();
    this.closeModal();
  }

  // ---------------- SAVE / LOAD ----------------

  savePages() {
    this.http.post(this.apiUrl, this.pages).subscribe({
      next: () => console.log('Saved to UI backend'),
      error: err => console.error('Failed to save pages:', err)
    });
  }

  loadPages() {
    this.http.get<Page[]>(this.apiUrl).subscribe({
      next: data => {
        this.pages = data || [];
        this.selectedPage = this.pages.length ? this.pages[0] : null;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Failed to load pages:', err);
        this.pages = [];
        this.selectedPage = null;
        this.cdr.detectChanges();
      }
    });
  }

  // ---------------- UTILITIES ----------------

  generateUUID(): string {
    return 'xxxx-xxxx-xxxx'.replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16));
  }

  // ---------------- KEYBOARD SHORTCUTS ----------------

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent) {
    if (event.ctrlKey && event.key.toLowerCase() === 'n') {
      event.preventDefault();
      this.openNewPageModal();
    }
    if (event.key === 'Delete' && this.selectedPage) {
      event.preventDefault();
      this.pages = this.pages.filter(p => p !== this.selectedPage);
      this.selectedPage = this.pages.length ? this.pages[0] : null;
      this.savePages();
      this.cdr.detectChanges();
    }
  }
}
