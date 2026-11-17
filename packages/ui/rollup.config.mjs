import { readdirSync, rmSync } from 'node:fs';
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
// 在保留模块结构时保留 use client 等模块级指令，供 Next.js 等环境识别。
import preserveDirectives from 'rollup-plugin-preserve-directives';
// 两种 CSS 交付方式独立维护，主配置只负责组装。
import { createPrecompiledStyles } from './scripts/build-precompiled-styles.mjs';
import { createTailwindStylesPlugin } from './scripts/build-tailwind-styles.mjs';
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
const precompiledStyles = createPrecompiledStyles({ sourceDirectory, outputDirectory });

// 配置加载时清理一次旧产物，避免已删除的源码文件仍残留在发布包中。
// recursive 允许删除非空目录，force 允许目录不存在。
// watch 模式的普通源码重建不会重新加载配置，可保留 TypeScript 插件缓存的产物。
rmSync(outputDirectory, { recursive: true, force: true });

const moduleBuild = defineConfig({
  // 构建入口：JS 从 index.ts 追踪全部导出，CSS 从独立入口分别处理。
  // CSS 模块提供绝对入口路径，预编译样式与原始样式的职责分别封装。
  input: [join(sourceDirectory, 'index.ts'), ...precompiledStyles.input],
  // 只外置明确声明的运行依赖和 peer dependencies，保留 import 交给使用方解析。
  // 同时匹配包名和该包的子路径，例如 react/jsx-runtime、@base-ui/react/button。
  // 子路径必须以“包名/”开头，避免把 react-other 误判为 react。
  external: (id) => externalPackages.some((name) => id === name || id.startsWith(`${name}/`)),
  // 注册 JS 构建插件及两种 CSS 交付插件。
  plugins: [
    ...precompiledStyles.plugins,
    createTailwindStylesPlugin({ packageDirectory, sourceDirectory }),
    // 编译 TS/TSX，声明文件由独立的 dts 构建逐文件输出。
    typescript({ tsconfig: resolve(packageDirectory, 'tsconfig.build.json') }),
    // Rollup 默认会移除模块级指令，该插件在独立输出模块上恢复原有指令。
    preserveDirectives(),
    {
      // 声明文件的模块上下文属于 JS/类型构建，不放进 CSS 构建模块。
      name: 'cjs-type-context',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'cjs/types/package.json', source: '{"type":"commonjs"}\n' });
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
