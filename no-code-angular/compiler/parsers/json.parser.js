"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonParser = void 0;
const { readFileSync } = require('node:fs');
const Ajv = require('ajv');
const componentSchema = require('../../schemas/component.schema.json');
class JsonParser {
    parse(filePath) {
        const rawData = readFileSync(filePath, 'utf-8');
        const data = JSON.parse(rawData);
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
exports.JsonParser = JsonParser;
//# sourceMappingURL=json.parser.js.map