import { Handler } from '@netlify/functions';
import { getGmailClient } from '../../src/lib/gmailClient';
import { withCorsAndAuth } from './_middleware';

const baseHandler: Handler = async (event, context) => {
  try {
    const { rawMime } = JSON.parse(event.body || '{}');
    if (!rawMime) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing rawMime in request body' }) };
    }
    const gmail = await getGmailClient();
    const sendRes = await gmail.users.messages.send({ userId: 'me', requestBody: { raw: rawMime } });
    const messageId = sendRes.data.id;
    return { statusCode: 200, body: JSON.stringify({ messageId }) };
  } catch (error: any) {
    console.error('Error in sendMessage:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

export const handler = withCorsAndAuth(baseHandler);
