import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { LoaderCircle, Send, Sparkles, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmailComposer = () => {
  const { toast } = useToast();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [template, setTemplate] = useState('custom');
  
  const handleGenerateWithAI = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      let generatedText = '';
      
      if (template === 'follow-up') {
        generatedText = `Dear Client,

Thank you for your recent purchase. I wanted to follow up and ensure that everything is to your satisfaction. 

If you have any questions or concerns regarding your order, please don't hesitate to reach out. We're always here to help.

Best regards,
Your Name
D&D Panel Team`;
      } else if (template === 'thank-you') {
        generatedText = `Dear Client,

I wanted to take a moment to express our sincere gratitude for your recent purchase. Your support means a lot to us.

We're committed to providing you with the best possible service and products. If there's anything we can assist you with, please let us know.

Thank you again for your business!

Best regards,
Your Name
D&D Panel Team`;
      } else if (template === 'invoice') {
        generatedText = `Dear Client,

Please find attached the invoice for your recent order. 

Invoice Number: INV-12345
Order Number: ORD-6789
Amount Due: $345.00
Due Date: November 15, 2025

Payment can be made via bank transfer or credit card through our secure payment portal.

If you have any questions regarding this invoice, please don't hesitate to contact us.

Best regards,
Your Name
D&D Panel Team`;
      }
      
      setMessage(generatedText);
      setIsGenerating(false);
      
      toast({
        title: "Email content generated",
        description: "AI-generated content has been added to your email.",
      });
    }, 1500);
  };
  
  const handleSendEmail = () => {
    if (!to || !subject || !message) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields before sending.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Email sent successfully",
      description: `Your email to ${to} has been sent.`,
    });
    
    // Reset form
    setTo('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-1">Email Composer</h1>
        <p className="text-muted-foreground">Craft professional emails with AI assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Compose Email</CardTitle>
            <CardDescription>Create a new email to send to your clients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-to">To</Label>
              <Input 
                id="email-to" 
                placeholder="recipient@example.com" 
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input 
                id="email-subject" 
                placeholder="Enter email subject" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-body">Message</Label>
              <Textarea 
                id="email-body" 
                placeholder="Write your message here..." 
                className="min-h-[200px] resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4 mr-2" />
                Attach Files
              </Button>
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={handleGenerateWithAI}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>
              <Button onClick={handleSendEmail}>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </div>
          </CardFooter>
        </Card>

        <div className="lg:col-span-2">
          <Tabs defaultValue="templates">
            <TabsList className="w-full mb-4">
              <TabsTrigger className="flex-1" value="templates">Templates</TabsTrigger>
              <TabsTrigger className="flex-1" value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="mt-0 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>Use pre-built templates to save time</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-select">Select Template</Label>
                    <Select value={template} onValueChange={setTemplate}>
                      <SelectTrigger id="template-select">
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom Message</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="thank-you">Thank You</SelectItem>
                        <SelectItem value="invoice">Invoice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-md bg-muted p-3">
                    <h3 className="text-sm font-medium mb-1">Template Preview</h3>
                    <p className="text-xs text-muted-foreground">
                      {template === 'custom' && "Start from scratch with a blank email."}
                      {template === 'follow-up' && "Check in with clients after a purchase to ensure satisfaction."}
                      {template === 'thank-you' && "Express gratitude to clients for their business."}
                      {template === 'invoice' && "Notify clients about an invoice with payment details."}
                    </p>
                  </div>

                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleGenerateWithAI}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate from Template
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Emails</CardTitle>
                  <CardDescription>Load from recently sent emails</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="rounded-md border border-border p-3 cursor-pointer hover:bg-muted transition-colors">
                    <p className="text-sm font-medium">Order confirmation for ORD-12345</p>
                    <p className="text-xs text-muted-foreground">To: client@example.com • Sent 2 days ago</p>
                  </div>
                  <div className="rounded-md border border-border p-3 cursor-pointer hover:bg-muted transition-colors">
                    <p className="text-sm font-medium">Invoice payment reminder</p>
                    <p className="text-xs text-muted-foreground">To: accounting@example.com • Sent 4 days ago</p>
                  </div>
                  <div className="rounded-md border border-border p-3 cursor-pointer hover:bg-muted transition-colors">
                    <p className="text-sm font-medium">Thank you for your order</p>
                    <p className="text-xs text-muted-foreground">To: newclient@example.com • Sent 1 week ago</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Email Settings</CardTitle>
                  <CardDescription>Customize your email preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Signature</Label>
                      <p className="text-sm text-muted-foreground">Include your signature automatically</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Delivery Receipt</Label>
                      <p className="text-sm text-muted-foreground">Request read receipts for your emails</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Save to Sent Folder</Label>
                      <p className="text-sm text-muted-foreground">Keep a copy of sent emails</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>AI Content Generation</Label>
                      <p className="text-sm text-muted-foreground">Use AI to help write your emails</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EmailComposer;