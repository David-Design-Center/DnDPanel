/**
 * Generate a short snippet from plain text.
 * - Remove "> " quote prefixes
 * - Remove signature (-- and after)
 * - Collapse whitespace
 * - Truncate to 100 chars on word boundary
 */
export function makeSnippet(plain: string): string {
  // Remove quote prefixes
  let text = plain.replace(/^> /gm, '');
  // Remove signature delimiters
  text = text.split(/^--$/m)[0];
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();
  // Truncate
  if (text.length <= 100) return text;
  const idx = text.lastIndexOf(' ', 100);
  return text.slice(0, idx > 0 ? idx : 100) + '…';
}
