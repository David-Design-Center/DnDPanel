import { htmlToText } from 'html-to-text';

/**
 * Convert HTML to plain text without word wrap.
 * @param html HTML string
 * @returns plaintext
 */
export function htmlToPlain(html: string): string {
  return htmlToText(html, {
    wordwrap: false,
    selectors: [
      { selector: 'a', options: { ignoreHref: true } }
    ]
  });
}
