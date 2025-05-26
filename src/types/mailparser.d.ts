// Auto-generated ambient module declaration for mailparser
// Allows TypeScript to import 'mailparser' without type errors

declare module 'mailparser' {
  import type { Stream } from 'stream';

  export interface AddressObject {
    value: Array<{ address: string; name: string }>;
  }

  export interface ParsedMail {
    mimeType?: string;
    headers: Map<string, string | string[]>;
    html?: string;
    text?: string;
    from?: AddressObject;
  }

  /**
   * Parses a raw RFC-5322 email into structured parts.
   * @param input Raw email as string or Buffer
   */
  export function simpleParser(
    input: string | Buffer | Stream
  ): Promise<ParsedMail>;
}
