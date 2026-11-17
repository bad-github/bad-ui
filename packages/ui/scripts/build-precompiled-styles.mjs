import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'rollup-plugin-postcss';
// 只在预编译模式使用 PostCSS 配置；原始 Tailwind 入口不能走这条流程。
import postcssConfig from '../postcss.config.mjs';

/**
 * 非 Tailwind 使用方：在库构建阶段生成浏览器可直接加载的 CSS。
 * 可选页面样式、滚动条和字体分别输出，不强制合入默认组件样式。
 * 返回输入和插件交给 Rollup 组装，与 JS 共用一次模块构建。
 */
export function createPrecompiledStyles({ sourceDirectory, outputDirectory }) {
  const entries = ['styles/index', 'styles/custom', 'styles/scrollbar', 'styles/font/geist'];
  const fontDirectory = dirname(fileURLToPath(import.meta.resolve('@fontsource-variable/geist/index.css')));
  return {
    input: entries.map((entry) => join(sourceDirectory, `${entry}.css`)),
    plugins: [
      ...entries.map((entry) =>
        postcss({
          ...postcssConfig,
          // 每个实例仅处理自己的入口；入口内部的 @import 由 Tailwind 解析。
          include: join(sourceDirectory, `${entry}.css`),
          config: false,
          // CSS 独立提取，JS 不向页面 head 动态插入 style。
          inject: false,
          extract: join(outputDirectory, `${entry}.css`),
          // 给字体资源处理提供最终输出位置，保持复制后的 URL 正确。
          to: join(outputDirectory, `${entry}.css`),
        })
      ),
      {
        name: 'precompiled-style-assets',
        generateBundle(_options, bundle) {
          // 提取 CSS 后会留下空 JS 入口，仅删除这些占位文件，保留组件 JS。
          for (const [fileName, output] of Object.entries(bundle)) {
            if (output.type === 'chunk' && output.isEntry && output.facadeModuleId?.endsWith('.css')) {
              delete bundle[fileName];
            }
          }
          // 字体文件由 PostCSS 复制，许可证由本插件随包输出。
          this.emitFile({
            type: 'asset',
            fileName: 'styles/font/LICENSE',
            source: readFileSync(join(fontDirectory, 'LICENSE')),
          });
        },
      },
    ],
  };
}
