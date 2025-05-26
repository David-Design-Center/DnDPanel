import { google } from 'googleapis';
import type { gmail_v1 } from 'googleapis';

/**
 * Returns an authenticated Gmail client using OAuth2 credentials from environment variables.
 * Automatically refreshes tokens using the provided refresh token.
 */
export async function getGmailClient(): Promise<gmail_v1.Gmail> {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Gmail OAuth2 environment variables');
  }

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  return google.gmail({ version: 'v1', auth: oAuth2Client });
}
