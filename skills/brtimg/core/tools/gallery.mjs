#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseInput, parseYaml } from './validate.mjs';

const DEFAULT_OUT = 'workspace/gallery.html';
const PROMPT_DIR = path.resolve('workspace/prompts');
const REFERENCE_DIR = path.resolve('core/style-library/golden-set/reference');
const PROMPT_EXTENSIONS = new Set(['.yaml', '.json']);
const REFERENCE_EXTENSIONS = new Set(['.md', '.yaml']);
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

async function main() {
  const outPath = path.resolve(parseArgs(process.argv.slice(2)).out);
  const outDir = path.dirname(outPath);
  const scanResult = await scanGallery(outDir);
  const html = renderHtml(scanResult);

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outPath, html, 'utf8');

  console.log(`스캔 개수: ${scanResult.scannedCount}`);
  console.log(`스킵 개수: ${scanResult.skippedCount}`);
  console.log(`생성 경로: ${toDisplayPath(outPath)}`);
  console.log(`브라우저로 열기: ${pathToFileURL(outPath).href}`);
}

function parseArgs(argv) {
  let out = DEFAULT_OUT;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--out') {
      if (i + 1 >= argv.length) {
        throw new Error('--out 뒤에 생성 경로가 필요합니다.');
      }
      out = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg.startsWith('--out=')) {
      out = arg.slice('--out='.length);
      continue;
    }
    throw new Error(`알 수 없는 옵션입니다: ${arg}`);
  }

  return { out };
}

async function scanGallery(outDir) {
  const items = [];
  const warnings = [];
  let scannedCount = 0;
  let skippedCount = 0;

  const promptFiles = await listFiles(PROMPT_DIR, PROMPT_EXTENSIONS);
  for (const filePath of promptFiles) {
    scannedCount += 1;
    try {
      const source = await fs.readFile(filePath, 'utf8');
      const data = parseInput(filePath, source);
      items.push(await normalizePromptItem(data, filePath, outDir));
    } catch (error) {
      skippedCount += 1;
      warnings.push(makeWarning(filePath, 'workspace', error));
    }
  }

  const referenceFiles = await listFiles(REFERENCE_DIR, REFERENCE_EXTENSIONS);
  for (const filePath of referenceFiles) {
    scannedCount += 1;
    try {
      if (path.extname(filePath).toLowerCase() === '.md') {
        const source = await fs.readFile(filePath, 'utf8');
        items.push(normalizeReferenceMarkdownItem(source, filePath));
      } else {
        const source = await fs.readFile(filePath, 'utf8');
        const data = parseInput(filePath, source);
        items.push(normalizeReferenceYamlItem(data, filePath));
      }
    } catch (error) {
      skippedCount += 1;
      warnings.push(makeWarning(filePath, 'reference', error));
    }
  }

  items.sort((left, right) => String(right.date).localeCompare(String(left.date)) || left.path.localeCompare(right.path));

  return { generatedAt: new Date().toISOString(), scannedCount, skippedCount, items, warnings };
}

async function listFiles(dirPath, extensions) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => path.join(dirPath, entry.name))
      .sort((left, right) => left.localeCompare(right));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function normalizePromptItem(data, filePath, outDir) {
  return {
    type: 'prompt',
    source: 'workspace',
    path: toDisplayPath(filePath),
    title: asText(data.title) || path.basename(filePath, path.extname(filePath)),
    targetGenerator: asText(data.targetGenerator) || '미지정',
    modes: toTextArray(data.modes),
    date: asText(data.createdAt) || asText(data.registeredAt),
    finalText: asText(data.finalText),
    variants: normalizeVariants(data.variants),
    designMemo: data.designMemo ?? '',
    characterSheetRef: asText(data.characterSheetRef),
    thumbnail: await findThumbnail(data, filePath, outDir)
  };
}

function normalizeReferenceMarkdownItem(source, filePath) {
  const { metadata, body } = splitMarkdownFrontMatter(source);
  return {
    type: 'reference',
    source: 'reference',
    path: toDisplayPath(filePath),
    title: asText(metadata.source) || path.basename(filePath, path.extname(filePath)),
    targetGenerator: 'reference',
    modes: [],
    date: asText(metadata.registeredAt),
    finalText: body.trim(),
    variants: [],
    designMemo: '',
    characterSheetRef: '',
    thumbnail: ''
  };
}

function normalizeReferenceYamlItem(data, filePath) {
  return {
    type: 'reference',
    source: 'reference',
    path: toDisplayPath(filePath),
    title: asText(data.title) || asText(data.source) || path.basename(filePath, path.extname(filePath)),
    targetGenerator: asText(data.targetGenerator) || 'reference',
    modes: toTextArray(data.modes),
    date: asText(data.registeredAt) || asText(data.createdAt),
    finalText: asText(data.finalText) || asText(data.prompt) || asText(data.text),
    variants: normalizeVariants(data.variants),
    designMemo: data.designMemo ?? '',
    characterSheetRef: asText(data.characterSheetRef),
    thumbnail: ''
  };
}

function splitMarkdownFrontMatter(source) {
  const normalized = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return { metadata: {}, body: normalized };
  }

  const end = normalized.indexOf('\n---', 4);
  if (end === -1) {
    return { metadata: {}, body: normalized };
  }

  const afterMarker = normalized[end + 4] === '\n' ? end + 5 : end + 4;
  const metadataSource = normalized.slice(4, end);
  const metadata = parseYaml(metadataSource);
  return { metadata: isPlainObject(metadata) ? metadata : {}, body: normalized.slice(afterMarker) };
}

async function findThumbnail(data, filePath, outDir) {
  const explicitPaths = Array.isArray(data.resultImagePaths) ? data.resultImagePaths : [];
  for (const imagePath of explicitPaths) {
    if (typeof imagePath !== 'string' || imagePath.trim() === '') {
      continue;
    }
    const resolved = await resolveExistingAsset(imagePath, path.dirname(filePath), outDir);
    if (resolved) {
      return toRelativeWebPath(outDir, resolved);
    }
  }

  const basePath = path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)));
  for (const extension of IMAGE_EXTENSIONS) {
    const candidate = `${basePath}${extension}`;
    if (await exists(candidate)) {
      return toRelativeWebPath(outDir, candidate);
    }
  }

  return '';
}

async function resolveExistingAsset(assetPath, relativeDir, outDir) {
  if (path.isAbsolute(assetPath)) {
    return (await exists(assetPath)) ? assetPath : null;
  }

  const candidates = [
    path.resolve(assetPath),
    path.resolve(relativeDir, assetPath),
    path.resolve(outDir, assetPath)
  ];

  for (const candidate of candidates) {
    if (await exists(candidate)) {
      return candidate;
    }
  }

  return null;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function normalizeVariants(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item, index) => ({
      label: asText(item?.label) || `변형 ${index + 1}`,
      text: asText(item?.text)
    }))
    .filter((item) => item.text);
}

function makeWarning(filePath, source, error) {
  return {
    type: 'warning',
    source,
    path: toDisplayPath(filePath),
    title: '파싱 실패',
    message: error instanceof Error ? error.message : String(error)
  };
}

function toTextArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => asText(item)).filter(Boolean);
}

function asText(value) {
  return typeof value === 'string' ? value : '';
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function toDisplayPath(filePath) {
  return path.relative(process.cwd(), filePath).split(path.sep).join('/');
}

function toRelativeWebPath(fromDir, filePath) {
  const relative = path.relative(fromDir, filePath).split(path.sep).join('/');
  return relative.startsWith('.') ? relative : `./${relative}`;
}

function renderHtml(data) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>brtimg 로컬 프롬프트 갤러리</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0f1117;
      --panel: #171b24;
      --panel-2: #202636;
      --text: #edf1f7;
      --muted: #9ba7b7;
      --line: #303849;
      --accent: #7aa2ff;
      --danger: #ff8d8d;
      --focus: #b6c8ff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.5;
    }
    header {
      position: sticky;
      top: 0;
      z-index: 2;
      border-bottom: 1px solid var(--line);
      background: rgba(15, 17, 23, 0.96);
      padding: 20px clamp(16px, 4vw, 40px);
      backdrop-filter: blur(12px);
    }
    h1 { margin: 0 0 6px; font-size: clamp(24px, 4vw, 36px); }
    p { margin: 0; }
    .subtitle { color: var(--muted); }
    .filters {
      display: grid;
      grid-template-columns: repeat(3, minmax(180px, 1fr));
      gap: 12px;
      margin-top: 18px;
    }
    label, .filter-group { display: grid; gap: 6px; color: var(--muted); font-size: 13px; }
    input,
    button {
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--panel);
      color: var(--text);
      font: inherit;
    }
    input { width: 100%; padding: 10px 12px; }
    button { cursor: pointer; }
    .filter-buttons { display: flex; flex-wrap: wrap; gap: 6px; }
    .filter-btn { padding: 8px 14px; border-radius: 999px; font-size: 13px; }
    .filter-btn[aria-pressed="true"] {
      background: var(--accent);
      border-color: var(--accent);
      color: #0f1117;
      font-weight: 600;
    }
    button:focus-visible,
    input:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
    main {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
      gap: 20px;
      padding: 20px clamp(16px, 4vw, 40px) 40px;
    }
    .status { margin-bottom: 14px; color: var(--muted); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
    .card {
      display: grid;
      gap: 12px;
      width: 100%;
      min-height: 220px;
      padding: 14px;
      border: 1px solid var(--line);
      border-radius: 16px;
      background: var(--panel);
      text-align: left;
      transition: border-color 0.16s ease, transform 0.16s ease;
    }
    .card:hover { border-color: var(--accent); transform: translateY(-2px); }
    .warning-card { border-color: rgba(255, 141, 141, 0.55); }
    .thumb {
      display: grid;
      place-items: center;
      overflow: hidden;
      min-height: 150px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: #0a0c11;
      color: var(--muted);
      font-size: 13px;
    }
    .thumb img { width: 100%; height: 180px; object-fit: cover; display: block; }
    .card h2 { margin: 0; font-size: 18px; }
    .meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; color: var(--muted); font-size: 12px; }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      border-radius: 999px;
      background: var(--panel-2);
      color: var(--text);
      font-size: 12px;
    }
    .excerpt {
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 5;
      -webkit-box-orient: vertical;
      color: #cdd5e2;
      font-size: 14px;
    }
    .empty {
      grid-column: 1 / -1;
      padding: 40px;
      border: 1px dashed var(--line);
      border-radius: 16px;
      color: var(--muted);
      text-align: center;
    }
    .detail {
      position: sticky;
      top: 156px;
      max-height: calc(100vh - 176px);
      overflow: auto;
      border: 1px solid var(--line);
      border-radius: 18px;
      background: var(--panel);
      padding: 18px;
    }
    .detail h2 { margin: 0 0 10px; }
    .detail-section { display: grid; gap: 10px; margin-top: 18px; }
    .copy-row { display: flex; justify-content: space-between; gap: 10px; align-items: center; }
    .copy-button { padding: 7px 10px; color: var(--accent); }
    pre {
      overflow: auto;
      max-height: 320px;
      margin: 0;
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: #0a0c11;
      color: #dce4f2;
      white-space: pre-wrap;
      word-break: break-word;
    }
    details {
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: #11141d;
    }
    summary { cursor: pointer; color: var(--accent); }
    .danger { color: var(--danger); }
    @media (max-width: 980px) {
      main { grid-template-columns: 1fr; }
      .detail { position: static; max-height: none; }
    }
    @media (max-width: 720px) {
      .filters { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <h1>로컬 프롬프트 갤러리</h1>
    <p class="subtitle">workspace와 reference 기준 프롬프트를 오프라인 정적 HTML로 탐색합니다.</p>
    <div class="filters" aria-label="필터">
      <div class="filter-group" role="group" aria-label="생성기 필터">
        <span>생성기</span>
        <div class="filter-buttons" id="generatorFilter">
          <button type="button" class="filter-btn" data-value="all" aria-pressed="true">전체</button>
          <button type="button" class="filter-btn" data-value="gpt-image-2" aria-pressed="false">gpt-image-2</button>
          <button type="button" class="filter-btn" data-value="nano-banana-pro" aria-pressed="false">nano-banana-pro</button>
          <button type="button" class="filter-btn" data-value="seedance-2" aria-pressed="false">seedance-2</button>
        </div>
      </div>
      <div class="filter-group" role="group" aria-label="소스 필터">
        <span>소스</span>
        <div class="filter-buttons" id="sourceFilter">
          <button type="button" class="filter-btn" data-value="all" aria-pressed="true">전체</button>
          <button type="button" class="filter-btn" data-value="workspace" aria-pressed="false">workspace</button>
          <button type="button" class="filter-btn" data-value="reference" aria-pressed="false">reference</button>
        </div>
      </div>
      <label>텍스트 검색
        <input id="searchInput" type="search" placeholder="제목 또는 finalText 검색">
      </label>
    </div>
  </header>
  <main>
    <section>
      <div id="status" class="status"></div>
      <div id="grid" class="grid"></div>
    </section>
    <aside id="detail" class="detail" aria-live="polite">
      <p class="subtitle">카드를 선택하면 finalText, variants, designMemo, 참조 정보를 확인할 수 있습니다.</p>
    </aside>
  </main>
  <script type="application/json" id="gallery-data">${json}</script>
  <script>
    const galleryData = JSON.parse(document.getElementById('gallery-data').textContent);
    const state = { selectedPath: null };
    const filters = { generator: 'all', source: 'all' };
    const els = {
      generator: document.getElementById('generatorFilter'),
      source: document.getElementById('sourceFilter'),
      search: document.getElementById('searchInput'),
      status: document.getElementById('status'),
      grid: document.getElementById('grid'),
      detail: document.getElementById('detail')
    };

    bindFilterButtons(els.generator, 'generator');
    bindFilterButtons(els.source, 'source');
    els.search.addEventListener('input', render);

    function bindFilterButtons(container, key) {
      container.addEventListener('click', (event) => {
        const button = event.target.closest('.filter-btn');
        if (!button) {
          return;
        }
        filters[key] = button.dataset.value;
        for (const other of container.querySelectorAll('.filter-btn')) {
          other.setAttribute('aria-pressed', String(other === button));
        }
        render();
      });
    }

    render();

    function render() {
      const items = galleryData.items.filter(matchesItem);
      const warnings = galleryData.warnings.filter(matchesWarning);
      els.grid.replaceChildren();
      els.status.textContent = '표시 ' + items.length + '개 / 전체 ' + galleryData.items.length + '개, 경고 ' + warnings.length + '개';

      if (galleryData.items.length === 0 && warnings.length === 0) {
        els.grid.appendChild(makeEmpty('/brtimg:new로 첫 프롬프트를 만들어보세요'));
        return;
      }
      if (items.length === 0 && warnings.length === 0) {
        els.grid.appendChild(makeEmpty('조건에 맞는 카드가 없습니다.'));
        return;
      }

      for (const warning of warnings) {
        els.grid.appendChild(makeWarningCard(warning));
      }
      for (const item of items) {
        els.grid.appendChild(makeCard(item));
      }
    }

    function matchesItem(item) {
      if (filters.generator !== 'all' && item.targetGenerator !== filters.generator) {
        return false;
      }
      if (filters.source !== 'all' && item.source !== filters.source) {
        return false;
      }
      const query = els.search.value.trim().toLowerCase();
      if (!query) {
        return true;
      }
      return (item.title + ' ' + item.finalText).toLowerCase().includes(query);
    }

    function matchesWarning(warning) {
      if (filters.generator !== 'all') {
        return false;
      }
      if (filters.source !== 'all' && warning.source !== filters.source) {
        return false;
      }
      const query = els.search.value.trim().toLowerCase();
      if (!query) {
        return true;
      }
      return (warning.path + ' ' + warning.message).toLowerCase().includes(query);
    }

    function makeCard(item) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'card';
      card.addEventListener('click', () => showDetail(item));

      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      if (item.thumbnail) {
        const image = document.createElement('img');
        image.src = item.thumbnail;
        image.alt = item.title + ' 결과 이미지';
        thumb.appendChild(image);
      } else {
        thumb.textContent = '썸네일 없음';
      }
      card.appendChild(thumb);

      const title = document.createElement('h2');
      title.textContent = item.title;
      card.appendChild(title);
      card.appendChild(makeMeta(item));

      const excerpt = document.createElement('p');
      excerpt.className = 'excerpt';
      excerpt.textContent = previewText(item.finalText, 200);
      card.appendChild(excerpt);
      return card;
    }

    function makeWarningCard(warning) {
      const card = document.createElement('div');
      card.className = 'card warning-card';
      const title = document.createElement('h2');
      title.className = 'danger';
      title.textContent = warning.title;
      const path = document.createElement('p');
      path.textContent = warning.path;
      const message = document.createElement('p');
      message.className = 'excerpt';
      message.textContent = warning.message;
      card.append(title, path, message);
      return card;
    }

    function makeMeta(item) {
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.appendChild(makeBadge(item.targetGenerator));
      for (const mode of item.modes) {
        meta.appendChild(makeBadge(mode));
      }
      if (item.date) {
        const date = document.createElement('span');
        date.textContent = item.date;
        meta.appendChild(date);
      }
      return meta;
    }

    function makeBadge(text) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = text;
      return badge;
    }

    function showDetail(item) {
      state.selectedPath = item.path;
      els.detail.replaceChildren();

      const title = document.createElement('h2');
      title.textContent = item.title;
      els.detail.appendChild(title);
      els.detail.appendChild(makeMeta(item));
      els.detail.appendChild(makePathBlock('파일 경로', item.path));

      if (item.characterSheetRef) {
        els.detail.appendChild(makePathBlock('characterSheetRef', item.characterSheetRef));
      }
      els.detail.appendChild(makeCopyBlock('finalText', item.finalText || ''));

      if (item.variants.length > 0) {
        const section = document.createElement('div');
        section.className = 'detail-section';
        const heading = document.createElement('h3');
        heading.textContent = 'variants';
        section.appendChild(heading);
        for (const variant of item.variants) {
          section.appendChild(makeCopyBlock(variant.label, variant.text));
        }
        els.detail.appendChild(section);
      }

      if (hasDesignMemo(item.designMemo)) {
        const details = document.createElement('details');
        details.className = 'detail-section';
        const summary = document.createElement('summary');
        summary.textContent = 'designMemo 접기/펼치기';
        const pre = document.createElement('pre');
        pre.textContent = formatValue(item.designMemo);
        details.append(summary, pre);
        els.detail.appendChild(details);
      }
    }

    function makeCopyBlock(label, text) {
      const section = document.createElement('section');
      section.className = 'detail-section';
      const row = document.createElement('div');
      row.className = 'copy-row';
      const heading = document.createElement('h3');
      heading.textContent = label;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-button';
      button.textContent = '복사';
      button.addEventListener('click', async () => {
        await copyText(text);
        button.textContent = '복사됨';
        window.setTimeout(() => { button.textContent = '복사'; }, 1200);
      });
      row.append(heading, button);
      const pre = document.createElement('pre');
      pre.textContent = text;
      section.append(row, pre);
      return section;
    }

    function makePathBlock(label, value) {
      const block = document.createElement('p');
      block.className = 'subtitle';
      block.textContent = label + ': ' + value;
      return block;
    }

    function makeEmpty(message) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = message;
      return empty;
    }

    async function copyText(text) {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          return;
        }
      } catch {
        // textarea 폴백으로 계속 진행합니다.
      }
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-1000px';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      textarea.remove();
      if (!ok) {
        throw new Error('복사에 실패했습니다.');
      }
    }

    function previewText(text, length) {
      if (!text) {
        return '';
      }
      return text.length > length ? text.slice(0, length) + '...' : text;
    }

    function hasDesignMemo(value) {
      if (!value) {
        return false;
      }
      if (typeof value === 'string') {
        return value.trim() !== '';
      }
      return true;
    }

    function formatValue(value) {
      return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    }
  </script>
</body>
</html>
`;
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
});
