import { simpleParser, ParsedMail } from 'mailparser';

export interface MimeNode {
  mimeType: string;
  headers: Record<string, string>;
  content?: string;
  parts: MimeNode[];
}

/**
 * Build a MIME tree from raw RFC-5322 string using mailparser.
 */
export async function buildMimeTree(raw: string): Promise<MimeNode> {
  const parsed: ParsedMail = await simpleParser(raw);

  // Convert headers Map to object
  const headers: Record<string, string> = {};
  for (const [key, value] of parsed.headers) {
    headers[key] = Array.isArray(value) ? value.join('; ') : String(value);
  }

  const root: MimeNode = {
    mimeType: parsed.mimeType || 'multipart/alternative',
    headers,
    parts: []
  };

  // Add HTML part if present
  if (parsed.html) {
    root.parts.push({
      mimeType: 'text/html',
      headers: {},
      content: parsed.html,
      parts: []
    });
  }
  // Add plain text part if present
  if (parsed.text) {
    root.parts.push({
      mimeType: 'text/plain',
      headers: {},
      content: parsed.text,
      parts: []
    });
  }

  return root;
}
