import { Message } from '@/types/message';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Paperclip } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ThreadViewProps {
  messages: Message[];
  sender?: string;
}

export default function ThreadView({ messages, sender = 'Sender' }: ThreadViewProps) {
  return (
    <div className="flex flex-col gap-6 p-4 max-w-full">
      {messages.map((message, index) => (
        <div 
          key={message.id || index} 
          className={`flex flex-col rounded-lg p-4 shadow-sm max-w-[85%] ${
            message.fromUser 
              ? 'self-end bg-blue-50 border border-blue-100' 
              : 'self-start bg-white border border-gray-100'
          }`}
        >
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{message.fromUser ? 'YO' : sender[0]?.toUpperCase() || 'S'}</AvatarFallback>
              </Avatar>
              <span className="font-medium">
                {message.fromUser ? 'You' : sender}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {format(new Date(message.timestamp), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
          
          <div 
            className="text-sm whitespace-pre-wrap overflow-auto break-words max-w-full"
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <h4 className="text-sm font-medium mb-2">Attachments</h4>
              <div className="flex flex-wrap gap-2">
                {message.attachments.map((att, i) => (
                  <Badge key={i} variant="outline" className="flex items-center gap-1.5 pl-2 pr-3 py-1.5 bg-gray-50">
                    <Paperclip className="h-3.5 w-3.5" />
                    <span className="text-xs">{att}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
