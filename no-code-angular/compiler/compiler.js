"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoCodeCompiler = void 0;
// compiler/src/compiler.ts
const { promises: fs } = require('fs');
const { dirname, resolve } = require('path');
const json_parser_1 = require("./parsers/json.parser");
const angular_generator_1 = require("./generators/angular.generator");
class NoCodeCompiler {
    parser;
    generator;
    constructor(parser = new json_parser_1.JsonParser(), generator = new angular_generator_1.AngularGenerator()) {
        this.parser = parser;
        this.generator = generator;
    }
    async compile(inputPath, outputPath) {
        try {
            const pages = this.parser.parse(inputPath);
            // Copy theme.scss from source to generated library
            const sourceThemePath = resolve('../src/styles/theme.scss');
            const targetThemePath = resolve('../runtime/projects/dynamic-components/src/styles/theme.scss');
            await this.copyThemeScss(sourceThemePath, targetThemePath);
            const processPage = async (page) => {
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
        }
        catch (error) {
            const err = error;
            console.error(`Error during compilation: ${err.message}`);
            throw err;
        }
    }
    async ensureDirExists(path) {
        try {
            await fs.mkdir(path, { recursive: true });
        }
        catch (error) {
            if (typeof error === 'object' && error !== null && 'code' in error) {
                const err = error;
                if (err.code !== 'EEXIST') {
                    throw error;
                }
            }
            else {
                throw error;
            }
        }
    }
    async copyThemeScss(sourcePath, targetPath) {
        try {
            const content = await fs.readFile(sourcePath, 'utf-8');
            await this.ensureDirExists(dirname(targetPath));
            await fs.writeFile(targetPath, content);
            console.log(`✔ Copied theme.scss to: ${targetPath}`);
        }
        catch (err) {
            console.error(`⚠ Failed to copy theme.scss from ${sourcePath} to ${targetPath}`, err);
            throw err;
        }
    }
}
exports.NoCodeCompiler = NoCodeCompiler;
//# sourceMappingURL=compiler.js.map