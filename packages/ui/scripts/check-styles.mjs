// 先执行 pnpm --filter @badnpm/ui build，再运行本脚本。
// 使用真实 tarball，而非源码别名：防止漏发 CSS、依赖 devDependencies、扫描路径失效。
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import { chromium } from 'playwright';

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const directory = mkdtempSync(join(tmpdir(), 'bad-ui-styles-'));
let browser;
try {
  const packed = JSON.parse(
    execFileSync('npm', ['pack', '--json', '--pack-destination', directory, '--cache', join(directory, 'npm-cache')], {
      cwd: packageDirectory,
      encoding: 'utf8',
    })
  );
  execFileSync('tar', ['-xf', join(directory, packed[0].filename), '-C', directory]);
  // 模拟只有组件包和 Tailwind 的消费环境；不暴露 shadcn、tw-animate-css 等开发依赖。
  mkdirSync(join(directory, 'node_modules/@badnpm'), { recursive: true });
  symlinkSync(join(directory, 'package'), join(directory, 'node_modules/@badnpm/ui'));
  symlinkSync(join(packageDirectory, 'node_modules/tailwindcss'), join(directory, 'node_modules/tailwindcss'));
  const entry = join(directory, 'app.css');
  writeFileSync(entry, "@import '@badnpm/ui/styles/tailwind.css';\n");
  // 应用的类名和库的类名由同一编译生成；此处不添加库的 @source。
  const html =
    '<div id="mobile" class="flex md:hidden z-[123]"></div>' + '<div id="sidebar" class="hidden md:flex"></div>';
  writeFileSync(join(directory, 'app.html'), html);
  const result = await postcss([tailwindcss({ base: directory, optimize: false })]).process(
    readFileSync(entry, 'utf8'),
    { from: entry }
  );
  const compiled = postcss.parse(result.css);
  // 不只检查文本：断言工具类没有重复定义，库独有类也通过包内扫描生成。
  for (const selector of ['.flex', '.hidden', '.md\\:flex', '.md\\:hidden']) {
    let count = 0;
    compiled.walkRules(selector, () => count++);
    assert.equal(count, 1, `${selector} must be generated exactly once`);
  }
  assert.ok(result.css.includes('.bg-sidebar'), 'library ESM source must be scanned');
  assert.ok(result.css.includes('z-index: 123'), 'application source must be scanned');
  assert.ok(result.css.includes('.CollapsibleContent'), 'handwritten component CSS must be included');
  assert.ok(
    result.css.includes('@starting-style') || result.css.includes('data-starting-style'),
    'state styles must be included'
  );
  assert.ok(
    !/@(?:import|apply|source|theme|utility|custom-variant)\s/.test(result.css),
    'all Tailwind directives must be compiled'
  );

  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  // 验证导致本次改造的两种显示组合，不能只检查构建是否成功。
  for (const [width, expected] of [
    [500, ['flex', 'none']],
    [1200, ['none', 'flex']],
  ]) {
    await page.setViewportSize({ width, height: 800 });
    await page.setContent(`<style>${result.css}</style>${html}`);
    const display = await page
      .locator('#mobile, #sidebar')
      .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).display));
    assert.deepEqual(display, expected, `responsive display at ${width}px`);
  }
  // 非 Tailwind 消费方直接加载 tarball 中的 CSS，不运行 Tailwind。
  const precompiled = readFileSync(join(directory, 'package/dist/styles/index.css'), 'utf8');
  assert.ok(!/@(?:import|apply|source|theme|utility|custom-variant)\s/.test(precompiled));
  await page.setContent(`<style>${precompiled}</style><div id="plain" class="flex bg-primary"></div>`);
  assert.equal(await page.locator('#plain').evaluate((node) => getComputedStyle(node).display), 'flex');
  assert.notEqual(
    await page.locator('#plain').evaluate((node) => getComputedStyle(node).backgroundColor),
    'rgba(0, 0, 0, 0)'
  );
  console.log(
    'Passed: packed CSS dependency graph, single utility generation, library/app scanning, mobile/desktop display, standalone precompiled CSS.'
  );
} finally {
  await browser?.close();
  rmSync(directory, { recursive: true, force: true });
}
