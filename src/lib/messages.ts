import { getMessages } from "next-intl/server";

/**
 * Tiny typed accessors over the next-intl message tree, for server
 * components that need list/array messages (getTranslations only returns
 * strings). Path is dot-separated, e.g. "About.paragraphs".
 */
function dig(messages: unknown, path: string): unknown {
  let current: unknown = messages;
  for (const key of path.split(".")) {
    current = (current as Record<string, unknown>)?.[key];
  }
  return current;
}

export async function getMessageList<T>(path: string): Promise<T[]> {
  const value = dig(await getMessages(), path);
  return Array.isArray(value) ? (value as T[]) : [];
}
