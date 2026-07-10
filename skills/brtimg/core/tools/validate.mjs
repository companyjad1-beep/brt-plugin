#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SCHEMA_FILES = {
  prompt: '../schema/prompt.schema.json',
  'character-sheet': '../schema/character-sheet.schema.json',
  'eval-report': '../schema/eval-report.schema.json'
};

const USAGE = '사용법: node core/tools/validate.mjs <file.json|file.yaml> [--schema prompt|character-sheet|eval-report]';

function parseArgs(argv) {
  let filePath = null;
  let schemaKind = null;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--schema') {
      if (i + 1 >= argv.length) {
        throw new Error('--schema 뒤에 스키마 이름이 필요합니다.');
      }
      schemaKind = normalizeKind(argv[i + 1]);
      i += 1;
      continue;
    }
    if (arg.startsWith('--schema=')) {
      schemaKind = normalizeKind(arg.slice('--schema='.length));
      continue;
    }
    if (arg.startsWith('--')) {
      throw new Error(`알 수 없는 옵션입니다: ${arg}`);
    }
    if (filePath) {
      throw new Error(`입력 파일은 하나만 지정할 수 있습니다: ${arg}`);
    }
    filePath = arg;
  }

  if (!filePath) {
    throw new Error(USAGE);
  }
  if (schemaKind === null && argv.some((arg) => arg === '--schema' || arg.startsWith('--schema='))) {
    throw new Error('지원하지 않는 스키마 이름입니다.');
  }
  return { filePath, schemaKind };
}

function normalizeKind(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === 'prompt') {
    return 'prompt';
  }
  if (['character-sheet', 'character_sheet', 'charactersheet', 'character'].includes(normalized)) {
    return 'character-sheet';
  }
  if (['eval-report', 'eval_report', 'evalreport', 'report'].includes(normalized)) {
    return 'eval-report';
  }
  return null;
}

function inferKind(data, filePath) {
  const fromData = normalizeKind(data?.schemaKind);
  if (fromData) {
    return fromData;
  }

  const baseName = path.basename(filePath).toLowerCase();
  if (baseName.includes('character-sheet') || baseName.includes('character')) {
    return 'character-sheet';
  }
  if (baseName.includes('eval-report') || baseName.includes('report')) {
    return 'eval-report';
  }
  if (baseName.includes('prompt')) {
    return 'prompt';
  }
  return null;
}

function parseInput(filePath, source) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.json') {
    return JSON.parse(source);
  }
  if (ext === '.yaml' || ext === '.yml') {
    return parseYaml(source);
  }
  try {
    return JSON.parse(source);
  } catch {
    return parseYaml(source);
  }
}

function parseYaml(source) {
  const trimmed = source.trim();
  if (!trimmed) {
    return {};
  }
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return JSON.parse(source);
  }

  const lines = [];
  const rawLines = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
  for (let i = 0; i < rawLines.length; i += 1) {
    const withoutComment = stripComment(rawLines[i]).trimEnd();
    if (!withoutComment.trim()) {
      continue;
    }
    const indent = countIndent(withoutComment);
    if (withoutComment.slice(0, indent).includes('\t')) {
      throw new Error(`YAML ${i + 1}행: 탭 들여쓰기는 지원하지 않습니다.`);
    }
    lines.push({ line: i + 1, indent, text: withoutComment.slice(indent) });
  }

  if (lines.length === 0) {
    return {};
  }

  const [value, nextIndex] = parseYamlBlock(lines, 0, lines[0].indent);
  if (nextIndex < lines.length) {
    throw new Error(`YAML ${lines[nextIndex].line}행: 예상하지 못한 내용입니다.`);
  }
  return value;
}

function parseYamlBlock(lines, index, indent) {
  if (index >= lines.length) {
    return [null, index];
  }
  if (lines[index].indent < indent) {
    return [null, index];
  }
  if (lines[index].indent !== indent) {
    throw new Error(`YAML ${lines[index].line}행: 들여쓰기가 올바르지 않습니다.`);
  }
  if (lines[index].text.startsWith('- ')) {
    return parseYamlArray(lines, index, indent);
  }
  return parseYamlObject(lines, index, indent);
}

function parseYamlObject(lines, index, indent) {
  const result = {};
  let cursor = index;

  while (cursor < lines.length) {
    const current = lines[cursor];
    if (current.indent < indent) {
      break;
    }
    if (current.indent > indent) {
      throw new Error(`YAML ${current.line}행: 상위 키 없이 중첩된 값입니다.`);
    }
    if (current.text.startsWith('- ')) {
      break;
    }

    const [key, rawValue] = splitKeyValue(current.text, current.line);
    if (!key) {
      throw new Error(`YAML ${current.line}행: 빈 키는 지원하지 않습니다.`);
    }

    if (rawValue === '') {
      if (cursor + 1 < lines.length && lines[cursor + 1].indent > indent) {
        const [nestedValue, nextCursor] = parseYamlBlock(lines, cursor + 1, lines[cursor + 1].indent);
        result[key] = nestedValue;
        cursor = nextCursor;
      } else {
        result[key] = null;
        cursor += 1;
      }
    } else {
      result[key] = parseYamlScalar(rawValue, current.line);
      cursor += 1;
    }
  }

  return [result, cursor];
}

function parseYamlArray(lines, index, indent) {
  const result = [];
  let cursor = index;

  while (cursor < lines.length) {
    const current = lines[cursor];
    if (current.indent < indent) {
      break;
    }
    if (current.indent > indent) {
      throw new Error(`YAML ${current.line}행: 목록 항목 들여쓰기가 올바르지 않습니다.`);
    }
    if (!current.text.startsWith('- ')) {
      break;
    }

    const rest = current.text.slice(2).trim();
    if (rest === '') {
      if (cursor + 1 < lines.length && lines[cursor + 1].indent > indent) {
        const [nestedValue, nextCursor] = parseYamlBlock(lines, cursor + 1, lines[cursor + 1].indent);
        result.push(nestedValue);
        cursor = nextCursor;
      } else {
        result.push(null);
        cursor += 1;
      }
      continue;
    }

    if (findColonOutsideQuotes(rest) !== -1) {
      const item = {};
      const [key, rawValue] = splitKeyValue(rest, current.line);
      if (!key) {
        throw new Error(`YAML ${current.line}행: 빈 키는 지원하지 않습니다.`);
      }
      cursor += 1;
      if (rawValue === '') {
        if (cursor < lines.length && lines[cursor].indent > indent) {
          const [nestedValue, nextCursor] = parseYamlBlock(lines, cursor, lines[cursor].indent);
          item[key] = nestedValue;
          cursor = nextCursor;
        } else {
          item[key] = null;
        }
      } else {
        item[key] = parseYamlScalar(rawValue, current.line);
      }

      while (cursor < lines.length && lines[cursor].indent > indent) {
        if (lines[cursor].text.startsWith('- ')) {
          throw new Error(`YAML ${lines[cursor].line}행: 목록 항목 안의 추가 목록은 키 아래에 두어야 합니다.`);
        }
        const [moreFields, nextCursor] = parseYamlObject(lines, cursor, lines[cursor].indent);
        Object.assign(item, moreFields);
        cursor = nextCursor;
      }
      result.push(item);
      continue;
    }

    result.push(parseYamlScalar(rest, current.line));
    cursor += 1;
  }

  return [result, cursor];
}

function stripComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (quote === '"' && char === '\\') {
      i += 1;
      continue;
    }
    if ((char === '"' || char === "'") && quote === null) {
      quote = char;
      continue;
    }
    if (char === quote) {
      quote = null;
      continue;
    }
    if (char === '#' && quote === null) {
      return line.slice(0, i);
    }
  }
  return line;
}

function countIndent(line) {
  let count = 0;
  while (count < line.length && line[count] === ' ') {
    count += 1;
  }
  return count;
}

function splitKeyValue(text, lineNumber) {
  const colonIndex = findColonOutsideQuotes(text);
  if (colonIndex === -1) {
    throw new Error(`YAML ${lineNumber}행: key: value 형식이어야 합니다.`);
  }
  const key = text.slice(0, colonIndex).trim();
  const rawValue = text.slice(colonIndex + 1).trim();
  return [key, rawValue];
}

function findColonOutsideQuotes(text) {
  let quote = null;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quote === '"' && char === '\\') {
      i += 1;
      continue;
    }
    if ((char === '"' || char === "'") && quote === null) {
      quote = char;
      continue;
    }
    if (char === quote) {
      quote = null;
      continue;
    }
    if (char === ':' && quote === null) {
      return i;
    }
  }
  return -1;
}

function parseYamlScalar(value, lineNumber) {
  if (value === '[]') {
    return [];
  }
  if (value === '{}') {
    return {};
  }
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim();
    if (!inner) {
      return [];
    }
    return splitFlowItems(inner).map((item) => parseYamlScalar(item.trim(), lineNumber));
  }
  if (value.startsWith('{') && value.endsWith('}')) {
    return JSON.parse(value);
  }
  if (value.startsWith('"') || value.endsWith('"')) {
    if (!(value.startsWith('"') && value.endsWith('"'))) {
      throw new Error(`YAML ${lineNumber}행: 큰따옴표 문자열이 닫히지 않았습니다.`);
    }
    return JSON.parse(value);
  }
  if (value.startsWith("'") || value.endsWith("'")) {
    if (!(value.startsWith("'") && value.endsWith("'"))) {
      throw new Error(`YAML ${lineNumber}행: 작은따옴표 문자열이 닫히지 않았습니다.`);
    }
    return value.slice(1, -1).replace(/''/g, "'");
  }
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  if (value === 'null' || value === '~') {
    return null;
  }
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(value)) {
    return Number(value);
  }
  return value;
}

function splitFlowItems(text) {
  const items = [];
  let quote = null;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quote === '"' && char === '\\') {
      i += 1;
      continue;
    }
    if ((char === '"' || char === "'") && quote === null) {
      quote = char;
      continue;
    }
    if (char === quote) {
      quote = null;
      continue;
    }
    if (char === ',' && quote === null) {
      items.push(text.slice(start, i));
      start = i + 1;
    }
  }
  items.push(text.slice(start));
  return items;
}

function validateValue(value, schema, fieldPath, errors) {
  if (!schema || typeof schema !== 'object') {
    return;
  }

  if (Array.isArray(schema.allOf)) {
    for (const subSchema of schema.allOf) {
      validateValue(value, subSchema, fieldPath, errors);
    }
  }

  if (schema.if && schema.then) {
    const probeErrors = [];
    validateValue(value, schema.if, fieldPath, probeErrors);
    if (probeErrors.length === 0) {
      validateValue(value, schema.then, fieldPath, errors);
    }
  }

  if (schema.type && !matchesType(value, schema.type)) {
    errors.push(`${fieldPath}: 타입이 ${formatType(schema.type)}이어야 합니다.`);
    return;
  }

  if (schema.const !== undefined && !deepEqual(value, schema.const)) {
    errors.push(`${fieldPath}: 값이 ${JSON.stringify(schema.const)}이어야 합니다.`);
  }

  if (Array.isArray(schema.enum) && !schema.enum.some((candidate) => deepEqual(value, candidate))) {
    errors.push(`${fieldPath}: 허용 값은 ${schema.enum.map((item) => JSON.stringify(item)).join(', ')} 중 하나입니다.`);
  }

  if (typeof schema.minLength === 'number' && typeof value === 'string' && value.length < schema.minLength) {
    errors.push(`${fieldPath}: 길이가 ${schema.minLength} 이상이어야 합니다.`);
  }

  if (typeof schema.minItems === 'number' && Array.isArray(value) && value.length < schema.minItems) {
    errors.push(`${fieldPath}: 항목 수가 ${schema.minItems}개 이상이어야 합니다.`);
  }
  if (typeof schema.maxItems === 'number' && Array.isArray(value) && value.length > schema.maxItems) {
    errors.push(`${fieldPath}: 항목 수가 ${schema.maxItems}개 이하여야 합니다.`);
  }

  if (Array.isArray(schema.required)) {
    if (!isPlainObject(value)) {
      errors.push(`${fieldPath}: 필수 필드를 확인하려면 객체여야 합니다.`);
    } else {
      for (const requiredKey of schema.required) {
        if (!Object.prototype.hasOwnProperty.call(value, requiredKey)) {
          errors.push(`${fieldPath}.${requiredKey}: 필수 필드가 없습니다.`);
        }
      }
    }
  }

  if (schema.properties && isPlainObject(value)) {
    for (const [key, propertySchema] of Object.entries(schema.properties)) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        validateValue(value[key], propertySchema, `${fieldPath}.${key}`, errors);
      }
    }
  }

  if (schema.items && Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      validateValue(value[i], schema.items, `${fieldPath}[${i}]`, errors);
    }
  }
}

function matchesType(value, type) {
  if (Array.isArray(type)) {
    return type.some((item) => matchesType(value, item));
  }
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value) && Number.isFinite(value);
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
      return isPlainObject(value);
    case 'array':
      return Array.isArray(value);
    case 'null':
      return value === null;
    default:
      return true;
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function formatType(type) {
  return Array.isArray(type) ? type.join('|') : type;
}

function deepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function loadSchema(kind) {
  const schemaFile = SCHEMA_FILES[kind];
  if (!schemaFile) {
    throw new Error(`지원하지 않는 스키마입니다: ${kind}`);
  }
  const schemaUrl = new URL(schemaFile, import.meta.url);
  if (!fs.existsSync(schemaUrl)) {
    console.log(`SKIP: ${kind} 스키마 파일이 없어 검증을 건너뜁니다.`);
    process.exit(0);
  }
  return JSON.parse(fs.readFileSync(schemaUrl, 'utf8'));
}

function main() {
  try {
    const { filePath, schemaKind } = parseArgs(process.argv.slice(2));
    const source = fs.readFileSync(filePath, 'utf8');
    const data = parseInput(filePath, source);
    const kind = schemaKind ?? inferKind(data, filePath);
    if (!kind) {
      throw new Error(`스키마를 추론할 수 없습니다. ${USAGE}`);
    }

    const schema = loadSchema(kind);
    const errors = [];
    validateValue(data, schema, '$', errors);

    if (errors.length > 0) {
      console.error(`FAIL: ${kind} 검증 실패 (${filePath})`);
      for (const error of errors) {
        console.error(`- ${error}`);
      }
      process.exit(1);
    }

    console.log(`PASS: ${kind} 검증 통과 (${filePath})`);
    console.log(`요약: schemaVersion=${data.schemaVersion}, id=${data.id ?? '없음'}`);
  } catch (error) {
    console.error(`FAIL: ${error.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

export { parseInput, parseYaml };
