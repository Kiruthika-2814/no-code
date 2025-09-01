import { AngularGenerator } from '../generators/angular.generator';
import { ComponentDefinition } from '../parsers/json.parser';

describe('AngularGenerator', () => {
  let generator: AngularGenerator;

  beforeEach(() => {
    generator = new AngularGenerator();
  });

  test('should generate HTML for text component', () => {
    const textComponent: ComponentDefinition = {
      type: 'text',
      id: 'test-text',
      text: 'Hello World'
    };

    const result = generator.generate({
      pageName: 'TestPage',
      components: [textComponent]
    });
    expect(result.html).toBe('<p class="test-text">Hello World</p>');
  });

  test('should generate nested container HTML', () => {
    const containerComponent: ComponentDefinition = {
      type: 'container',
      id: 'main-container',
      children: [
        {
          type: 'text',
          id: 'nested-text',
          text: 'Nested content'
        }
      ]
    };

    const result = generator.generate({
      pageName: 'ContainerPage',
      components: [containerComponent]
    });
    expect(result.html).toContain('<div class="main-container">\n  <p class="nested-text">Nested content</p>\n</div>');
  });

  test('should generate CSS from styles', () => {
    const styledComponent: ComponentDefinition = {
      type: 'container',
      id: 'styled-div',
      styles: {
        backgroundColor: 'red',
        fontSize: '16px'
      }
    };

    const result = generator.generate({
      pageName: 'StyledPage',
      components: [styledComponent]
    });
    expect(result.css).toContain('.styled-div {\n  background-color: red;\n  font-size: 16px;\n}');
  });

  test('should generate proper TypeScript class', () => {
    const component: ComponentDefinition = {
      type: 'button',
      id: 'submit-button',
      text: 'Submit',
      action: 'handleSubmit()'
    };

    const result = generator.generate({
      pageName: 'ButtonPage',
      components: [component]
    });
    expect(result.ts).toContain('export class ButtonPageComponent');
    expect(result.ts).toContain('selector: \'app-button-page\'');
    expect(result.ts).toContain('handleSubmit() { console.log(\'submit-button clicked\'); }');
  });

  test('should generate HTML for card component', () => {
    const cardComponent: ComponentDefinition = {
      type: 'card',
      id: 'info-card',
      children: [
        {
          type: 'text',
          id: 'card-title',
          text: 'Card Title'
        }
      ]
    };

    const result = generator.generate({
      pageName: 'CardPage',
      components: [cardComponent]
    });
    expect(result.html).toContain('<div class="info-card">\n  <p class="card-title">Card Title</p>\n</div>');
  });

  test('should generate HTML for grid component', () => {
    const gridComponent: ComponentDefinition = {
      type: 'grid',
      id: 'team-grid',
      columns: 2,
      children: [
        {
          type: 'card',
          id: 'team-member-1',
          children: [
            {
              type: 'text',
              id: 'member-1-name',
              text: 'Team Member 1'
            }
          ]
        }
      ]
    };

    const result = generator.generate({
      pageName: 'GridPage',
      components: [gridComponent]
    });
    expect(result.html).toContain('<div class="team-grid">\n  <div class="team-member-1">\n    <p class="member-1-name">Team Member 1</p>\n  </div>\n</div>');
  });
});