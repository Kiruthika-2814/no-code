import { NoCodeCompiler } from './compiler';
import { JsonParser, PageDefinition } from './parsers/json.parser';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

async function runLiveTest() {
  try {
    const compiler = new NoCodeCompiler();
    const parser = new JsonParser();
    console.log('Starting compilation...');

    const inputPath = resolve(__dirname, '../../json/ui.json');
    const outputPath = resolve(__dirname, '../../runtime/projects/dynamic-components/src/lib/generated');

    await compiler.compile(inputPath, outputPath);

    console.log('✅ Component generation successful!');
    console.log('Generated components:');
    const pages: PageDefinition[] = parser.parse(inputPath);
    pages.forEach((page: PageDefinition) => {
      console.log(`- ${page.pageName}`);
    });

    console.log('Generating dynamic-components module...');
    const moduleContent = `
        import { NgModule } from '@angular/core';
        import { CommonModule } from '@angular/common';
        import { FormsModule } from '@angular/forms';
        ${pages.map(page => `import { ${toPascalCase(page.pageName)}Component } from './generated/${page.pageName}/${page.pageName}.component';`).join('\n')}

        @NgModule({
          imports: [CommonModule, FormsModule],
          declarations: [
        ${pages.map(page => `    ${toPascalCase(page.pageName)}Component`).join(',\n')}
          ],
          exports: [
        ${pages.map(page => `    ${toPascalCase(page.pageName)}Component`).join(',\n')}
          ]
        })
        export class DynamicComponentsModule {}
            `;
            writeFileSync(
              resolve(__dirname, '../../runtime/projects/dynamic-components/src/lib/dynamic-components.module.ts'),
              moduleContent
            );

    console.log('Generating public-api.ts...');
    const publicApiContent = `
        export * from './lib/dynamic-components.module';
        ${pages.map(page => `export * from './lib/generated/${page.pageName}/${page.pageName}.component';`).join('\n')}
            `;
            writeFileSync(
              resolve(__dirname, '../../runtime/projects/dynamic-components/src/public-api.ts'),
              publicApiContent
            );

            console.log('Generating app.routes.ts...');
            const routesContent = `
                import { Routes } from '@angular/router';
                ${pages.map(page => `import { ${toPascalCase(page.pageName)}Component } from '../../projects/dynamic-components/src/lib/generated/${page.pageName}/${page.pageName}.component';`).join('\n')}

                export const routes: Routes = [
                ${pages.map(page => `  { path: '${page.pageName.replace('-page', '')}', component: ${toPascalCase(page.pageName)}Component }`).join(',\n')},
                  { path: '', redirectTo: '${pages[0].pageName.replace('-page', '')}', pathMatch: 'full' }
                ];
                `;

            writeFileSync(
              resolve(__dirname, '../../runtime/src/app/app.routes.ts'),
              routesContent
            );

    console.log('Building Angular library...');
    execSync(`cd ${resolve(__dirname, '../../runtime')} && npx ng build dynamic-components`, { stdio: 'inherit' });

    console.log('✅ Live test completed successfully!');
  } catch (error) {
    console.error('❌ Live test failed:', error);
    process.exit(1);
  }
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

runLiveTest();