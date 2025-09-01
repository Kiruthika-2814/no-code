"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AngularGenerator = void 0;
class AngularGenerator {
    generate(page) {
        return {
            html: this.generateHtml(page.components),
            css: this.generateCss(page.components),
            ts: this.generateTypescript(page)
        };
    }
    generateTypescript(page) {
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
    generateHtml(components) {
        return components.map(component => this.generateComponentHtml(component)).join('\n');
    }
    generateComponentHtml(component) {
        switch (component.type) {
            case 'container':
            case 'card':
            case 'grid':
            case 'form-group':
            case 'tabs':
            case 'accordion':
                return `<div class="${component.id}">\n${component.children?.map(child => this.generateComponentHtml(child)).join('\n') || ''}\n</div>`;
            case 'text':
                return `<p class="${component.id}">${this.escapeHtml(component.text || '')}</p>`;
            case 'button':
                return `<button class="${component.id} ${component.class ?? ''}" (click)="${component.action}">${this.escapeHtml(component.text || '')}</button>`;
            case 'input':
                return `<input class="${component.id}" type="${component.inputType || 'text'}" placeholder="${this.escapeHtml(component.placeholder || '')}" [(ngModel)]="${component.id}Model" />`;
            case 'textarea':
                return `<textarea class="${component.id}" placeholder="${this.escapeHtml(component.placeholder || '')}" [(ngModel)]="${component.id}Model"></textarea>`;
            case 'select':
                return `<select class="${component.id}" [(ngModel)]="${component.id}Selected">${component.options?.map(opt => `<option [value]="'${this.escapeHtml(opt)}'">${this.escapeHtml(opt)}</option>`).join('') || ''}</select>`;
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
                return `<label class="${component.id}"><input type="checkbox" [(ngModel)]="${component.id}Checked" /> ${this.escapeHtml(component.text || '')}</label>`;
            case 'radio-group':
                return component.options?.map((opt, i) => `<label class="${component.id}"><input type="radio" name="${component.id}" [(ngModel)]="${component.id}Selected" [value]="'${opt}'" /> ${this.escapeHtml(opt)}</label>`).join('') || '';


            case 'video':
                return `<video class="${component.id}" ${component.controls ? 'controls' : ''} ${component.autoplay ? 'autoplay' : ''}><source src="${component.src}" type="video/mp4" /></video>`;
            case 'iframe':
                return `<iframe class="${component.id}" src="${component.src}" title="${this.escapeHtml(component.title || '')}"> </iframe>`;
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

            case 'section':
                return `<section class="${component.id}">
${component.children?.map(child => this.generateComponentHtml(child)).join('\n') || ''}
</section>`;

            case 'quick-stack':
                return `<div class="${component.id} quick-stack ${component.direction || 'row'}">
${component.children?.map(child => this.generateComponentHtml(child)).join('\n') || ''}
</div>`;

            case 'v-flex':
                return `<div class="${component.id} v-flex">
${component.children?.map(child => this.generateComponentHtml(child)).join('\n') || ''}
</div>`;

            case 'h-flex':
                return `<div class="${component.id} h-flex">
${component.children?.map(child => this.generateComponentHtml(child)).join('\n') || ''}
</div>`;

            case 'page-slot':
                return `<ng-container class="${component.id}">
${component.children?.map(child => this.generateComponentHtml(child)).join('\n') || ''}
</ng-container>`;

            default:
                return `<!-- Unknown component: ${component.type} -->`;
        }
    }
    escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/@/g, '&#64;');
    }
    generateCss(components) {
        const styles = [];
        styles.push(`@import '../../../styles/theme.scss';`);
        const collectStyles = (component) => {
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
    collectMethods(components) {
        const methods = [];
        const collect = (component) => {
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
    collectModels(components) {
        const models = [];
        const collect = (component) => {
            if (['input', 'textarea'].includes(component.type)) {
                models.push(`  ${component.id}Model: string = '';`);
            }
            else if (component.type === 'select' || component.type === 'radio-group') {
                const first = component.options?.[0] ?? '';
                models.push(`  ${component.id}Selected: string = '${first}';`);
            }
            else if (component.type === 'checkbox') {
                models.push(`  ${component.id}Checked: boolean = false;`);
            }
            if (component.children) {
                component.children.forEach(collect);
            }
        };
        components.forEach(collect);
        return models;
    }
    camelToKebab(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
    toPascalCase(str) {
        return str
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    }
<<<<<<< HEAD
}
=======
}
exports.AngularGenerator = AngularGenerator;
//# sourceMappingURL=angular.generator.js.map
>>>>>>> f6fa89423bb7e2a9241edef42f12e3feebd40757
