export default function isInstanceOf<T>(
  value: any,
  classConstructor: new (...args: any[]) => T,
): value is T {
  return value instanceof classConstructor;
}
