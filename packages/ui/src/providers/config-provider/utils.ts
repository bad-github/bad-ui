/** 仅合并非 undefined 的字段，保留 false、null、空字符串和空数组等显式覆盖。 */
function mergeDefined<T extends object>(parent: T, overrides?: Partial<T>): T {
  const result = { ...parent };
  for (const key of Object.keys(overrides ?? {}) as (keyof T)[]) {
    const value = overrides?.[key];
    if (value !== undefined) result[key] = value;
  }
  return result;
}
export { mergeDefined };
