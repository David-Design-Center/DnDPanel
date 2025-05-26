import { decodeWords } from 'libmime';

/**
 * Decode RFC-2047 encoded header words to Unicode.
 * Unfold whitespace.
 */
export function decodeSubject(hdr: string): string {
  return decodeWords(hdr).replace(/\r?\n/g, ' ');
}

/**
 * Decode display name (possibly encoded).
 */
export function decodeDisplayName(str: string): string {
  return decodeWords(str);
}
