// 临时关闭普通预览的自动交互；Vitest 的 test 模式仍执行全部测试。
// 如需恢复浏览时的自动交互，将此值改为 true。
export const shouldRunInteractions = import.meta.env.MODE === 'test';
