import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Message, MessageThread } from '@/types/message';
import { getEmails, markMessageAsRead, sendEmailReply, deleteThread, fetchNewEmails } from '@/lib/email';
import { useToast } from '@/hooks/use-toast';

interface MessageContextProps {
  threads: MessageThread[];
  activeThread: MessageThread | null;
  setActiveThread: (threadId: string) => void;
  sendReply: (threadId: string, content: string, attachments?: File[]) => Promise<void>;
  isLoading: boolean;
  refreshEmails: () => Promise<void>;
  deleteEmail: (threadId: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextProps | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const activeThread = activeThreadId 
    ? threads.find(thread => thread.id === activeThreadId) || null
    : null;

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const emailThreads = await getEmails();
      setThreads(emailThreads);
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast({
        title: "Error loading emails",
        description: "Could not load your emails. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch emails on component mount
  useEffect(() => {
    fetchEmails();
  }, []);

  const setActiveThread = (threadId: string) => {
    setActiveThreadId(threadId);
    
    // Mark as read in state
    setThreads(prevThreads => 
      prevThreads.map(thread => 
        thread.id === threadId ? { ...thread, read: true } : thread
      )
    );
    
    // Mark as read in storage
    markMessageAsRead(threadId);
  };

  const sendReply = async (threadId: string, content: string, attachments: File[] = []) => {
    if (!content.trim()) return;
    
    try {
      // Create attachment names array for optimistic UI update
      const attachmentNames = attachments.map(file => file.name);
      
      // Optimistically update the UI
      const newMessage: Message = {
        id: `temp-${Date.now()}`,
        content,
        timestamp: new Date().toISOString(),
        fromUser: true,
        attachments: attachmentNames,
      };

      setThreads(prevThreads =>
        prevThreads.map(thread =>
          thread.id === threadId
            ? { ...thread, messages: [...thread.messages, newMessage] }
            : thread
        )
      );
      
      // Update in storage
      const success = await sendEmailReply(threadId, content, attachments);
      
      if (!success) {
        toast({
          title: "Error sending reply",
          description: "Your message could not be sent. Please try again.",
          variant: "destructive",
        });
        
        // Revert the optimistic update
        setThreads(prevThreads =>
          prevThreads.map(thread =>
            thread.id === threadId
              ? { ...thread, messages: thread.messages.slice(0, -1) }
              : thread
          )
        );
      } else {
        toast({
          title: "Reply sent",
          description: `Your message has been sent successfully${attachments.length > 0 ? ' with attachments' : ''}.`,
        });
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error sending reply",
        description: "Your message could not be sent. Please try again.",
        variant: "destructive",
      });
    }
  };

  const refreshEmails = async () => {
    setIsLoading(true);
    try {
      // Fetch new emails from Gmail API
      const updatedEmails = await fetchNewEmails();
      setThreads(updatedEmails);
      
      toast({
        title: "Emails refreshed",
        description: "Your inbox has been updated with the latest emails from Gmail.",
      });
    } catch (error) {
      console.error('Error refreshing emails:', error);
      toast({
        title: "Error refreshing emails",
        description: "Could not fetch new emails from Gmail. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEmail = async (threadId: string) => {
    try {
      // Optimistically update UI
      setThreads(prevThreads => 
        prevThreads.filter(thread => thread.id !== threadId)
      );
      
      // Clear active thread if it's the one being deleted
      if (activeThreadId === threadId) {
        setActiveThreadId(null);
      }
      
      // Delete from storage
      const success = await deleteThread(threadId);
      
      if (!success) {
        // Revert if failed
        toast({
          title: "Error deleting email",
          description: "The email could not be deleted. Please try again.",
          variant: "destructive",
        });
        await fetchEmails(); // Reload original data
      } else {
        toast({
          title: "Email deleted",
          description: "The email has been deleted successfully.",
        });
      }
    } catch (error) {
      console.error('Error deleting email:', error);
      toast({
        title: "Error deleting email",
        description: "The email could not be deleted. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <MessageContext.Provider value={{ 
      threads, 
      activeThread, 
      setActiveThread, 
      sendReply,
      isLoading,
      refreshEmails,
      deleteEmail
    }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};