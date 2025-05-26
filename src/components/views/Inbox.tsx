import { useState, useRef, useEffect } from 'react';
import { useMessages } from '@/context/MessageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Avatar, 
  AvatarFallback
} from '@/components/ui/avatar';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Search, 
  Paperclip, 
  Send, 
  Trash2, 
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Loader2,
  X,
  File
} from 'lucide-react';

// Define attachment interface for pending attachments
interface PendingAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB maximum file size

// Define allowed MIME types
const ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  
  // Images
  'image/jpeg', 'image/png', 'image/jpg',
];

// Define allowed file extensions (lowercase)
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg'];

const Inbox = () => {
  const { threads, activeThread, setActiveThread, sendReply, isLoading, refreshEmails, deleteEmail } = useMessages();
  const [replyMessage, setReplyMessage] = useState('');
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({});
  const [selectedThreads, setSelectedThreads] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for pending attachments
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  
  // State for pagination
  const [visibleEmailCount, setVisibleEmailCount] = useState(20);
  const EMAILS_PER_LOAD = 20;
  
  // Sort threads by most recent message first
  const sortedThreads = [...threads].sort((a, b) => {
    const aDate = new Date(a.messages[a.messages.length - 1].timestamp);
    const bDate = new Date(b.messages[b.messages.length - 1].timestamp);
    return bDate.getTime() - aDate.getTime();
  });
  
  // Filter threads based on search
  const filteredThreads = searchTerm 
    ? sortedThreads.filter(thread => 
        thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.messages.some(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : sortedThreads;
  
  // Apply pagination - only show the first N emails
  const visibleThreads = filteredThreads.slice(0, visibleEmailCount);
  const hasMoreEmails = filteredThreads.length > visibleEmailCount;
  
  // Debug logging
  console.log('Debug pagination:', {
    totalThreads: threads.length,
    filteredThreads: filteredThreads.length,
    visibleEmailCount,
    visibleThreads: visibleThreads.length,
    hasMoreEmails,
    shouldShowButton: filteredThreads.length > visibleEmailCount
  });
  
  // Alert to check if button would be shown
  useEffect(() => {
    console.log('Show More Button should be visible:', hasMoreEmails);
    console.log('Button visibility condition check:', {
      filteredThreadsLength: filteredThreads.length,
      visibleEmailCount,
      condition: filteredThreads.length > visibleEmailCount
    });
    
    // Force a render check to verify button display
    const timeoutId = setTimeout(() => {
      console.log('Delayed check for button visibility:', {
        filteredThreadsLength: filteredThreads.length,
        visibleEmailCount,
        condition: filteredThreads.length > visibleEmailCount,
        buttonsFound: document.querySelectorAll('.flex-shrink-0.p-4.border-t button').length,
        paragraphsFound: document.querySelectorAll('.flex-shrink-0.p-4.border-t p').length
      });
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [hasMoreEmails, filteredThreads.length, visibleEmailCount]);
  
  // Function to load more emails
  const loadMoreEmails = () => {
    setVisibleEmailCount(prev => prev + EMAILS_PER_LOAD);
  };
  
  // Reset visible count when search term changes
  useEffect(() => {
    setVisibleEmailCount(20);
  }, [searchTerm]);
  
  const toggleMessageExpansion = (threadId: string, messageIndex: number) => {
    const key = `${threadId}-${messageIndex}`;
    setExpandedMessages(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const toggleThreadSelection = (threadId: string) => {
    if (selectedThreads.includes(threadId)) {
      setSelectedThreads(prev => prev.filter(id => id !== threadId));
    } else {
      setSelectedThreads(prev => [...prev, threadId]);
    }
  };
  
  const handleSendReply = async () => {
    if (replyMessage.trim() && activeThread) {
      setIsSendingReply(true);
      try {
        // Include attachments in the reply
        await sendReply(activeThread.id, replyMessage, pendingAttachments.map(att => att.file));
        setReplyMessage('');
        // Clear attachments after sending
        setPendingAttachments([]);
        setAttachmentError(null);
      } finally {
        setIsSendingReply(false);
      }
    }
  };

  const handleRefresh = async () => {
    await refreshEmails();
  };

  const handleDelete = async () => {
    if (threadToDelete) {
      await deleteEmail(threadToDelete);
      setThreadToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const confirmDelete = (threadId: string) => {
    setThreadToDelete(threadId);
    setDeleteDialogOpen(true);
  };
  
  const handleFileButtonClick = () => {
    // Clear previous errors
    setAttachmentError(null);
    fileInputRef.current?.click();
  };
  
  // Helper to check if a file type is allowed
  const isFileTypeAllowed = (file: File): boolean => {
    // First check MIME type (most reliable)
    if (ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return true;
    }
    
    // If MIME type check fails, check file extension
    const fileName = file.name.toLowerCase();
    return ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  };
  
  // New function to handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    // Validate and add files
    let errorFound = false;
    const newAttachments: PendingAttachment[] = [];
    
    Array.from(files).forEach(file => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setAttachmentError(`File "${file.name}" exceeds the maximum size limit of 25MB`);
        errorFound = true;
        return;
      }
      
      // Check file type with improved detection
      if (!isFileTypeAllowed(file)) {
        // More detailed error message for debugging
        setAttachmentError(`File type not supported: "${file.name}" (${file.type || 'unknown type'}). Supported types: PDF, DOCX, PNG, JPG, JPEG`);
        errorFound = true;
        return;
      }
      
      // Add to pending attachments
      newAttachments.push({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      });
    });
    
    if (!errorFound) {
      setPendingAttachments(prev => [...prev, ...newAttachments]);
    }
    
    // Clear the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Function to remove an attachment
  const removeAttachment = (id: string) => {
    setPendingAttachments(prev => prev.filter(att => att.id !== id));
  };
  
  // Helper to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  const cleanEmailText = (text: string) => {
    return text.replace(/[<>]/g, '');
  };

  const isThreadSelected = (threadId: string) => selectedThreads.includes(threadId);
  const isMessageExpanded = (threadId: string, messageIndex: number) => !!expandedMessages[`${threadId}-${messageIndex}`];

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-3xl font-semibold mb-1">Inbox</h1>
      </div>
      
      {/* Main Container - Fixed width and height */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Main Layout Container - Fixed Height and Width */}
        <div 
          className="flex-1 flex flex-col overflow-hidden border border-border rounded-md w-full"
          style={{ 
            height: 'calc(100vh - 180px)',
            maxHeight: 'calc(100vh - 180px)'
          }}
        >
          {/* Toolbar - Fixed Height */}
          <div className="flex-shrink-0 bg-muted/30 p-2 border-b border-border flex items-center gap-2">
            {/* Custom checkbox styled as in the image */}
            <div className="h-5 w-5 border border-gray-300 rounded flex items-center justify-center bg-white flex-shrink-0">
              {selectedThreads.length > 0 && selectedThreads.length === threads.length && (
                <div className="h-2 w-2 bg-black rounded-sm"></div>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              disabled={selectedThreads.length === 0}
              onClick={() => {
                if (selectedThreads.length > 0) {
                  confirmDelete(selectedThreads[0]);
                }
              }}
              className="flex-shrink-0"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            
            <Separator orientation="vertical" className="h-6 mx-1 flex-shrink-0" />
            
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                className="pl-8 h-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 flex-shrink-0"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
          
          {/* Content Area - FIXED DIMENSIONS with Flexbox */}
          <div className="flex-1 flex overflow-hidden w-full">
            {/* Email List - Fixed Width 280px */}
            <div className="flex-shrink-0 w-[280px] border-r border-border overflow-hidden flex flex-col">
              {isLoading && filteredThreads.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading emails...</p>
                  </div>
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <p className="text-muted-foreground">No emails found</p>
                  {searchTerm && (
                    <Button variant="outline" size="sm" onClick={() => setSearchTerm('')} className="mt-2">
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  {/* Scrollable email list */}
                  <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="divide-y divide-border">
                        {visibleThreads.map(thread => {
                          const latestMessage = thread.messages[thread.messages.length - 1];
                          const messageDate = new Date(latestMessage.timestamp);
                          const isToday = new Date().toDateString() === messageDate.toDateString();
                          
                          return (
                            <div 
                              key={thread.id}
                              className={`hover:bg-muted/50 transition-colors ${activeThread?.id === thread.id ? 'bg-muted' : ''}`}
                            >
                              <div 
                                className="p-3 cursor-pointer"
                                onClick={() => setActiveThread(thread.id)}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Custom checkbox */}
                                  <div className="pt-1 flex-shrink-0">
                                    <div
                                      className="h-5 w-5 border border-gray-300 rounded flex items-center justify-center bg-white cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleThreadSelection(thread.id);
                                      }}
                                    >
                                      {isThreadSelected(thread.id) && (
                                        <div className="h-2 w-2 bg-black rounded-sm"></div>
                                      )}
                                    </div>
                                   </div>
                                  
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="font-medium truncate flex-1 flex items-center gap-1">
                                        {!thread.read && (
                                          <div className="h-2 w-2 rounded-full bg-blue-500 mr-1 flex-shrink-0"></div>
                                        )}
                                        {thread.sender}
                                      </div>
                                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                                        {isToday 
                                          ? format(messageDate, 'h:mm a')
                                          : format(messageDate, 'MMM d')
                                        }
                                      </div>
                                    </div>
                                    
                                    <div className="font-medium text-sm mb-0.5 truncate">
                                      {thread.subject}
                                    </div>
                                    
                                    <div className="text-xs text-muted-foreground truncate">
                                      {cleanEmailText(latestMessage.content).substring(0, 100)}
                                      {latestMessage.content.length > 100 ? '...' : ''}
                                    </div>
                                   </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  {/* Load More Button - Positioned outside of ScrollArea */}
                  <div className="flex-shrink-0 p-4 border-t border-border mt-auto">
                    {filteredThreads.length > visibleEmailCount ? (
                      <Button 
                        variant="default" 
                        onClick={loadMoreEmails}
                        className="w-full border border-border bg-blue-50 hover:bg-blue-100 text-blue-700"
                        size="sm"
                      >
                        Load More ({filteredThreads.length - visibleEmailCount} emails)
                      </Button>
                    ) : (
                      <p className="text-xs text-center text-muted-foreground">
                        {filteredThreads.length > 0 ? `All ${filteredThreads.length} emails loaded` : 'No emails to load'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Email Content Area - Fixed width and overflow handling */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 max-w-full w-[calc(100%-280px)]">
              {isLoading && !activeThread ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading emails...</p>
                  </div>
                </div>
              ) : !activeThread ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center max-w-md text-center">
                    <h3 className="text-xl font-medium mb-2">No message selected</h3>
                    <p>Select a conversation from the list to view messages and reply</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Email thread header - Fixed Height */}
                  <div className="flex-shrink-0 p-4 border-b border-border">
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="text-xl font-medium truncate max-w-[calc(100%-100px)]">{activeThread.subject}</h2>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => confirmDelete(activeThread.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="ml-1">Delete</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {activeThread.messages.length} messages
                      </Badge>
                      <span>•</span>
                      <span>
                        Started {formatDistanceToNow(new Date(activeThread.messages[0].timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Email messages container - Scrollable with fixed width */}
                  <ScrollArea className="flex-1 w-full">
                    <div className="p-4 space-y-4">
                      {activeThread.messages.map((message, index) => {
                        const isLast = index === activeThread.messages.length - 1;
                        const isExpanded = isMessageExpanded(activeThread.id, index) || isLast;
                        const timestamp = new Date(message.timestamp);
                        
                        return (
                          <Collapsible 
                            key={index} 
                            open={isExpanded}
                            className="w-full max-w-full"
                          >
                            <div className={`border ${isExpanded ? 'rounded-md' : 'rounded-t-md'} border-border w-full`}>
                              <div className="flex items-center gap-3 p-3 bg-accent/30">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  <AvatarFallback>{message.fromUser ? 'YO' : activeThread.sender[0]}</AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1 min-w-0 overflow-hidden">
                                  <div className="flex items-center justify-between">
                                    <div className="font-medium truncate">
                                      {message.fromUser ? 'You' : activeThread.sender}
                                    </div>
                                    <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                      {format(timestamp, 'MMM d, yyyy h:mm a')}
                                    </div>
                                  </div>
                                  
                                  {!isExpanded && (
                                    <div className="text-sm text-muted-foreground truncate">
                                      {cleanEmailText(message.content).substring(0, 120)}...
                                    </div>
                                  )}
                                </div>
                                
                                <CollapsibleTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="p-1 h-auto flex-shrink-0"
                                    onClick={() => toggleMessageExpansion(activeThread.id, index)}
                                  >
                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                  </Button>
                                </CollapsibleTrigger>
                              </div>
                              
                              <CollapsibleContent className="w-full max-w-full overflow-hidden">
                                <div className="p-4 text-sm whitespace-pre-wrap overflow-auto max-w-full">
                                  <div className="mb-4 break-words max-w-full overflow-hidden overflow-wrap-anywhere">
                                    {cleanEmailText(message.content)}
                                  </div>
                                  
                                  {message.attachments && message.attachments.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-border">
                                      <p className="text-xs font-medium mb-2">Attachments</p>
                                      <div className="space-y-2">
                                        {message.attachments.map((attachment: any, i: number) => (
                                          <div key={i} className="flex items-center gap-2 text-xs text-primary bg-muted/50 rounded-md px-3 py-2">
                                            <Paperclip className="h-3 w-3 flex-shrink-0" />
                                            <span className="flex-1 truncate">
                                              {attachment.name}
                                            </span>
                                            <Button size="sm" onClick={() => {
                                              console.log('View button clicked - TEST. Attachment object:', attachment); 
                                              if (attachment.mimeType && attachment.contentBase64) {
                                                // Convert base64url to base64 for browser compatibility
                                                let base64 = attachment.contentBase64.replace(/-/g, '+').replace(/_/g, '/');
                                                const padding = '='.repeat((4 - base64.length % 4) % 4);
                                                base64 += padding;
                                                
                                                const byteCharacters = atob(base64);
                                                const byteNumbers = new Array(byteCharacters.length);
                                                for (let j = 0; j < byteCharacters.length; j++) {
                                                  byteNumbers[j] = byteCharacters.charCodeAt(j);
                                                }
                                                const byteArray = new Uint8Array(byteNumbers);
                                                const blob = new Blob([byteArray], { type: attachment.mimeType });
                                                const url = URL.createObjectURL(blob);
                                                window.open(url, '_blank');
                                              } else {
                                                console.error('Cannot preview attachment: mimeType or contentBase64 is missing.', attachment);
                                              }
                                            }}>
                                              View
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  
                  {/* Reply form - Fixed height */}
                  <div className="flex-shrink-0 p-4 border-t border-border w-full">
                    <div className="mb-2 text-sm font-medium">Reply to thread</div>
                    
                    {/* Attachment error message */}
                    {attachmentError && (
                      <div className="mb-3 p-2 bg-destructive/10 text-destructive rounded-md text-sm flex items-center justify-between">
                        <div>{attachmentError}</div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setAttachmentError(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    {/* Pending attachments display */}
                    {pendingAttachments.length > 0 && (
                      <div className="mb-3 p-3 border border-border rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium">Attachments ({pendingAttachments.length})</h4>
                        </div>
                        <div className="space-y-2">
                          {pendingAttachments.map(attachment => (
                            <div key={attachment.id} className="flex items-center justify-between text-sm bg-muted/30 rounded p-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <File className="h-4 w-4 text-primary flex-shrink-0" />
                                <span className="truncate flex-1">{attachment.name}</span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatFileSize(attachment.size)}
                                </span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 ml-2"
                                onClick={() => removeAttachment(attachment.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Textarea 
                      placeholder="Type your reply here..."
                      className="mb-3 resize-none w-full"
                      rows={3}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                    />
                    <div className="flex justify-between w-full">
                      <div>
                        <input 
                          type="file" 
                          className="hidden" 
                          ref={fileInputRef}
                          multiple
                          onChange={handleFileChange}
                          accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleFileButtonClick}
                        >
                          <Paperclip className="h-4 w-4 mr-2" />
                          Attach Files
                        </Button>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={handleSendReply} 
                        disabled={!replyMessage.trim() || isSendingReply}
                      >
                        {isSendingReply ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Reply
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Email</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this email thread? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <style>{`
        /* Make sure text breaks properly within collapsible content */
        .overflow-wrap-anywhere {
 
          overflow-wrap: anywhere;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
};

export default Inbox;