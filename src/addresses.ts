import { simpleParser } from 'mailparser';

/**
 * Parse an address header into an array of { name, email }.
 * @param headerStr full address header string
 */
export async function parseAddresses(headerStr: string): Promise<Array<{ name: string; email: string }>> {
  // Use mailparser to parse a minimal header block
  const parsed = await simpleParser(`From: ${headerStr}\r\n\r\n`);
  if (!parsed.from || !parsed.from.value) return [];

  return parsed.from.value.map(addr => ({
    name: addr.name || '',
    email: addr.address
  }));
}
