import { readFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'rollup';
// 按 tsconfig.build.json 编译 TS/TSX。
import typescript from '@rollup/plugin-typescript';
// 配合 preserveModules 逐文件输出声明，并处理声明中的模块路径。
import { dts } from 'rollup-plugin-dts';
// UMD 需要解析并合并 npm 依赖，包括依赖内部的 CommonJS 模块。
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
// 将 UMD 中依赖的环境判断替换为生产模式，避免浏览器访问 process。
import replace from '@rollup/plugin-replace';
// 将 PostCSS 处理流程接入 Rollup，输出独立 CSS 文件。
import postcss from 'rollup-plugin-postcss';
// 在保留模块结构时保留 use client 等模块级指令，供 Next.js 等环境识别。
import preserveDirectives from 'rollup-plugin-preserve-directives';
// 显式导入 ESM 样式配置，避免依赖旧版 PostCSS 配置加载器。
import postcssConfig from './postcss.config.mjs';
// ESM 导入 JSON 需通过 with 指定类型，配置文件可直接获得依赖清单。
import packageJson from './package.json' with { type: 'json' };

// import.meta.url 是当前配置文件的 URL，因此这里得到 packages/ui 的绝对路径。
const packageDirectory = dirname(fileURLToPath(import.meta.url));
// 源码和产物目录均基于配置文件定位，避免依赖命令执行时的工作目录。
const sourceDirectory = join(packageDirectory, 'src');
const outputDirectory = join(packageDirectory, 'dist');
// package.json 是外部依赖的显式声明来源，开发工具依赖不自动外置。
const { dependencies = {}, peerDependencies = {} } = packageJson;
const externalPackages = Object.keys({ ...dependencies, ...peerDependencies });
// 通过依赖解析找到 Geist 包目录，读取其中的上游许可证。
// import.meta.resolve 返回依赖的文件 URL，转换为本机路径后取得所在目录。
const fontDirectory = dirname(fileURLToPath(import.meta.resolve('@fontsource-variable/geist/index.css')));
// 三个公开样式入口，省略 .css 后缀以复用为输入和输出路径。
// 默认样式已包含主题和基础色；页面配色与字体由使用方按需引入。
const cssEntries = ['styles/index', 'styles/body', 'styles/font/geist'];

// 配置加载时清理一次旧产物，避免已删除的源码文件仍残留在发布包中。
// recursive 允许删除非空目录，force 允许目录不存在。
// watch 模式的普通源码重建不会重新加载配置，可保留 TypeScript 插件缓存的产物。
rmSync(outputDirectory, { recursive: true, force: true });

const moduleBuild = defineConfig({
  // 构建入口：JS 从 index.ts 追踪全部导出，CSS 从三个独立入口分别处理。
  // map 将相对样式路径转换为绝对文件路径，... 将生成的数组展开到入口数组中。
  input: [join(sourceDirectory, 'index.ts'), ...cssEntries.map((path) => join(sourceDirectory, `${path}.css`))],
  // 只外置明确声明的运行依赖和 peer dependencies，保留 import 交给使用方解析。
  // 同时匹配包名和该包的子路径，例如 react/jsx-runtime、@base-ui/react/button。
  // 子路径必须以“包名/”开头，避免把 react-other 误判为 react。
  external: (id) => externalPackages.some((name) => id === name || id.startsWith(`${name}/`)),
  // 注册构建插件；数组中的 map 会为三个 CSS 入口分别创建一个 PostCSS 实例。
  plugins: [
    // 每个实例独立提取一个 CSS 文件，避免将可选字体和 body 样式合入默认样式。
    ...cssEntries.map((path) =>
      postcss({
        ...postcssConfig,
        // 仅处理当前入口，其他入口交给各自的实例，入口中的 @import 由 Tailwind 插件解析。
        include: join(sourceDirectory, `${path}.css`),
        // 样式规则已从 ESM 配置导入，关闭插件的自动配置搜索。
        config: false,
        // 不生成向页面 head 动态注入 style 的代码，样式由使用方显式导入。
        inject: false,
        // 将处理结果提取为独立 CSS，绝对路径明确指定其输出位置。
        extract: join(outputDirectory, `${path}.css`),
        // 告知 PostCSS 最终输出路径，使字体 URL 能相对于该位置正确计算。
        // Rollup 插件会用此选项覆盖 PostCSS 配置中的 to，因此仍在这里按入口指定。
        to: join(outputDirectory, `${path}.css`),
      })
    ),
    // 编译 TS/TSX，声明文件由独立的 dts 构建逐文件输出。
    typescript({ tsconfig: resolve(packageDirectory, 'tsconfig.build.json') }),
    // Rollup 默认会移除模块级指令，该插件在独立输出模块上恢复原有指令。
    preserveDirectives(),
    {
      // CSS 和字体由生态插件编译，这里处理 CSS 入口占位模块及字体许可证。
      name: 'style-assets',
      // generateBundle 在写入磁盘前执行，可剔除占位模块并添加资源文件。
      generateBundle(_options, bundle) {
        // PostCSS 的 extract 会留下 export default undefined，CSS 入口只保留提取出的样式。
        // 仅移除 CSS 入口对应的 JS chunk，保留 CSS 资产和组件模块。
        for (const [fileName, output] of Object.entries(bundle)) {
          if (output.type === 'chunk' && output.isEntry && output.facadeModuleId?.endsWith('.css')) {
            delete bundle[fileName];
          }
        }
        // CJS 的逐文件 .d.ts 使用 CommonJS 模块上下文，支持 NodeNext 的 require 类型解析。
        this.emitFile({ type: 'asset', fileName: 'cjs/types/package.json', source: '{"type":"commonjs"}\n' });
        // emitFile 是 Rollup 插件 API，将文件交给 Rollup 统一输出。
        this.emitFile({
          // asset 表示普通资源文件，不参与 JS 模块解析和转换。
          type: 'asset',
          // 相对于 output.dir 的输出路径。
          fileName: 'styles/font/LICENSE',
          // 文件内容，readFileSync 返回的 Buffer 可直接作为资源内容。
          source: readFileSync(join(fontDirectory, 'LICENSE')),
        });
      },
    },
  ],
  // 接管 Rollup 警告，warning 为警告信息，warn 是默认的警告输出函数。
  onwarn(warning, warn) {
    // use client 已由 preserveDirectives 保留，因此跳过 Rollup 自身的移除提示。
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) return;
    // 无法解析的导入会让发布包无法正常使用，将此类警告升级为构建失败。
    if (warning.code === 'UNRESOLVED_IMPORT') throw new Error(warning.message);
    // 其他警告正常输出，避免隐藏依赖和构建问题。
    warn(warning);
  },
  // ESM/CJS 共用源码转换，样式资源输出到共享的 dist/styles。
  output: [
    {
      dir: outputDirectory,
      format: 'es',
      preserveModules: true,
      preserveModulesRoot: sourceDirectory,
      entryFileNames: 'esm/[name].js',
    },
    {
      dir: outputDirectory,
      format: 'cjs',
      preserveModules: true,
      preserveModulesRoot: sourceDirectory,
      // package.json 声明 type: module，CJS 运行文件明确使用 .cjs。
      entryFileNames: 'cjs/[name].cjs',
      exports: 'named',
    },
  ],
});

export default defineConfig([
  moduleBuild,
  {
    // UMD 只接收 JS 根入口，输出可通过 script 标签加载的单文件。
    input: join(sourceDirectory, 'index.ts'),
    // 页面提供 React 和 ReactDOM，其他运行依赖及 JSX runtime 合并到 UMD。
    external: ['react', 'react-dom'],
    plugins: [
      replace({ preventAssignment: true, 'process.env.NODE_ENV': JSON.stringify('production') }),
      typescript({
        tsconfig: resolve(packageDirectory, 'tsconfig.build.json'),
        outDir: join(outputDirectory, 'umd'),
      }),
      nodeResolve({ browser: true }),
      commonjs(),
    ],
    // UMD 是整个客户端库的单一模块，源模块指令不需要分别恢复。
    onwarn: moduleBuild.onwarn,
    output: {
      file: join(outputDirectory, 'umd/index.js'),
      format: 'umd',
      // 浏览器端通过 window.BadUI 访问组件库导出。
      name: 'BadUI',
      globals: { react: 'React', 'react-dom': 'ReactDOM' },
      // UMD 作为单文件分发，遇到动态导入也合并到当前文件。
      inlineDynamicImports: true,
      exports: 'named',
    },
  },
  {
    // 这里单独列出所有类型入口，以保留中间的 index.d.ts 和仅转发导出的文件。
    // JS 构建仍然只使用 src/index.ts，声明构建不生成 JS。
    input: Object.fromEntries(
      readdirSync(sourceDirectory, { recursive: true })
        .filter((path) => /\.tsx?$/.test(path) && !path.endsWith('.d.ts') && !/\.stories\.tsx?$/.test(path))
        .map((path) => [path.replace(/\.tsx?$/, ''), join(sourceDirectory, path)])
    ),
    external: moduleBuild.external,
    plugins: [dts({ tsconfig: resolve(packageDirectory, 'tsconfig.build.json') })],
    output: [
      {
        dir: join(outputDirectory, 'types'),
        format: 'es',
        // 保留每个声明模块的目录结构，插件自动解析别名及修正相对导入路径。
        preserveModules: true,
        preserveModulesRoot: sourceDirectory,
        entryFileNames: '[name].d.ts',
      },
      {
        dir: join(outputDirectory, 'cjs/types'),
        format: 'es',
        // 声明使用相同语法，目录内 package.json 为 CJS 声明指定 CommonJS 上下文。
        preserveModules: true,
        preserveModulesRoot: sourceDirectory,
        entryFileNames: '[name].d.ts',
      },
    ],
  },
]);
