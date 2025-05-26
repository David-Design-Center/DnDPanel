/**
 * Prefix external image URLs with CDN/proxy and add no-cache token.
 */
export function proxify(srcUrl: string): string {
  const base = process.env.IMG_PROXY_BASE || 'https://cdn.example.com/proxy';
  const token = Date.now();
  const encoded = encodeURIComponent(srcUrl);
  return `${base}?url=${encoded}&_=${token}`;
}
