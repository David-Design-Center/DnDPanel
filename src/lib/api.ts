// API utility functions for working with Supabase
import { supabase } from './supabase';
import { Database } from './database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type Invoice = Database['public']['Tables']['invoices']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];

// Profile functions
export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
}

export async function updateProfile(profile: Partial<Profile>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', user.id)
    .select()
    .single();
  
  return { data, error };
}

// Order functions
export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      created_by:profiles(full_name)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  
  return data;
}

export async function getOrder(id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      created_by:profiles(full_name),
      order_items(*),
      invoices(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching order ${id}:`, error);
    return null;
  }
  
  return data;
}

export async function createOrder(newOrder: Omit<Database['public']['Tables']['orders']['Insert'], 'created_by' | 'id' | 'created_at'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  
  const orderData = {
    ...newOrder,
    created_by: user.id,
  };
  
  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();
  
  return { data, error };
}

// Order Items functions
export async function createOrderItem(newItem: Omit<Database['public']['Tables']['order_items']['Insert'], 'id' | 'total'>) {
  const { data, error } = await supabase
    .from('order_items')
    .insert(newItem)
    .select()
    .single();
  
  return { data, error };
}

export async function updateOrderItem(id: string, updates: Partial<Omit<Database['public']['Tables']['order_items']['Update'], 'id' | 'total'>>) {
  const { data, error } = await supabase
    .from('order_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
}

export async function deleteOrderItem(id: string) {
  const { error } = await supabase
    .from('order_items')
    .delete()
    .eq('id', id);
  
  return { error };
}

// Invoice functions
export async function getInvoices() {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      order:orders(customer_name)
    `)
    .order('invoice_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
  
  return data;
}

export async function getInvoice(id: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      order:orders(
        *,
        order_items(*)
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching invoice ${id}:`, error);
    return null;
  }
  
  return data;
}

export async function createInvoice(newInvoice: Omit<Database['public']['Tables']['invoices']['Insert'], 'id' | 'total' | 'balance' | 'final_balance'>) {
  const { data, error } = await supabase
    .from('invoices')
    .insert(newInvoice)
    .select()
    .single();
  
  return { data, error };
}

export async function updateInvoice(id: string, updates: Partial<Omit<Database['public']['Tables']['invoices']['Update'], 'id' | 'total' | 'balance' | 'final_balance'>>) {
  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
}

export async function addPaymentToInvoice(invoiceId: string, payment: { date: string, amount: number }) {
  // First, get the current invoice to access its payments
  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select('payments')
    .eq('id', invoiceId)
    .single();
  
  if (fetchError) {
    return { error: fetchError };
  }
  
  const currentPayments = invoice.payments as any[] || [];
  const newPayments = [...currentPayments, payment];
  
  const { data, error } = await supabase
    .from('invoices')
    .update({ payments: newPayments })
    .eq('id', invoiceId)
    .select()
    .single();
  
  return { data, error };
}

// Message functions
export async function getMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles(full_name),
      order:orders(customer_name)
    `)
    .order('sent_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  
  return data;
}

export async function getMessagesByOrder(orderId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles(full_name)
    `)
    .eq('order_id', orderId)
    .order('sent_at', { ascending: true });
  
  if (error) {
    console.error(`Error fetching messages for order ${orderId}:`, error);
    return [];
  }
  
  return data;
}

export async function sendMessage(newMessage: Omit<Database['public']['Tables']['messages']['Insert'], 'id' | 'sent_at' | 'sent_by'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  
  const messageData = {
    ...newMessage,
    sent_by: user.id,
  };
  
  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select()
    .single();
  
  return { data, error };
}

export async function markMessageAsRead(id: string) {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', id);
  
  return { error };
}