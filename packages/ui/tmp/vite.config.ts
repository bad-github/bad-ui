// import {resolve} from 'node:path';
// import tailwindcss from '@tailwindcss/vite';
// import react from '@vitejs/plugin-react';
// import {defineConfig} from 'vite';
// import pkg from './package.json';

// const dependencies = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies)];

// export default defineConfig(({mode}) => ({
//   plugins: [react(), tailwindcss()],
//   resolve: {
//     alias: {
//       // 包内使用独立的源码别名，避免与消费应用的 @ 冲突。
//       '@ui-base': resolve(import.meta.dirname, 'src'),
//     },
//   },
//   build:
//     mode === 'lib'
//       ? {
//           outDir: 'dist-lib',
//           copyPublicDir: false,
//           cssCodeSplit: true,
//           lib: {
//             entry: {
//               index: resolve(import.meta.dirname, 'src/index.ts'),
//               'theme-provider': resolve(import.meta.dirname, 'src/provider/theme-provider.tsx'),
//               style: resolve(import.meta.dirname, 'src/style.ts'),
//               font: resolve(import.meta.dirname, 'src/font.ts'),
//             },
//             formats: ['es'],
//           },
//           rolldownOptions: {
//             external: (id) => dependencies.some((name) => id === name || id.startsWith(`${name}/`)),
//             output: {
//               // 保留模块结构，Rolldown 原生保留各组件的 use client 指令。
//               preserveModules: true,
//               preserveModulesRoot: resolve(import.meta.dirname, 'src'),
//               entryFileNames: '[name].js',
//               assetFileNames: (asset) => {
//                 const name = asset.names[0] ?? '';
//                 if (name === 'styles/index.css') return 'css/style.css';
//                 if (name === 'styles/font.css') return 'css/font.css';
//                 return 'css/[name][extname]';
//               },
//             },
//           },
//         }
//       : {outDir: 'dist-app'},
// }));
