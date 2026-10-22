/** Leading list numbers from source files are not part of the visible major name. */
export function majorLabel(name: string): string {
  return name.replace(/^\s*\(\d+\)\s*(?=\S)/u, '').trim();
}
