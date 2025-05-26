import type { MimeNode } from './mimeTree';

/**
 * Selects the best body part from a MIME tree.
 * Breadth-first search; prefers 'text/html' over 'text/plain'.
 * @param root Root MIME node
 * @returns The best MimeNode or null if none found
 */
export function selectBestPart(root: MimeNode): MimeNode | null {
  const queue: MimeNode[] = [root];
  let textPlain: MimeNode | null = null;

  while (queue.length) {
    const node = queue.shift()!;
    if (node.mimeType.toLowerCase() === 'text/html') {
      return node;
    }
    if (node.mimeType.toLowerCase() === 'text/plain' && !textPlain) {
      textPlain = node;
    }
    if (node.parts && node.parts.length > 0) {
      queue.push(...node.parts);
    }
  }

  return textPlain;
}
