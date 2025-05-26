// TypeScript declaration for html-to-text
// Allows importing html-to-text without type errors

declare module 'html-to-text' {
  export interface HtmlToTextOptions {
    wordwrap?: boolean | number;
    selectors?: Array<{ selector: string; options?: any }>;
    [key: string]: any;
  }

  /**
   * Converts HTML to plain text according to the provided options.
   * @param html HTML string to convert
   * @param options Configuration options
   */
  export function htmlToText(html: string, options?: HtmlToTextOptions): string;
}
