import { readFileSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'postcss';

/**
 * Tailwind 使用方：发布保留编译指令的 CSS 源码及完整依赖图。
 * 此插件只监听和输出资源，不执行 Tailwind，也不输出预编译工具类。
 * 由 Rollup 传入绝对目录，确保从仓库任意位置执行构建都能正确定位文件。
 */
export function createTailwindStylesPlugin({ packageDirectory, sourceDirectory }) {
  // 这些入口保留 Tailwind 指令及相对扫描路径，由使用方编译，不能交给 PostCSS 预编译。
  const rawCssEntries = ['styles/theme-tokens.css', 'styles/tailwind.css'];

  // Tailwind 入口发布的是可编译 CSS，而不是另一份编译产物。
  // 将 globals.css 的完整相对导入图打包到 styles/source，保留 @theme / @utility /
  // @custom-variant / @apply。不能先交给 Tailwind 编译，否则又会产生第二套工具类。
  // 两个第三方 CSS 扩展随包携带，避免依赖本仓库 devDependencies 才能解析样式。
  const styleVendors = {
    // tw-animate-css 的 exports 仅在 style 条件下公开包根入口：
    // { ".": { "style": "./dist/tw-animate.css" } }。
    // CSS 构建工具可据此解析 @import 'tw-animate-css'，但 Node 默认未启用 style 条件，
    // import.meta.resolve('tw-animate-css') 无法直接解析；dist/tw-animate.css 子路径也未公开。
    // 因此这里直接读取本包 node_modules 中的实际文件（pnpm 的依赖链接同样适用）。
    // 此路径依赖上游内部目录结构，升级 tw-animate-css 时需核对并运行 test-styles。
    'tw-animate-css': join(packageDirectory, 'node_modules/tw-animate-css/dist/tw-animate.css'),
    // shadcn 明确公开了 "./tailwind.css": "./dist/tailwind.css"，Node 可直接解析该子路径。
    // 优先依赖公开入口，避免写死内部 dist 路径；resolve 返回文件 URL，转成本地路径供读取。
    'shadcn/tailwind.css': fileURLToPath(import.meta.resolve('shadcn/tailwind.css')),
  };
  function collectStyleSources() {
    const assets = new Map();
    function visit(file) {
      const fileName = `styles/source/${relative(sourceDirectory, file)}`;
      if (assets.has(fileName)) return;
      let source = readFileSync(file, 'utf8');
      // 使用 CSS 解析器访问真正的导入，避免将注释内的示例当作依赖。
      const css = parse(source);
      css.walkAtRules('import', (rule) => {
        const match = rule.params.match(/^(["'])([^"']+)\1/);
        if (!match) throw new Error(`Expected quoted CSS import in ${file}`);
        const [, quote, specifier] = match;
        if (specifier.startsWith('.')) {
          visit(resolve(dirname(file), specifier));
          return;
        }
        const vendor = styleVendors[specifier];
        if (!vendor) throw new Error(`Unpackaged CSS dependency: ${specifier}`);
        const vendorName = specifier === 'tw-animate-css' ? 'tw-animate.css' : 'shadcn.css';
        assets.set(`styles/source/vendor/${vendorName}`, {
          file: vendor,
          source: readFileSync(vendor, 'utf8'),
        });
        rule.params = rule.params.replace(match[0], `${quote}../vendor/${vendorName}${quote}`);
      });
      source = css.toString();
      assets.set(fileName, { file, source });
    }
    visit(join(sourceDirectory, 'styles/globals.css'));
    // 保留第三方样式许可证；这些文件也随 CSS 一同进入 npm tarball。
    for (const name of ['shadcn', 'tw-animate-css']) {
      const file = join(packageDirectory, 'node_modules', name, name === 'shadcn' ? 'LICENSE.md' : 'LICENSE');
      assets.set(`styles/source/vendor/${name}.LICENSE`, { file, source: readFileSync(file, 'utf8') });
    }
    return assets;
  }

  return {
    name: 'tailwind-style-sources',
    buildStart() {
      // 原样发布 Tailwind 配置，监听定义修改以同步更新发布文件。
      for (const entry of rawCssEntries) this.addWatchFile(join(sourceDirectory, entry));
      for (const { file } of collectStyleSources().values()) this.addWatchFile(file);
    },
    // 写入磁盘前输出原始样式资源；预编译 CSS 的占位模块由另一插件清理。
    generateBundle() {
      // 原样输出应用接入入口与主题令牌，保留 @theme、@source 和 @custom-variant。
      for (const entry of rawCssEntries) {
        let source = readFileSync(join(sourceDirectory, entry), 'utf8');
        // 源码入口用于本地开发；发布入口只引用随包携带的原始 CSS 图。
        if (entry === 'styles/tailwind.css')
          source = source.replace("@import './globals.css'", "@import './source/styles/globals.css'");
        this.emitFile({ type: 'asset', fileName: entry, source });
      }
      for (const [fileName, { source }] of collectStyleSources()) {
        this.emitFile({ type: 'asset', fileName, source });
      }
    },
  };
}
