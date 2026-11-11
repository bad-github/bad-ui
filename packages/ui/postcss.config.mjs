import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
// Tailwind v4 官方插件，解析 CSS 导入、主题指令并生成工具类。
import tailwindcss from '@tailwindcss/postcss';
// 处理字体等资源的 url() 引用。
import postcssUrl from 'postcss-url';

const packageDirectory = dirname(fileURLToPath(import.meta.url));

export default {
  // 按数组顺序执行，先让 Tailwind 展开导入并编译，再处理编译结果中的资源路径。
  plugins: [
    tailwindcss({
      // 基于本配置所在目录定位源码，扫描范围限定到组件库，避免包含 demo 的类名。
      base: join(packageDirectory, 'src'),
      // 启用 Tailwind 的 CSS 优化和压缩。
      optimize: true,
    }),
    postcssUrl({
      // 将 CSS 引用的字体等文件复制到输出目录。
      url: 'copy',
      // 相对于各个 CSS 输出文件所在目录创建 files 子目录。
      assetsPath: 'files',
      // 用文件内容的哈希命名资源，并同步更新 CSS URL，减少同名文件冲突。
      useHash: true,
    }),
  ],
};
