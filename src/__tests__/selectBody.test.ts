import { selectBestPart, MimeNode } from '../selectBody';

describe('selectBestPart', () => {
  it('picks html when available', () => {
    const tree: MimeNode = {
      mimeType: 'multipart/mixed',
      headers: {},
      parts: [
        { mimeType: 'text/plain', headers: {}, content: 'plain' },
        { mimeType: 'text/html', headers: {}, content: '<p>html</p>' }
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
        { mimeType: 'text/plain', headers: {}, content: 'plain1' },
        { mimeType: 'text/plain', headers: {}, content: 'plain2' }
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
            { mimeType: 'text/plain', headers: {}, content: 'plain' }
          ]
        }
      ]
    };
    const best = selectBestPart(tree);
    expect(best).not.toBeNull();
    expect(best!.mimeType).toBe('text/plain');
  });

  it('returns null on no body', () => {
    const tree: MimeNode = { mimeType: 'application/octet-stream', headers: {} };
    expect(selectBestPart(tree)).toBeNull();
  });
});
