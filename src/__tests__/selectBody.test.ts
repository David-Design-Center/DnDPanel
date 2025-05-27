import { selectBestPart, MimeNode } from '../selectBody';

describe('selectBestPart', () => {
  it('picks html when available', () => {
    const tree: MimeNode = {
      mimeType: 'multipart/mixed',
      headers: {},
      parts: [
        { mimeType: 'text/plain', headers: {}, content: 'plain', parts: [] },
        { mimeType: 'text/html', headers: {}, content: '<p>html</p>', parts: [] }
      ]
    };
    const best = selectBestPart(tree);
    expect(best).toBe(tree.parts![1]);
  });

  it('picks first plain when no html', () => {
    const tree: MimeNode = {
      mimeType: 'multipart/alternative',
      headers: {},
      parts: [
        { mimeType: 'text/plain', headers: {}, content: 'plain1', parts: [] },
        { mimeType: 'text/plain', headers: {}, content: 'plain2', parts: [] }
      ]
    };
    const best = selectBestPart(tree);
    expect(best).toBe(tree.parts![0]);
  });

  it('handles nested parts', () => {
    const tree: MimeNode = {
      mimeType: 'multipart/mixed',
      headers: {},
      parts: [
        {
          mimeType: 'multipart/alternative',
          headers: {},
          parts: [
            { mimeType: 'text/plain', headers: {}, content: 'plain', parts: [] }
          ]
        }
      ]
    };
    const best = selectBestPart(tree);
    expect(best).not.toBeNull();
    expect(best!.mimeType).toBe('text/plain');
  });

  it('returns null on no body', () => {
    const tree: MimeNode = { mimeType: 'application/octet-stream', headers: {}, parts: [] };
    expect(selectBestPart(tree)).toBeNull();
  });
});
