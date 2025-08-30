import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(items: string[], searchTerm: string): string[] {
    if (!items || !searchTerm) return items;
    return items.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
  }
}