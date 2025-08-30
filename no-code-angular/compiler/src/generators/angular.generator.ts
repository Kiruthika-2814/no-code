import { ComponentDefinition } from '../parsers/json.parser';

export class AngularGenerator {
  generate(page: { pageName: string; components: ComponentDefinition[] }): {
    html: string;
    css: string;
    ts: string;
  } {
    return {
      html: this.generateHtml(page.components),
      css: this.generateCss(page.components),
      ts: this.generateTypescript(page)
    };
  }

  /** ✅ Make ID safe for Angular variables */
  private safeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  private generateTypescript(page: { pageName: string; components: ComponentDefinition[] }): string {
    const componentName = this.toPascalCase(page.pageName);
    const methods = this.collectMethods(page.components);
    const models = this.collectModels(page.components);
    return `
import { Component } from '@angular/core';

@Component({
  selector: 'app-${page.pageName}',
  templateUrl: './${page.pageName}.component.html',
  styleUrls: ['./${page.pageName}.component.scss']
})
export class ${componentName}Component {
${models.join('\n')}

${methods.join('\n')}
}`;
  }

  private generateHtml(components: ComponentDefinition[]): string {
    return components.map(component => this.generateComponentHtml(component)).join('\n');
  }

 private generateComponentHtml(component: ComponentDefinition): string {
  switch (component.type) {
    case 'container':
    case 'card':
    case 'grid':
    case 'form-group':
    case 'tabs':
    case 'accordion':
      return `<div class="${component.id} ${component.class ?? ''}">\n${component.children?.map(child => this.generateComponentHtml(child)).join('\n') || ''}\n</div>`;

    case 'text':
      return `<p class="${component.id}">${this.escapeHtml(component.text || '')}</p>`;

    case 'button':
      return `<button class="${component.id} ${component.class ?? ''}" (click)="${component.action}">${this.escapeHtml(component.text || '')}</button>`;

    case 'input':
      return `<input class="${component.id}" type="${component.inputType || 'text'}" placeholder="${this.escapeHtml(component.placeholder || '')}" [(ngModel)]="${this.safeId(component.id)}Model" />`;

    case 'textarea':
      return `<textarea class="${component.id}" placeholder="${this.escapeHtml(component.placeholder || '')}" [(ngModel)]="${this.safeId(component.id)}Model"></textarea>`;

    case 'select':
      return `<select class="${component.id}" [(ngModel)]="${this.safeId(component.id)}Selected">${component.options?.map(opt => `<option [value]="'${this.escapeHtml(opt)}'">${this.escapeHtml(opt)}</option>`).join('') || ''}</select>`;

    case 'image':
      return `<img class="${component.id}" src="${component.src}" alt="${this.escapeHtml(component.alt || '')}" />`;

    case 'icon':
      return `<i class="${component.iconClass} ${component.id}"></i>`;

    case 'link':
      return `<a class="${component.id}" href="${component.href}" target="_blank">${this.escapeHtml(component.text || '')}</a>`;

    case 'divider':
      return `<hr class="${component.id}" />`;

    case 'progress':
      return `<progress class="${component.id}"></progress>`;

    case 'checkbox':
      return `<label class="${component.id}"><input type="checkbox" [(ngModel)]="${this.safeId(component.id)}Checked" /> ${this.escapeHtml(component.text || '')}</label>`;

    case 'radio-group':
      return component.options?.map((opt, i) => `<label class="${component.id}"><input type="radio" name="${component.id}" [(ngModel)]="${this.safeId(component.id)}Selected" [value]="'${this.escapeHtml(opt)}'" /> ${this.escapeHtml(opt)}</label>`).join('') || '';

    case 'video':
      return `<video class="${component.id}" ${component.controls ? 'controls' : ''} ${component.autoplay ? 'autoplay' : ''}><source src="${component.src}" type="video/mp4" /></video>`;

    case 'iframe':
      return `<iframe class="${component.id}" src="${component.src}" title="${this.escapeHtml(component.title || '')}"></iframe>`;

    case 'nav':
      return `<nav class="${component.id}">\n${component.children?.map(child => this.generateComponentHtml(child)).join('\n') || ''}\n</nav>`;

    case 'list':
      if (component.listType === 'ordered') {
        return `<ol class="${component.id}">` +
          (component.items?.map(item => `<li>${this.escapeHtml(item)}</li>`).join('') || '') +
          `</ol>`;
      }
      return `<ul class="${component.id}">` +
        (component.items?.map(item => `<li>${this.escapeHtml(item)}</li>`).join('') || '') +
        `</ul>`;
   

    case 'table':
      return `
<table class="${component.id}">
  <thead>
    <tr>${component.headers?.map(header => `<th>${this.escapeHtml(header)}</th>`).join('') || ''}</tr>
  </thead>
  <tbody>
    ${component.rows?.map(row => `<tr>${row.map(cell => `<td>${this.escapeHtml(cell)}</td>`).join('')}</tr>`).join('\n') || ''}
  </tbody>
</table>`;

    default:
      return `<!-- Unknown component: ${component.type} -->`;

  case 'container':
        return `<div class="${component.id} ${component.class ?? ''}">${component.children?.map(child => this.generateComponentHtml(child)).join('\n') || ''}</div>`; 

  }
}


  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/@/g, '&#64;');
  }

  private generateCss(components: ComponentDefinition[]): string {
    const styles: string[] = [];
    styles.push(`@import '../../../styles/theme.scss';`);

    const collectStyles = (component: ComponentDefinition) => {
      if (component.styles) {
        styles.push(`.${component.id} {
  ${Object.entries(component.styles)
    .map(([prop, value]) => `${this.camelToKebab(prop)}: ${value};`)
    .join('\n  ')}
}`);
      }
      if (component.children) {
        component.children.forEach(collectStyles);
      }
    };

    components.forEach(collectStyles);
    return styles.join('\n\n');
  }

  private collectMethods(components: ComponentDefinition[]): string[] {
    const methods: string[] = [];
    const collect = (component: ComponentDefinition) => {
      if (component.action) {
        const methodName = component.action.replace(/\(\)$/, '');
        methods.push(`  ${methodName}() { console.log('${component.id} clicked'); }`);
      }
      if (component.children) {
        component.children.forEach(collect);
      }
    };
    components.forEach(collect);
    return methods;
  }

  private collectModels(components: ComponentDefinition[]): string[] {
    const models: string[] = [];
    const collect = (component: ComponentDefinition) => {
      if (['input', 'textarea'].includes(component.type)) {
        models.push(`  ${this.safeId(component.id)}Model: string = '';`);
      } else if (component.type === 'select' || component.type === 'radio-group') {
        const first = component.options?.[0] ?? '';
        models.push(`  ${this.safeId(component.id)}Selected: string = '${first}';`);
      } else if (component.type === 'checkbox') {
        models.push(`  ${this.safeId(component.id)}Checked: boolean = false;`);
      }
      if (component.children) {
        component.children.forEach(collect);
      }
    };
    components.forEach(collect);
    return models;
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  private toPascalCase(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}
