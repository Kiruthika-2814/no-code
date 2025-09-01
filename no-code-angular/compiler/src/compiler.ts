// compiler/src/compiler.ts
const { promises: fs } = require('fs');
const { dirname, resolve } = require('path');
import { JsonParser } from './parsers/json.parser';
import { AngularGenerator } from './generators/angular.generator';
import { ComponentDefinition } from './parsers/json.parser';

export class NoCodeCompiler {
  constructor(
    private parser: JsonParser = new JsonParser(),
    private generator: AngularGenerator = new AngularGenerator()
  ) {}

  async compile(inputPath: string, outputPath: string): Promise<void> {
    try {
      const pages = this.parser.parse(inputPath);

      // Copy theme.scss from source to generated library
      const sourceThemePath = resolve('../src/styles/theme.scss');
      const targetThemePath = resolve('../runtime/projects/dynamic-components/src/styles/theme.scss');
      await this.copyThemeScss(sourceThemePath, targetThemePath);

      const processPage = async (page: { pageName: string; components: ComponentDefinition[] }) => {
        console.log(`Generating ${page.pageName} component...`);

        const { html, css, ts } = this.generator.generate(page);
        const componentDir = `${outputPath}/${page.pageName}`;

        await this.ensureDirExists(componentDir);

        await Promise.all([
          fs.writeFile(`${componentDir}/${page.pageName}.component.html`, html),
          fs.writeFile(`${componentDir}/${page.pageName}.component.scss`, css),
          fs.writeFile(`${componentDir}/${page.pageName}.component.ts`, ts)
        ]);
      };

      await Promise.all(pages.map(processPage));
    } catch (error) {
      const err = error as Error;
      console.error(`Error during compilation: ${err.message}`);
      throw err;
    }
  }

  private async ensureDirExists(path: string): Promise<void> {
    try {
      await fs.mkdir(path, { recursive: true });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const err = error as { code: string };
        if (err.code !== 'EEXIST') {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  private async copyThemeScss(sourcePath: string, targetPath: string): Promise<void> {
    try {
      const content = await fs.readFile(sourcePath, 'utf-8');
      await this.ensureDirExists(dirname(targetPath));
      await fs.writeFile(targetPath, content);
      console.log(`✔ Copied theme.scss to: ${targetPath}`);
    } catch (err) {
      console.error(`⚠ Failed to copy theme.scss from ${sourcePath} to ${targetPath}`, err);
      throw err;
    }
  }
}
