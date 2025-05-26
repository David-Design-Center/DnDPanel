import type { MimeNode } from './mimeTree';

/**
 * Decode the content of a MIME node into a UTF-8 string.
 * Currently returns the raw content; adapt for base64 or quoted-printable as needed.
 */
export async function decodeContent(part: MimeNode): Promise<string> {
  return part.content || '';
}
