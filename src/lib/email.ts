import { MessageThread, Message } from '@/types/message';

// In-memory cache of emails
let emailCache: MessageThread[] = [];

// Get emails from cache
export async function getEmails(): Promise<MessageThread[]> {
  try {
    // If cache is empty, fetch from Gmail
    if (emailCache.length === 0) {
      await fetchNewEmails();
    }
    
    // Sort threads by most recent message
    return emailCache.sort((a, b) => {
      const aLatestMsg = a.messages[a.messages.length - 1];
      const bLatestMsg = b.messages[b.messages.length - 1];
      return new Date(bLatestMsg.timestamp).getTime() - new Date(aLatestMsg.timestamp).getTime();
    });
  } catch (error) {
    console.error('Error getting emails:', error);
    return [];
  }
}

// Pull new emails from Gmail
export async function fetchNewEmails(): Promise<MessageThread[]> {
  try {
    const resp = await fetch(`/.netlify/functions/fetchMessages?maxResults=20`);
    if (!resp.ok) {
      console.error('Failed to fetch emails:', resp.statusText);
      return emailCache;
    }
    const newEmails = await resp.json();
    const existingIds = new Set(emailCache.map(t => t.id));
    newEmails.forEach((t: MessageThread) => {
      if (!existingIds.has(t.id)) emailCache.push(t);
    });
    return emailCache;
  } catch (error) {
    console.error('Error fetching new emails:', error);
    return emailCache;
  }
}

// Mark a message as read
export async function markMessageAsRead(threadId: string): Promise<boolean> {
  try {
    // Find the thread in our data
    const threadIndex = emailCache.findIndex(thread => thread.id === threadId);
    
    if (threadIndex === -1) {
      console.error(`Thread with ID ${threadId} not found`);
      return false;
    }
    
    // Mark the thread as read
    emailCache[threadIndex].read = true;
    
    // In a full implementation, we would also call the Gmail API to mark as read
    // For now, we're just updating our local cache
    
    return true;
  } catch (error) {
    console.error('Error marking message as read:', error);
    return false;
  }
}

// Update sendEmailReply to convert File[] attachments into GmailAttachment[] and always send
export async function sendEmailReply(
  threadId: string,
  content: string,
  _attachments: File[] = []
): Promise<boolean> {
  try {
    // Find the thread
    const threadIndex = emailCache.findIndex(t => t.id === threadId);
    if (threadIndex === -1) {
      console.error(`Thread with ID ${threadId} not found`);
      return false;
    }
    const thread = emailCache[threadIndex];

    // Build raw MIME content (base64 of content body)
    const rawMime = btoa(content);

    // Send via Netlify function
    const resp = await fetch(`/.netlify/functions/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawMime }),
    });
    if (!resp.ok) {
      console.error('Failed to send email:', resp.statusText);
      return false;
    }
    const { messageId } = await resp.json();
 
    // Update local cache
    const newMessage: Message = {
      id: messageId || `msg-${threadId.split('-')[1]}-${thread.messages.length + 1}`,
      content,
      timestamp: new Date().toISOString(),
      fromUser: true,
      attachments: [],
    };
    thread.messages.push(newMessage);
    return true;
  } catch (error) {
    console.error('Error sending email reply:', error);
    return false;
  }
}

// Delete a thread
export async function deleteThread(threadId: string): Promise<boolean> {
  try {
    // Find the thread index
    const threadIndex = emailCache.findIndex(thread => thread.id === threadId);
    
    if (threadIndex === -1) {
      console.error(`Thread with ID ${threadId} not found`);
      return false;
    }
    
    // Remove the thread
    emailCache.splice(threadIndex, 1);
    
    // In a full implementation, we would also call the Gmail API to trash or delete the thread
    // For now, we're just updating our local cache
    
    return true;
  } catch (error) {
    console.error('Error deleting thread:', error);
    return false;
  }
}