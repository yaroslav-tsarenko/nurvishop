import lvNames from "./category-names.lv.json";

// Category names live in the DB in English only. Translations are keyed by the
// exact English name so imports/renames in the admin keep working: anything
// without an entry simply falls back to the original name.
const DICTIONARIES: Record<string, Record<string, string>> = {
  lv: lvNames as Record<string, string>,
};

export function localizeCategoryName(name: string, locale: string): string {
  if (!name) return name;
  return DICTIONARIES[locale]?.[name.trim()] ?? name;
}

/** Shallow-localizes `name` on a category tree (with optional `children`). */
export function localizeCategoryTree<T extends { name: string; children?: T[] }>(
  nodes: T[],
  locale: string,
): T[] {
  if (!DICTIONARIES[locale]) return nodes;
  return nodes.map((n) => ({
    ...n,
    name: localizeCategoryName(n.name, locale),
    ...(n.children ? { children: localizeCategoryTree(n.children, locale) } : {}),
  }));
}
