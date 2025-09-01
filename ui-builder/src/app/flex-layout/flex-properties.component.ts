import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutComponent } from './flex-layout.component';

@Component({
  selector: 'app-flex-properties',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flex-properties.component.html'
})
export class FlexPropertiesComponent {
  selectedBlock$ = FlexLayoutComponent.getSelectedBlockSubject().asObservable();

  updateBlock(block: any, key: string, value: any) {
    const updatedBlock = { ...block, [key]: value };
    FlexLayoutComponent.getBlocksSubject().next(
      FlexLayoutComponent.getBlocksSubject().value.map(b => b.id === block.id ? updatedBlock : b)
    );
    FlexLayoutComponent.getSelectedBlockSubject().next(updatedBlock);
  }

  updateDisplayType(block: any) {
    const updatedBlock = { ...block };
    if (block.displayType === 'grid') {
      updatedBlock.rows = 2;
      updatedBlock.columns = 2;
      updatedBlock.gap = '0.5rem';
    } else if (block.displayType === 'flex') {
      updatedBlock.flexDirection = block.type === 'v-flex' ? 'column' : 'row';
      updatedBlock.alignItems = 'start';
      updatedBlock.gap = '0.5rem';
    }
    FlexLayoutComponent.getBlocksSubject().next(
      FlexLayoutComponent.getBlocksSubject().value.map(b => b.id === block.id ? updatedBlock : b)
    );
    FlexLayoutComponent.getSelectedBlockSubject().next(updatedBlock);
  }

  trackByIndex(index: number): number {
    return index;
  }
}