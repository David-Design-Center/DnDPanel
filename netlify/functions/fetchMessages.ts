import { Handler } from '@netlify/functions';
import { getGmailClient } from '../../src/lib/gmailClient';
import { withCorsAndAuth } from './_middleware';

const baseHandler: Handler = async (event, context) => {
  try {
    const params = event.queryStringParameters || {};
    const gmail = await getGmailClient();
    // Fetch single message
    if (params.id) {
      const format = (params.format as string) || 'full';
      const msgRes = await gmail.users.messages.get({ userId: 'me', id: params.id, format });
      return { statusCode: 200, body: JSON.stringify(msgRes.data) };
    }
    // List threads
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      ...(params.label && { labelIds: [params.label] }),
      ...(params.maxResults && { maxResults: Number(params.maxResults) }),
    });
    const messages = listRes.data.messages || [];
    // Fetch details
    const detailed = await Promise.all(
      messages.map(m =>
        gmail.users.messages.get({ userId: 'me', id: m.id!, format: 'full' })
      )
    );
    const result = detailed.map(res => {
      const msg = res.data;
      const hdrs = msg.payload?.headers || [];
      return {
        id: msg.id,
        subject: hdrs.find(h => h.name === 'Subject')?.value || '',
        from: hdrs.find(h => h.name === 'From')?.value || '',
        snippet: msg.snippet,
      };
    });
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error: any) {
    console.error('Error in fetchMessages:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

export const handler = withCorsAndAuth(baseHandler);
