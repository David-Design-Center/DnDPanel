import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOrders } from '@/context/OrderContext';
import { useInvoices } from '@/context/InvoiceContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { FileDown, Printer, Send } from 'lucide-react';
import { Order } from '@/types/order';
import { useToast } from '@/hooks/use-toast';

const InvoiceCreator = () => {
  const { orders } = useOrders();
  const { createInvoice } = useInvoices();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const preselectedOrderId = searchParams.get('orderId');
  
  const [selectedOrderId, setSelectedOrderId] = useState(preselectedOrderId || '');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState(() => {
    return `INV-${Math.floor(10000 + Math.random() * 90000)}`;
  });
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return format(date, 'yyyy-MM-dd');
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (selectedOrderId) {
      const order = orders.find(o => o.id === selectedOrderId);
      setSelectedOrder(order || null);
    } else {
      setSelectedOrder(null);
    }
  }, [selectedOrderId, orders]);

  // Calculate totals
  const subtotal = selectedOrder 
    ? selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) 
    : 0;
  const taxRate = 0.1; // 10%
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const handleGeneratePDF = async () => {
    if (!selectedOrder) {
      toast({
        title: "No order selected",
        description: "Please select an order to create an invoice",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create invoice in Supabase
      await createInvoice({
        orderId: selectedOrder.id,
        invoiceDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate,
        subTotal: subtotal,
        tax: taxAmount,
        payments: [],
        customerName: selectedOrder.clientName
      });

      toast({
        title: "Invoice created",
        description: `Invoice ${invoiceNumber} has been created for ${selectedOrder.clientName}`,
      });

      // Reset form or update UI as needed
      setInvoiceNumber(`INV-${Math.floor(10000 + Math.random() * 90000)}`);
      
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error creating invoice",
        description: "There was a problem creating the invoice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-1">Invoice Creator</h1>
        <p className="text-muted-foreground">Generate invoices from existing orders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>Select an order and customize your invoice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order-select">Order</Label>
                  <Select 
                    value={selectedOrderId} 
                    onValueChange={(value) => setSelectedOrderId(value)}
                  >
                    <SelectTrigger id="order-select">
                      <SelectValue placeholder="Select an order" />
                    </SelectTrigger>
                    <SelectContent>
                      {orders.map(order => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.id} - {order.clientName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice-number">Invoice Number</Label>
                  <Input 
                    id="invoice-number" 
                    value={invoiceNumber} 
                    onChange={(e) => setInvoiceNumber(e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice-date">Invoice Date</Label>
                  <Input 
                    id="invoice-date" 
                    type="date" 
                    value={format(new Date(), 'yyyy-MM-dd')} 
                    readOnly 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input 
                    id="due-date" 
                    type="date" 
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)} 
                  />
                </div>
              </div>

              <Separator />

              {selectedOrder ? (
                <>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Bill To:</h3>
                      <p className="text-sm">{selectedOrder.clientName}</p>
                      <p className="text-sm text-muted-foreground">123 Client Street</p>
                      <p className="text-sm text-muted-foreground">City, State, 12345</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">From:</h3>
                      <p className="text-sm">D&D Design Center</p>
                      <p className="text-sm text-muted-foreground">123 Business Avenue</p>
                      <p className="text-sm text-muted-foreground">City, State, 12345</p>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="space-y-2 ml-auto w-full max-w-[240px] text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (10%):</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Label htmlFor="notes">Notes</Label>
                    <Input 
                      id="notes" 
                      placeholder="e.g., Thank you for your business!" 
                    />
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  Select an order to create an invoice
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <Button variant="outline">Reset</Button>
              <div className="space-x-2">
                <Button variant="outline" disabled={!selectedOrder}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button 
                  disabled={!selectedOrder || isSubmitting} 
                  onClick={handleGeneratePDF}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Creating...' : 'Generate Invoice'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="preview">
            <TabsList className="w-full mb-4">
              <TabsTrigger className="flex-1" value="preview">Preview</TabsTrigger>
              <TabsTrigger className="flex-1" value="send">Send Invoice</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-0">
              <Card className="h-[calc(100vh-300px)] overflow-hidden">
                <CardContent className="p-0">
                  {selectedOrder ? (
                    <div className="bg-white h-full overflow-auto p-8">
                      <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold mb-1">INVOICE</h2>
                        <p className="text-muted-foreground">{invoiceNumber}</p>
                      </div>
                      
                      <div className="flex justify-between mb-8">
                        <div>
                          <p className="font-semibold mb-1">Bill To:</p>
                          <p>{selectedOrder.clientName}</p>
                          <p className="text-muted-foreground">123 Client Street</p>
                          <p className="text-muted-foreground">City, State, 12345</p>
                        </div>
                        <div className="text-right">
                          <p><span className="font-semibold">Invoice Date:</span> {format(new Date(), 'MMM dd, yyyy')}</p>
                          <p><span className="font-semibold">Due Date:</span> {format(new Date(dueDate), 'MMM dd, yyyy')}</p>
                          <p><span className="font-semibold">Order:</span> {selectedOrder.id}</p>
                        </div>
                      </div>
                      
                      <table className="w-full mb-6 text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="py-2 text-left">Item</th>
                            <th className="py-2 text-right">Qty</th>
                            <th className="py-2 text-right">Price</th>
                            <th className="py-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items.map((item, i) => (
                            <tr key={i} className="border-b border-border">
                              <td className="py-2">{item.name}</td>
                              <td className="py-2 text-right">{item.quantity}</td>
                              <td className="py-2 text-right">${item.price.toFixed(2)}</td>
                              <td className="py-2 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      <div className="ml-auto w-1/3">
                        <div className="flex justify-between mb-1">
                          <span>Subtotal:</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Tax (10%):</span>
                          <span>${taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t border-border">
                          <span>Total:</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-8 pt-4 border-t border-border">
                        <p className="text-center text-muted-foreground">Thank you for your business!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Invoice preview will appear here
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="send" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Send Invoice</CardTitle>
                  <CardDescription>Email the invoice to your client</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-to">To</Label>
                    <Input id="email-to" placeholder="client@example.com" disabled={!selectedOrder} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-subject">Subject</Label>
                    <Input 
                      id="email-subject" 
                      value={selectedOrder ? `Invoice ${invoiceNumber} for Order ${selectedOrder.id}` : ''}
                      disabled={!selectedOrder} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-body">Message</Label>
                    <Input 
                      id="email-body" 
                      placeholder="Write a message to your client"
                      disabled={!selectedOrder} 
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button variant="outline" disabled={!selectedOrder}>
                    Preview Email
                  </Button>
                  <Button disabled={!selectedOrder}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invoice
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCreator;