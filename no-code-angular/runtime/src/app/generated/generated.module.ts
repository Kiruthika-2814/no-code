import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, FormsModule],
  exports: []
})
export class GeneratedModule {
  private static componentCache = new Map<string, Type<any>>();

  static async getComponents(pageNames: string[]): Promise<Type<any>[]> {
    const components = await Promise.all(
      pageNames.map(selector => this.loadComponent(selector))
    );
    return components.filter((c): c is Type<any> => c !== null);
  }

  private static async loadComponent(selector: string): Promise<Type<any>|null> {
    try {
      const cached = this.componentCache.get(selector);
      if (cached) return cached;

      const component = await import(
        `../${selector}/${selector}.component.js`
      ).then(m => m[this.toPascalCase(selector) + 'Component'] || null);

      if (component) {
        this.componentCache.set(selector, component);
      }
      return component;
    } catch (error) {
      console.warn(`Failed to load component ${selector}:`, error);
      return null;
    }
  }

  private static toPascalCase(str: string): string {
    return str.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}