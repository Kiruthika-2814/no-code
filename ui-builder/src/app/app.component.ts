import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { debounceTime } from 'rxjs/operators';
import { HeaderLayoutComponent } from './header-layout/header-layout.component';
import { PropertiesPanelComponent } from './properties-panel/properties-panel.component';
import { SafeHtmlPipe } from '../safe-html.pipe';
import { SidebarComponent } from './sidebar/sidebar.component';


interface DashboardComponent {
  type: string;
  displayName?: string;
  style?: string;
  text?: string;
  placeholder?: string;
  value?: string;
  options?: string[];
  newOption?: string[];
  headers?: string[];
  rows?: any[][];
  invert?: boolean;
  src?: string;
  alt?: string;
  href?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  bgColor?: string;
  width?: string;
  height?: string;
  btnStyle?: string;
  iconClass?: string;
  controls?: boolean;
  autoplay?: boolean;
  items?: any[];
  active?: boolean;
  link?: string;
  icon?: string;
  label?: string;
  id: string;
  children?: DashboardComponent[];
  progress?: number;
  barColor?: string;
  alertType?: string;
  title?: string;
  content?: string;
  borderRadius?: string;
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
  class?: string;
  oddColumnColor?: string;
  evenColumnColor?: string;
  oddRowColor?: string;
  evenRowColor?: string;
  headerBgColor?: string;
  specificCellColor?: string;
  rowNumber?: number;
  colNumber?: number;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch';
  gap?: string;
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  highlightedRows?: { [rowIndex: number]: string };
  highlightedCols?: { [colIndex: number]: string };
  highlightedCells?: { [key: string]: string };
  headerColors?: string[];
  cellColors?: string[];
  checked?: boolean;
  radioStyle?: string;
  listType?: 'ordered' | 'unordered';
  action?: string;
  minWidth?: string;
  minHeight?: string;
  fontFamily?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  textStyle?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'sentence';
}

interface CanvasConfig {
  flexDirection: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DragDropModule,
    HeaderLayoutComponent,
    PropertiesPanelComponent,
    SafeHtmlPipe,
    SidebarComponent
    
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  jsonData: any = null;
  paletteComponents: DashboardComponent[] = [];
  canvasComponents: DashboardComponent[] = [];
  sidebarGroups: any[] = [];
  selectedComponent: DashboardComponent | null = null;
  canvasConfig: CanvasConfig = { flexDirection: 'row', justifyContent: 'flex-start' };
  searchTerm: string = '';
  isCollapsed: boolean = false;
  highlightRowIndex: number = 0;
  highlightRowColor: string = '#ffffcc';
  highlightColIndex: number = 0;
  highlightColColor: string = '#ccffcc';
  highlightCellKey: string = '0-0';
  highlightCellColor: string = '#ffccee';
  cellControls: FormControl[][] = [];
  checkboxValue: any[] = [];
  flexDirections: CanvasConfig['flexDirection'][] = ['row', 'column', 'row-reverse', 'column-reverse'];
  justifyContents: CanvasConfig['justifyContent'][] = ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'];
  fontWeights: (string | number)[] = ['normal', 'bold', 'bolder', 'lighter', 100, 200, 300, 400, 500, 600, 700, 800, 900];
  sidebarConnectedTo: string[] = ['canvasList'];
  canvasConnectedTo: string[] = ['sidebarList'];

  constructor(public http: HttpClient, public changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadJson();
    this.initializeDefaultContainer();
    this.updateConnectedLists();
    console.log('Canvas Components on Init:', JSON.stringify(this.canvasComponents, null, 2));
  }

  ngAfterViewInit() {
    this.changeDetectorRef.markForCheck();
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.changeDetectorRef.detectChanges();
  }

  deselectComponent() {
    this.selectedComponent = null;
    this.updateConnectedLists();
    this.changeDetectorRef.detectChanges();
    console.log('Deselected Component');
  }

  loadJson(): void {
    this.http.get<any>('http://localhost:3001/sample-page').subscribe({
      next: (data) => {
        this.jsonData = data;
        if (this.jsonData?.[0]?.sidebarGroups?.length) {
          this.sidebarGroups = this.jsonData[0].sidebarGroups;
        } else {
          this.sidebarGroups = [];
        }
        this.updateConnectedLists();
        console.log('Sidebar Groups:', this.sidebarGroups);
      },
      error: (err) => {
        console.error('Error loading JSON:', err);
      }
    });
  }

  onTextChange(comp: DashboardComponent, newText: string) {
    comp.text = newText;
    this.onComponentUpdated(comp);
  }

  getDefaultIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      text: 'bi bi-fonts',
      input: 'bi bi-input-cursor-text',
      table: 'bi bi-table',
      checkbox: 'bi bi-check-square',
      radio: 'bi bi-circle',
      button: 'bi bi-hand-index',
      image: 'bi bi-image',
      container: 'bi bi-box',
      nav: 'bi bi-nav',
      dropdown: 'bi bi-caret-down',
      default: 'bi bi-box'
    };
    return iconMap[type] || iconMap['default'];
  }

  capitalize(str: string): string {
    return str ? `${str.charAt(0).toUpperCase()}${str.slice(1)}` : '';
  }

  prepareComponent(comp: any): DashboardComponent {
    const type = comp.type || 'text';
    const prepared: DashboardComponent = {
      ...comp,
      type: type,
      id: comp.id || this.generateUniqueId(),
      displayName: comp.displayName || this.capitalize(type),
      placeholder: comp.placeholder || `Enter ${type} placeholder`,
      style: comp.style || '', // Ensure style is always a string
      options: comp.options || (['select', 'radio-group', 'checkbox'].includes(type) ? [] : undefined),
      headers: comp.headers || (type === 'table' ? ['Header 1', 'Header 2'] : undefined),
      rows: comp.rows || (type === 'table' ? [['Data 1', 'Data 2']] : undefined),
      invert: type === 'table' ? comp.invert || false : undefined,
      class: comp.class || (['container', 'nav'].includes(type) ? 'canvas-container' : 'component-wrapper'),
      oddColumnColor: comp.oddColumnColor || '#f0f0f0',
      evenColumnColor: comp.evenColumnColor || '#ffffff',
      oddRowColor: comp.oddRowColor || '#e6f3ff',
      evenRowColor: comp.evenRowColor || '#ffffff',
      headerBgColor: comp.headerBgColor || '#ffffff',
      specificCellColor: comp.specificCellColor || '#ffffcc',
      rowNumber: comp.rowNumber || 0,
      colNumber: comp.colNumber || 0,
      flexDirection: ['container', 'nav'].includes(type) ? (comp.flexDirection || 'column') : undefined,
      flexWrap: ['container', 'nav'].includes(type) ? (comp.flexWrap || 'wrap') : undefined,
      justifyContent: ['container', 'nav'].includes(type) ? (comp.justifyContent || 'flex-start') : undefined,
      alignItems: ['container', 'nav'].includes(type) ? (comp.alignItems || 'stretch') : undefined,
      alignContent: ['container', 'nav'].includes(type) ? (comp.alignContent || 'stretch') : undefined,
      gap: ['container', 'nav'].includes(type) ? (comp.gap || '12px') : undefined,
      icon: comp.icon || this.getDefaultIcon(type),
      checked: type === 'checkbox' ? (comp.checked ?? false) : undefined,
      radioStyle: type === 'radio-group' ? (comp.radioStyle || 'form-check-input') : undefined,
      listType: type === 'list' ? (comp.listType || 'unordered') : undefined,
      items: type === 'list' ? (comp.items || ['Item 1', 'Item 2']) : undefined,
      action: comp.action || undefined,
      width: ['container', 'nav'].includes(type) ? (comp.width || '100%') : (comp.width || 'auto'),
      minWidth: ['container', 'nav'].includes(type) ? (comp.minWidth || '300px') : undefined,
      minHeight: ['container', 'nav'].includes(type) ? (comp.minHeight || '150px') : undefined,
      fontFamily: comp.fontFamily || 'Arial',
      fontSize: comp.fontSize || '14px',
      fontWeight: comp.fontWeight || 'normal',
      fontStyle: comp.fontStyle || 'normal',
      textDecoration: comp.textDecoration || 'none',
      textAlign: comp.textAlign || 'left',
      textStyle: comp.textStyle || 'p',
      textTransform: comp.textTransform || 'none'
    };

    if (type === 'table') {
      prepared.headers = prepared.headers?.length ? prepared.headers : ['Header 1', 'Header 2'];
      prepared.rows = prepared.rows?.length ? prepared.rows : [['Data 1', 'Data 2']];
      prepared.class = prepared.class || 'table table-bordered';
      prepared.headerColors = prepared.headers.map(() => '#ffffff');
      prepared.cellColors = prepared.rows.flatMap((row: any[]) => row.map(() => '#ffffff'));
    }

    if (['container', 'nav'].includes(type)) {
      prepared.children = (comp.children || []).map((child: any) => this.prepareComponent(child));
    }

    return prepared;
  }

  generateUniqueId(): string {
    return 'comp-' + Math.random().toString(36).substr(2, 9);
  }

  getAllContainerIds(excludeId?: string): string[] {
    const ids: string[] = [];
    const collect = (list: DashboardComponent[]) => {
      (list || []).forEach(c => {
<<<<<<< Updated upstream
        if (c && ['container', 'nav'].includes(c.type) && c.id && (!excludeId || c.id !== excludeId)) {
=======

        if (c && ['container', 'nav'].includes(c.type) && c.id) {

        if (c && ['container', 'nav'].includes(c.type) && c.id && (!excludeId || c.id !== excludeId)) {

>>>>>>> Stashed changes
          ids.push(c.id);
        }
        if (c.children?.length) collect(c.children);
      });
    };
    collect(this.canvasComponents);
    return ids;
  }

  getConnectedLists(excludeId?: string): string[] {
    return ['sidebarList', 'canvasList', ...this.getAllContainerIds(excludeId)];
  }

  updateConnectedLists(): void {
    this.sidebarConnectedTo = ['canvasList', ...this.getAllContainerIds()];
    this.canvasConnectedTo = ['sidebarList', ...this.getAllContainerIds()];
    console.log('Updated connected lists:', {
      sidebarConnectedTo: this.sidebarConnectedTo,
      canvasConnectedTo: this.canvasConnectedTo
    });
    this.changeDetectorRef.detectChanges();
  }

  addNewContainer(): void {
    const newContainer = this.prepareComponent({
      type: 'container',
      displayName: 'New Container',
      children: [],
      bgColor: '#f8f9fa',
      icon: this.getDefaultIcon('container')
    });

    let targetArray = this.canvasComponents;
    let parentComponent: DashboardComponent | null = null;
    if (this.selectedComponent && ['container', 'nav'].includes(this.selectedComponent.type)) {
      if (!this.selectedComponent.children) this.selectedComponent.children = [];
      targetArray = this.selectedComponent.children;
      parentComponent = this.selectedComponent;
      console.log('Adding new container to selected parent:', this.selectedComponent.id, this.selectedComponent.type);
    } else {
      const defaultContainer = this.canvasComponents[0];
      if (defaultContainer && defaultContainer.children) {
        targetArray = defaultContainer.children;
        parentComponent = defaultContainer;
        console.log('Using default container as parent:', defaultContainer.id);
      } else {
        console.warn('No valid parent container found, using root canvasComponents');
      }
    }
    targetArray.push(newContainer);
    this.canvasComponents = [...this.canvasComponents]; // Ensure immutability
    if (parentComponent) {
      this.onComponentUpdated(parentComponent);
    }
    // Always select the new container
    this.selectComponent(newContainer);
    this.updateConnectedLists();
    this.changeDetectorRef.detectChanges();
    this.changeDetectorRef.markForCheck();
    console.log('New Container Added and Selected:', newContainer.id, newContainer.type, 'Parent:', parentComponent?.id || 'none');
    console.log('Canvas Components:', JSON.stringify(this.canvasComponents, null, 2));
  }

  initializeDefaultContainer() {
    const defaultContainer = this.prepareComponent({
      type: 'container',
      displayName: 'Default Container',
      children: [],
      bgColor: '#f8f9fa',
      icon: this.getDefaultIcon('container')
    });
    this.canvasComponents = [defaultContainer];
    // Always select the default container
    this.selectComponent(defaultContainer);
    this.updateConnectedLists();
    this.changeDetectorRef.detectChanges();
    this.changeDetectorRef.markForCheck();
    console.log('Default Container Initialized and Selected:', defaultContainer.id);
    console.log('Canvas Components:', JSON.stringify(this.canvasComponents, null, 2));
  }

  drop(event: CdkDragDrop<DashboardComponent[], DashboardComponent[]>, targetContainer?: DashboardComponent) {
    if (!event.previousContainer || !event.container) {
      console.error('Drop event invalid: missing container', event);
      return;
    }
    if (!event.previousContainer.data || !event.container.data) {
      console.error('Drop event invalid: missing data', event);
      return;
    }

    const draggedComponent = event.previousContainer.data[event.previousIndex];

    let resolvedTarget: DashboardComponent | null = null;
    if (targetContainer) {
      resolvedTarget = targetContainer;
      console.log('Drop target (direct):', targetContainer.id, targetContainer.type);
    } else if (event.container.id !== 'canvasList') {
      resolvedTarget = this.findComponentById(event.container.id, this.canvasComponents);
      console.log('Drop target (resolved):', resolvedTarget?.id, resolvedTarget?.type);
    } else {
      console.log('Drop target: Main canvas');
    }

    let newCompOrMoved: DashboardComponent | null = null;

    if (event.previousContainer.id === 'sidebarList') {
      if (!draggedComponent || !draggedComponent.type) {
        console.error('Invalid sidebar component:', draggedComponent);
        return;
      }
      const newComp = this.prepareComponent(draggedComponent);

      if (resolvedTarget && ['container', 'nav'].includes(resolvedTarget.type)) {
        if (!resolvedTarget.children) resolvedTarget.children = [];
        resolvedTarget.children.push(newComp); // Append to end
        this.onComponentUpdated(resolvedTarget);
        console.log('Added new component into container:', resolvedTarget.id, newComp.id, newComp.type);
      } else {
        this.canvasComponents.push(newComp); // Append to end
        this.canvasComponents = [...this.canvasComponents]; // Ensure immutability
        console.log('Added new component into main canvas:', newComp.id, newComp.type);
      }
      newCompOrMoved = newComp;
    } else if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      newCompOrMoved = event.container.data[event.currentIndex];
      console.log('Reordered component:', newCompOrMoved.id, newCompOrMoved.type);
    } else {
      // Restrict transfers: only allow to canvas or from sidebar
      if (event.container.id !== 'canvasList' && event.previousContainer.id !== 'sidebarList') {
        console.log('Restricted move: not allowing transfer from ' + event.previousContainer.id + ' to ' + event.container.id);
        return;
      }
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      newCompOrMoved = event.container.data[event.currentIndex];
      console.log('Moved component:', newCompOrMoved.id, newCompOrMoved.type);
    }

    // Ensure immutability for canvasComponents
    this.canvasComponents = [...this.canvasComponents];

    // Only select the target container if it's a container/nav, or the new component if it's a container/nav
    if (newCompOrMoved && ['container', 'nav'].includes(newCompOrMoved.type)) {
      this.selectComponent(newCompOrMoved);
      console.log('Selected new container:', newCompOrMoved.id, newCompOrMoved.type);
    } else if (resolvedTarget && ['container', 'nav'].includes(resolvedTarget.type)) {
      this.selectComponent(resolvedTarget);
      console.log('Selected target container:', resolvedTarget.id, resolvedTarget.type);
    } else {
      console.log('No container selected, keeping current selection:', this.selectedComponent?.id, this.selectedComponent?.type);
    }

    this.updateConnectedLists();
    this.changeDetectorRef.detectChanges();
    this.changeDetectorRef.markForCheck();
    console.log('Dropped, selected:', this.selectedComponent?.id, this.selectedComponent?.type);
    console.log('Canvas Components:', JSON.stringify(this.canvasComponents, null, 2));
  }

  findComponentById(id: string, list: DashboardComponent[]): DashboardComponent | null {
    for (const comp of list) {
      if (comp.id === id) return comp;
      if (comp.children?.length) {
        const found = this.findComponentById(id, comp.children);
        if (found) return found;
      }
    }
    return null;
  }

  selectComponent(comp: DashboardComponent) {
    if (this.selectedComponent?.id !== comp.id) {
      this.selectedComponent = comp; // Use reference to maintain reactivity
      this.initializeCellControls();
      console.log('Selected Component:', this.selectedComponent.id, this.selectedComponent.type);
      this.changeDetectorRef.detectChanges();
      this.changeDetectorRef.markForCheck();
    }
  }

  addComponentToCanvas(comp: any) {
    const newComp = this.prepareComponent(comp);
    let targetArray = this.canvasComponents;
    let parentComponent: DashboardComponent | null = null;

    if (this.selectedComponent && ['container', 'nav'].includes(this.selectedComponent.type)) {
      if (!this.selectedComponent.children) this.selectedComponent.children = [];
      targetArray = this.selectedComponent.children;
      parentComponent = this.selectedComponent;
      console.log('Adding to selected container:', this.selectedComponent.id, this.selectedComponent.type);
    } else {
      const defaultContainer = this.canvasComponents[0];
      if (defaultContainer && defaultContainer.children) {
        targetArray = defaultContainer.children;
        parentComponent = defaultContainer;
        console.log('Falling back to default container:', defaultContainer.id);
      } else {
        console.warn('No valid parent container found, using root canvasComponents');
      }
    }

    targetArray.push(newComp);
    this.canvasComponents = [...this.canvasComponents]; // Ensure immutability
    if (parentComponent) {
      this.onComponentUpdated(parentComponent);
    }
    // Only select the new component if it's a container or nav
    if (['container', 'nav'].includes(newComp.type)) {
      this.selectComponent(newComp);
      console.log('Selected new container:', newComp.id, newComp.type);
    } else {
      console.log('Non-container component added, keeping current selection:', this.selectedComponent?.id, this.selectedComponent?.type);
    }
    this.updateConnectedLists();
    this.changeDetectorRef.detectChanges();
    this.changeDetectorRef.markForCheck();
    console.log('After adding component, selected:', this.selectedComponent?.id, this.selectedComponent?.type);
    console.log('Canvas Components:', JSON.stringify(this.canvasComponents, null, 2));
  }

  onComponentUpdated(updatedComponent: DashboardComponent) {
    const updateComponent = (components: DashboardComponent[]): DashboardComponent[] => {
      return components.map(comp => {
        if (comp.id === updatedComponent.id) {
          return { ...updatedComponent, children: comp.children ? [...comp.children] : comp.children };
        }
        if (comp.children) {
          return { ...comp, children: updateComponent(comp.children) };
        }
        return comp;
      });
    };

    this.canvasComponents = updateComponent(this.canvasComponents);
    if (this.selectedComponent?.id === updatedComponent.id) {
      this.selectedComponent = this.findComponentById(updatedComponent.id, this.canvasComponents);
    }
    this.initializeCellControls();
    console.log('Component updated, selected:', this.selectedComponent?.id, this.selectedComponent?.type);
    this.changeDetectorRef.detectChanges();
    this.changeDetectorRef.markForCheck();
  }

  getContrastColor(color: string): string {
    if (!color) return '#000000';
    const c = color.charAt(0) === '#' ? color.substring(1, 7) : color;
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 125 ? '#000000' : '#ffffff';
  }

  getComponentStyle(comp: DashboardComponent): { [key: string]: string | null } {
    const isContainerOrNav = comp.type === 'container' || comp.type === 'nav';
    const styleObj: { [key: string]: string } = {};
    if (typeof comp.style === 'string' && comp.style.trim()) {
      comp.style.split(';').forEach(s => {
        const [key, value] = s.split(':').map(part => part.trim());
        if (key && value) {
          styleObj[key] = value;
        }
      });
    }

    const baseStyle: { [key: string]: string | null } = {
      color: comp.color || this.getContrastColor(comp.bgColor || '#ffffff'),
      'background-color': comp.bgColor || (isContainerOrNav ? '#f8f9fa' : null),
      width: isContainerOrNav ? comp.width || '100%' : comp.width || 'auto',
      'min-width': isContainerOrNav ? comp.minWidth || '300px' : comp.minWidth || 'auto',
      'min-height': isContainerOrNav ? comp.minHeight || '150px' : comp.minHeight || 'auto',
      height: comp.height || 'auto',
      'border-radius': comp.borderRadius || null,
      'object-fit': comp.objectFit || null,
      'font-size': comp.fontSize || styleObj['font-size'] || null,
      'font-weight': comp.fontWeight || styleObj['font-weight'] || null,
      'font-family': comp.fontFamily || styleObj['font-family'] || null,
      'font-style': comp.fontStyle || styleObj['font-style'] || null,
      'text-decoration': comp.textDecoration || styleObj['text-decoration'] || null,
      'text-align': comp.textAlign || styleObj['text-align'] || null,
      'text-transform': comp.textTransform || styleObj['text-transform'] || null,
      display: isContainerOrNav ? 'flex' : styleObj['display'] || 'block',
      'flex-direction': isContainerOrNav ? comp.flexDirection || 'column' : styleObj['flex-direction'] || null,
      'flex-wrap': isContainerOrNav ? comp.flexWrap || 'wrap' : styleObj['flex-wrap'] || null,
      'justify-content': isContainerOrNav ? comp.justifyContent || 'flex-start' : styleObj['justify-content'] || null,
      'align-items': isContainerOrNav ? comp.alignItems || 'stretch' : styleObj['align-items'] || null,
      'align-content': isContainerOrNav ? comp.alignContent || 'stretch' : styleObj['align-content'] || null,
      gap: isContainerOrNav ? comp.gap || '12px' : styleObj['gap'] || null,
      flex: comp.type !== 'container' && comp.type !== 'nav' ? '0 0 auto' : null,
      'max-width': isContainerOrNav ? 'none' : null,
      'box-sizing': 'border-box',
      padding: isContainerOrNav ? '12px' : styleObj['padding'] || null,
      '--odd-column-color': comp.oddColumnColor || '#f0f0f0',
      '--even-column-color': comp.evenColumnColor || '#ffffff',
      '--odd-row-color': comp.oddRowColor || '#e6f3ff',
      '--even-row-color': comp.evenRowColor || '#ffffff',
      '--header-bg-color': comp.headerBgColor || '#ffffff',
      '--specific-cell-color': comp.specificCellColor || '#ffffcc'
    };

    if (comp.type === 'table' && comp.invert) {
      baseStyle['filter'] = 'invert(1)';
    }
    if (comp.type === 'input' || comp.type === 'email' || comp.type === 'password' || comp.type === 'number') {
      baseStyle['border'] = '1px solid #ced4da';
      baseStyle['padding'] = '0.375rem 0.75rem';
      baseStyle['border-radius'] = '0.25rem';
      baseStyle['text-align'] = comp.textAlign || styleObj['text-align'] || 'left';
    }
    if (comp.type === 'text') {
      baseStyle['display'] = 'block';
    }

    return { ...baseStyle, ...styleObj };
  }

  getChildStyle(child: DashboardComponent, parent?: DashboardComponent): { [key: string]: string | null } {
    const styleObj: { [key: string]: string } = {};
    if (typeof child.style === 'string' && child.style.trim()) {
      child.style.split(';').forEach(s => {
        const [key, value] = s.split(':').map(part => part.trim());
        if (key && value) {
          styleObj[key] = value;
        }
      });
    }

    const base = this.getComponentStyle(child);
    if (!parent) {
      base['flex'] = child.type === 'container' || child.type === 'nav' ? '1 1 100%' : '0 0 auto';
      base['min-width'] = child.minWidth || (child.type === 'container' || child.type === 'nav' ? '300px' : 'auto');
      base['min-height'] = child.minHeight || (child.type === 'container' || child.type === 'nav' ? '150px' : 'auto');
      base['height'] = child.height || 'auto';
    } else if (parent.flexDirection === 'column') {
      base['flex'] = '0 1 100%';
      base['width'] = child.width || '100%';
      base['min-width'] = child.minWidth || (child.type === 'container' || child.type === 'nav' ? '300px' : 'auto');
      base['min-height'] = child.minHeight || (child.type === 'container' || child.type === 'nav' ? '150px' : 'auto');
      base['height'] = child.height || 'auto';
      base['align-self'] = child.alignSelf || 'stretch';
    } else if (parent.type === 'container' || parent.type === 'nav') {
      base['flex'] = child.type === 'container' || child.type === 'nav' ? '1 1 100%' : '0 0 auto';
      base['min-width'] = child.minWidth || (child.type === 'container' || child.type === 'nav' ? '300px' : 'auto');
      base['min-height'] = child.minHeight || (child.type === 'container' || child.type === 'nav' ? '150px' : 'auto');
      base['width'] = child.width || (child.type === 'container' || child.type === 'nav' ? '100%' : 'auto');
      base['height'] = child.height || 'auto';
      base['align-self'] = child.alignSelf || 'auto';
    }

    return { ...base, ...styleObj };
  }

  initializeCellControls() {
    if (this.selectedComponent?.type !== 'table' || !this.selectedComponent.rows) return;
    this.cellControls = this.selectedComponent.rows.map(row =>
      row.map((cell, ci) => {
        const control = new FormControl(cell);
        control.valueChanges.pipe(debounceTime(300)).subscribe(value => {
          this.updateCellValue(row, cell, value);
        });
        return control;
      })
    );
  }

  updateCellValue(row: any[], cell: any, value: string) {
    if (!this.selectedComponent?.rows) return;
    const rowIndex = this.selectedComponent.rows.indexOf(row);
    const cellIndex = row.indexOf(cell);
    if (rowIndex === -1 || cellIndex === -1) return;
    const newRows = [...this.selectedComponent.rows];
    newRows[rowIndex][cellIndex] = value;
    this.selectedComponent.rows = newRows;
    this.onComponentUpdated(this.selectedComponent);
    this.changeDetectorRef.detectChanges();
    this.changeDetectorRef.markForCheck();
  }

  getHeaderCellColor(ci: number, child: any): string {
    return child.headerBgColor || '#ffffff';
  }

  blendColors(c1: string, c2: string): string {
    if (!c1) return c2;
    if (!c2) return c1;

    const hexToRgb = (hex: string) => {
      hex = hex.replace('#', '');
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
      };
    };

    const rgbToHex = (r: number, g: number, b: number) =>
      '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

    const rgb1 = hexToRgb(c1);
    const rgb2 = hexToRgb(c2);

    return rgbToHex(
      Math.round((rgb1.r + rgb2.r) / 2),
      Math.round((rgb1.g + rgb2.g) / 2),
      Math.round((rgb1.b + rgb2.b) / 2)
    );
  }

  getCellBackgroundColor(ri: number, ci: number, child: any): string {
    if (ri === child.rowNumber && ci === child.colNumber && child.specificCellColor) {
      return child.specificCellColor;
    }
    const rowColor = ri % 2 === 0 ? child.oddRowColor : child.evenRowColor;
    const colColor = ci % 2 === 0 ? child.oddColumnColor : child.evenColumnColor;
    return this.blendColors(rowColor, colColor);
  }

  getTextColor(bgColor: string): string {
    if (!bgColor) return '#000';
    const c = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 125 ? '#000' : '#fff';
  }

  deleteSelected() {
    if (!this.selectedComponent) return;

    const compName = this.selectedComponent.displayName || 'this component';
    if (confirm(`Are you sure you want to delete "${compName}"?`)) {
      const deleteFromComponents = (components: DashboardComponent[]): DashboardComponent[] => {
        return components.filter(comp => {
          if (comp.id === this.selectedComponent!.id) return false;
          if (comp.children) {
            comp.children = deleteFromComponents(comp.children);
          }
          return true;
        });
      };
      this.canvasComponents = deleteFromComponents(this.canvasComponents);
      this.selectedComponent = null;
      this.updateConnectedLists();
      this.changeDetectorRef.detectChanges();
      this.changeDetectorRef.markForCheck();
      console.log('Canvas Components after delete:', JSON.stringify(this.canvasComponents, null, 2));
    }
  }

  saveJson() {
    if (this.jsonData?.[0]?.components?.[0]) {
      this.jsonData[0].components[0].children = this.canvasComponents;
    }
    this.http.post('http://localhost:3001/save-ui', this.jsonData).subscribe({
      next: () => alert('UI saved successfully to ui.json'),
      error: (err) => console.error('Error saving JSON:', err)
    });
  }

  onSave() {
    this.saveJson();
  }

  get filteredPaletteComponents(): DashboardComponent[] {
    if (!this.searchTerm.trim()) return this.paletteComponents;
    return this.paletteComponents.filter(comp =>
      (comp.displayName || comp.type).toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get selectedOptions(): string[] {
    return this.selectedComponent?.options || [];
  }

  trackById(index: number, comp: DashboardComponent): string {
    return comp.id;
  }

  onComponentAdded(comp: any): void {
    console.log('Component added from sidebar:', comp.type, comp);
    this.addComponentToCanvas(comp);
    console.log('Selected after adding from sidebar:', this.selectedComponent?.id, this.selectedComponent?.type);
  }
}