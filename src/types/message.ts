export interface Message {
  id?: string;
  content: string;
  timestamp: string;
  fromUser: boolean;
  attachments?: string[];
}

export interface MessageThread {
  id: string;
  sender: string;
  subject: string;
  read: boolean;
  messages: Message[];
}