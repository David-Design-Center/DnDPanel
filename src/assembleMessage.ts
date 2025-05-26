import { getMessage } from './gmailClient';
import { buildMimeTree } from './mimeTree';
import { selectBestPart } from './selectBody';
import { decodeContent } from './decode';
import { sanitize } from './sanitiseHtml';
import { htmlToPlain } from './htmlToPlain';
import { makeSnippet } from './snippet';
import { decodeSubject } from './decodeHeaders';
import { parseAddresses } from './addresses';

/**
 * Final assembled message format
 */
export interface AssembledMessage {
  id: string;
  subject: string;
  from: Array<{ name: string; email: string }>;
  to: Array<{ name: string; email: string }>;
  date: string;
  html: string;
  plain: string;
  snippet: string;
}

/**
 * Assemble a message by ID, fetching raw, parsing MIME, sanitizing and converting.
 */
export async function assemble(id: string): Promise<AssembledMessage> {
  // 1. Fetch raw RFC-5322 payload
  const msg = await getMessage(id, 'raw');
  if (!msg.raw) {
    throw new Error(`Message ${id} has no raw payload`);
  }

  // 2. Decode base64url raw string to UTF-8
  const rfc5322 = Buffer.from(msg.raw, 'base64url').toString('utf-8');

  // 3. Build MIME tree
  const root = await buildMimeTree(rfc5322);

  // 4. Extract headers
  const subjectRaw = root.headers['Subject'] || 'No subject';
  const fromRaw = root.headers['From'] || '';
  const toRaw = root.headers['To'] || '';
  const dateRaw = root.headers['Date'] || '';

  // 5. Decode headers
  const subject = decodeSubject(subjectRaw);
  const from = await parseAddresses(fromRaw);
  const to = await parseAddresses(toRaw);
  const date = new Date(dateRaw).toISOString();

  // 6. Select best body part
  const part = selectBestPart(root);
  const rawContent = part ? await decodeContent(part) : '';

  // 7. Sanitize HTML (if html, else wrap text)
  const html = sanitize(part && part.mimeType === 'text/html' ? rawContent : `<pre>${rawContent}</pre>`);

  // 8. Convert to plain text
  const plain = htmlToPlain(html);

  // 9. Generate snippet
  const snippet = makeSnippet(plain);

  return { id, subject, from, to, date, html, plain, snippet };
}
