import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: string;
  orderId: string;
  invoiceDate: string;
  dueDate: string;
  subTotal: number;
  tax: number;
  total: number;
  balance: number;
  payments: Payment[];
  customerName: string;
}

interface Payment {
  date: string;
  amount: number;
}

interface InvoiceContextProps {
  invoices: Invoice[];
  isLoading: boolean;
  getInvoiceById: (id: string) => Invoice | undefined;
  createInvoice: (invoice: Omit<Invoice, 'id' | 'balance' | 'total'>) => Promise<void>;
  addPayment: (invoiceId: string, payment: Payment) => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextProps | undefined>(undefined);

export const InvoiceProvider = ({ children }: { children: ReactNode }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          order_id,
          invoice_date,
          sub_total,
          tax,
          total,
          balance,
          payments,
          orders:order_id (
            customer_name
          )
        `)
        .order('invoice_date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Transform data to match our Invoice type
        const transformedInvoices: Invoice[] = data.map(inv => ({
          id: inv.id,
          orderId: inv.order_id,
          invoiceDate: inv.invoice_date,
          dueDate: new Date(new Date(inv.invoice_date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from invoice date
          subTotal: inv.sub_total,
          tax: inv.tax,
          total: inv.total,
          balance: inv.balance,
          payments: Array.isArray(inv.payments)
            ? inv.payments
                .filter((p: any) => p && typeof p.date === 'string' && typeof p.amount === 'number')
                .map((p: any) => ({ date: p.date, amount: p.amount }))
            : [] as Payment[],
          customerName: inv.orders.customer_name
        }));
        
        setInvoices(transformedInvoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Error fetching invoices',
        description: 'Could not load invoices from the database',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInvoiceById = (id: string) => {
    return invoices.find(invoice => invoice.id === id);
  };

  const createInvoice = async (invoice: Omit<Invoice, 'id' | 'balance' | 'total'>) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .insert({
          order_id: invoice.orderId,
          invoice_date: invoice.invoiceDate,
          sub_total: invoice.subTotal,
          tax: invoice.tax,
          deposit: 0, // Default deposit as 0
          payments: (invoice.payments || []) as any
        });
      
      if (error) throw error;
      
      // Refresh the invoices list
      await fetchInvoices();
      
      toast({
        title: 'Invoice created',
        description: 'The invoice has been created successfully',
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error creating invoice',
        description: 'Could not create the invoice in the database',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Update the addPayment function
  const addPayment = async (invoiceId: string, payment: Payment) => {
    try {
      // Get current invoice with payments
      const { data: currentInvoice, error: fetchError } = await supabase
        .from('invoices')
        .select('payments')
        .eq('id', invoiceId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Safe handling of payments - ensure it's always an array
      const currentPayments = Array.isArray(currentInvoice?.payments) 
        ? currentInvoice.payments.map((p: any) => ({ 
            date: p.date, 
            amount: p.amount 
          }))
        : [];
      
      // Type-safe update
      const updatedPayments = [...currentPayments, payment];
      
      // Update the invoice with new payments
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ payments: updatedPayments })
        .eq('id', invoiceId);
      
      if (updateError) throw updateError;
      
      // Refresh invoices
      await fetchInvoices();
      
      toast({
        title: 'Payment added',
        description: `Payment of $${payment.amount} has been recorded`,
      });
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: 'Error adding payment',
        description: 'Could not add the payment to the invoice',
        variant: 'destructive',
      });
    }
  };

  return (
    <InvoiceContext.Provider value={{ 
      invoices, 
      isLoading, 
      getInvoiceById, 
      createInvoice,
      addPayment 
    }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoices = () => {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
};