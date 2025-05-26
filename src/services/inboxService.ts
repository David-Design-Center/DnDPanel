import type { MessageThread, Message } from '@/types/message';

/**
 * Fetch and assemble Gmail threads using modular pipeline.
 * @param count Maximum number of messages to fetch
 */
export async function fetchThreads(count = 20): Promise<MessageThread[]> {
  try {
    const response = await fetch(`/.netlify/functions/fetchMessages?maxResults=${count}`);
    if (!response.ok) {
      console.error('Failed to fetch threads:', response.statusText);
      return [];
    }
    // Array of { id, threadId, subject, from, snippet }
    const items: Array<{ id: string; threadId: string; subject: string; from: string; snippet: string }> = await response.json();

    // Group by threadId
    const threadMap = new Map<string, typeof items>();
    items.forEach(item => {
      if (!threadMap.has(item.threadId)) threadMap.set(item.threadId, []);
      threadMap.get(item.threadId)!.push(item);
    });

    const threads: MessageThread[] = [];
    for (const [threadId, msgs] of threadMap) {
      // Sort by inferred order (assuming order in array)
      const messages: Message[] = msgs.map(m => ({
        id: m.id,
        content: m.snippet,
        timestamp: '', // server does not return timestamp, could fetch detail if needed
        fromUser: false,
        attachments: []
      }));
      threads.push({
        id: threadId,
        sender: msgs[0].from,
        subject: msgs[0].subject,
        read: false,
        messages
      });
    }
    return threads;
  } catch (error: any) {
    console.error('Error fetching threads:', error);
    return [];
  }
}
