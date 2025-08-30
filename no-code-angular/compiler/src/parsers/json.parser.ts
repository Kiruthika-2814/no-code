const { readFileSync } = require('node:fs');
const Ajv = require('ajv');
const componentSchema = require('../../../schemas/component.schema.json');

export interface ComponentDefinition {
  type: string;
  id: string;

  // CSS class support
  class?: string;

  // Common optional props
  text?: string;
  placeholder?: string;
  src?: string;
  alt?: string;
  columns?: number;
  styles?: Record<string, string>;
  action?: string;

  // For table
  headers?: string[];
  rows?: string[][];

  // For select and radio-group
  options?: string[];

  // For icon
  iconClass?: string;

  // For link
  href?: string;

  // For video
  controls?: boolean;
  autoplay?: boolean;

  // For input type
  inputType?: string;

  // Nested components
  children?: ComponentDefinition[];

  // For iframe
  title?: string;

   // For list
  items?: string[];
  listType?: 'unordered' | 'ordered';
}

export interface PageDefinition {
  pageName: string;
  components: ComponentDefinition[];
}

export class JsonParser {
  parse(filePath: string): PageDefinition[] {
    const rawData = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData) as PageDefinition[];

    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(componentSchema);

    if (!validate(data)) {
      throw new Error(`Invalid JSON schema: ${JSON.stringify(validate.errors, null, 2)}`);
    }

    if (!Array.isArray(data)) {
      throw new Error('JSON data must be an array of page definitions');
    }

    return data;
  }
}