/** Build prefixed canonical external form: excel:… or python:… */

export function withExcelPrefix(normalizedBody: string): string {
  const t = normalizedBody.trim();
  if (t.toLowerCase().startsWith("excel:")) return t;
  return `excel:${t}`;
}

export function withPythonPrefix(normalizedBody: string): string {
  const t = normalizedBody.trim();
  if (t.toLowerCase().startsWith("python:")) return t;
  return `python:${t}`;
}
