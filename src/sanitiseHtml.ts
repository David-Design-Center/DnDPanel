import DOMPurify from 'dompurify';

/**
 * Sanitize HTML by removing scripts, event handlers and dangerous URLs.
 * @param html raw HTML string
 * @returns sanitized HTML
 */
export function sanitize(html: string): string {
  return DOMPurify.sanitize(html, {
    FORBID_TAGS: ['script'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onpointerdown'],
    ALLOWED_URI_REGEXP: /^(https?|mailto|tel|data:image\/)\/i/
  });
}
