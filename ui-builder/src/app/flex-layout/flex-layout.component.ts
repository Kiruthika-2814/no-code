import { Component, Input, Output, EventEmitter, TemplateRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-flex-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, DragDropModule],
  templateUrl: './flex-layout.component.html',
  styleUrls: ['./flex-layout.component.scss']
})
export class FlexLayoutComponent {
  @Input() block!: any; // Should align with DashboardComponent
  @Input() renderComponent: TemplateRef<any> | null = null;
  @Input() parent: any = null;
  @Input() connectedLists: string[] = []; // Added for drag-and-drop
  @Output() blockSelected = new EventEmitter<any>();
  @Output() blocksUpdated = new EventEmitter<void>();
  @Output() dropEvent = new EventEmitter<CdkDragDrop<any>>();

  private http = inject(HttpClient);
  private static blocksSubject = new BehaviorSubject<any[]>([]);
  private static selectedBlockSubject = new BehaviorSubject<any | null>(null);
  private static contextMenuSubject = new BehaviorSubject<any | null>(null);

  public static getBlocksSubject() {
    return FlexLayoutComponent.blocksSubject;
  }

  public static getSelectedBlockSubject() {
    return FlexLayoutComponent.selectedBlockSubject;
  }

  blocks$ = FlexLayoutComponent.blocksSubject.asObservable();
  selectedBlock$ = FlexLayoutComponent.selectedBlockSubject.asObservable();
  contextMenu$ = FlexLayoutComponent.contextMenuSubject.asObservable();
  contextActions = [
    'Create component',
    'Convert to Div Block',
    'Convert to Container',
    'Convert to Grid',
    'Convert to Link Block',
    'Convert to H Flex',
    'Convert to Section',
    'Convert to Custom Element',
    'Wrap in',
    'Unwrap',
    'Cut',
    'Copy',
    'Duplicate',
    'Delete'
  ];
  jsonData: any;

  constructor() {
    this.loadJson();
  }

  loadJson(): void {
    this.http.get<any>('http://localhost:3001/sample-page').subscribe({
      next: (data) => {
        this.jsonData = data;
        FlexLayoutComponent.blocksSubject.next(data.blocks || []);
      },
      error: (err) => {
        console.error('Error loading JSON:', err);
      }
    });
  }

  isContainer(): boolean {
    return ['section', 'container', 'quick-stack', 'v-flex', 'h-flex', 'page-slot', 'div-block'].includes(this.block.type);
  }

  getStyle() {
    const style: any = {
      display: this.block.displayType || 'block',
      minHeight: this.isContainer() ? '100px' : undefined,
      minWidth: this.isContainer() ? '100px' : undefined
    };

    if (this.block.displayType === 'flex') {
      style.flexDirection = this.block.flexDirection || (this.block.type === 'v-flex' ? 'column' : 'row');
      style.alignItems = this.block.alignItems || 'start';
      style.gap = this.block.gap || '0.5rem';
    } else if (this.block.displayType === 'grid') {
      style.gridTemplateColumns = `repeat(${this.block.columns || 2}, 1fr)`;
      style.gridTemplateRows = `repeat(${this.block.rows || 2}, 1fr)`;
      style.gap = this.block.gap || '0.5rem';
      style['--columns'] = this.block.columns || 2;
      style['--rows'] = this.block.rows || 2;
    }
    return style;
  }

  select(event: MouseEvent) {
    event.stopPropagation();
    FlexLayoutComponent.selectedBlockSubject.next(this.block);
    this.blockSelected.emit(this.block);
  }

  showMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    FlexLayoutComponent.contextMenuSubject.next({ x: event.pageX, y: event.pageY, block: this.block });
  }

  hideContextMenu() {
    FlexLayoutComponent.contextMenuSubject.next(null);
  }

  handleAction(action: string) {
    const menu = FlexLayoutComponent.contextMenuSubject.value;
    if (!menu) return;
    const block = menu.block;
    const blocks = FlexLayoutComponent.blocksSubject.value;

    if (action.startsWith('Convert to')) {
      const newType = action.replace('Convert to ', '').toLowerCase().replace(' ', '-');
      const updatedBlock = {
        ...block,
        type: newType,
        displayType: newType === 'grid' ? 'grid' :
                     newType === 'h-flex' || newType === 'v-flex' || newType === 'container' ? 'flex' : 'block',
        ...(newType === 'grid' && { rows: 2, columns: 2, gap: '0.5rem' }),
        ...(newType === 'h-flex' && { flexDirection: 'row', alignItems: 'start', gap: '0.5rem' }),
        ...(newType === 'v-flex' && { flexDirection: 'column', alignItems: 'start', gap: '0.5rem' }),
        ...(newType === 'container' && { flexDirection: 'column', alignItems: 'start', gap: '0.5rem' })
      };
      FlexLayoutComponent.blocksSubject.next(blocks.map(b => b.id === block.id ? updatedBlock : b));
      if (FlexLayoutComponent.selectedBlockSubject.value?.id === block.id) {
        FlexLayoutComponent.selectedBlockSubject.next(updatedBlock);
        this.blockSelected.emit(updatedBlock);
      }
    } else if (action === 'Delete') {
      FlexLayoutComponent.blocksSubject.next(blocks.filter(b => b.id !== block.id));
      if (FlexLayoutComponent.selectedBlockSubject.value?.id === block.id) {
        FlexLayoutComponent.selectedBlockSubject.next(null);
        this.blockSelected.emit(null);
      }
    }
    this.blocksUpdated.emit();
    this.hideContextMenu();
  }

  onDrop(event: CdkDragDrop<any>) {
    this.dropEvent.emit(event);
    this.blocksUpdated.emit(); // Ensure AppComponent's canvasComponents refreshes
  }

  trackByIndex(index: number): number {
    return index;
  }
}