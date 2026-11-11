// 加载 Vite 对 CSS、图片等静态资源导入的类型声明。
// UI 包 tsconfig 显式包含 .storybook/**/*.ts，确保隐藏目录中的此声明也被加载。
// 发布构建仅包含 src，不加载本文件。
/// <reference types="vite/client" />
