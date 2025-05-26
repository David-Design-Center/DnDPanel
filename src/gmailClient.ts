// GmailClient only works in SSR (Node). Dynamic import ensures Vite won't bundle node-only libs.

/**
 * Fetches a Gmail message by ID in either 'full' or 'raw' format. SSR-only.
 */
export async function getMessage(
  id: string,
  format: 'full' | 'raw' = 'full'
): Promise<any> {
  const response = await fetch(`/.netlify/functions/fetchMessages?id=${id}&format=${format}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch message with ID ${id}`);
  }
  return response.json();
}

export async function getGmailClient(): Promise<void> {
  throw new Error('getGmailClient is only available server-side');
}
