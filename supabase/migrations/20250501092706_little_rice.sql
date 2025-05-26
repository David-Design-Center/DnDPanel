/*
  # Create invoices table

  1. New Tables
    - `invoices`
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders.id)
      - `invoice_date` (date)
      - `pdf_url` (text)
      - `tax` (numeric)
      - `sub_total` (numeric)
      - `deposit` (numeric)
      - `total` (numeric)
      - `balance` (numeric)
      - `payments` (jsonb)
      - `final_balance` (numeric)
  2. Security
    - Enable RLS on `invoices` table
    - Add policies for staff to read and write their own invoices
    - Add policies for admins to read and write all invoices
*/

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  invoice_date DATE DEFAULT CURRENT_DATE NOT NULL,
  pdf_url TEXT,
  tax NUMERIC NOT NULL DEFAULT 0 CHECK (tax >= 0),
  sub_total NUMERIC NOT NULL CHECK (sub_total >= 0),
  deposit NUMERIC NOT NULL DEFAULT 0 CHECK (deposit >= 0),
  total NUMERIC GENERATED ALWAYS AS (sub_total + tax) STORED,
  balance NUMERIC GENERATED ALWAYS AS (sub_total + tax - deposit) STORED,
  payments JSONB DEFAULT '[]'::jsonb,
  final_balance NUMERIC NOT NULL DEFAULT 0
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS invoices_order_id_idx ON invoices(order_id);

-- Create function to calculate final balance based on payments
CREATE OR REPLACE FUNCTION calculate_final_balance()
RETURNS TRIGGER AS $$
DECLARE
  payment_total NUMERIC := 0;
  payment_record JSONB;
BEGIN
  -- Sum up all payments
  IF NEW.payments IS NOT NULL AND jsonb_array_length(NEW.payments) > 0 THEN
    FOR payment_record IN SELECT * FROM jsonb_array_elements(NEW.payments)
    LOOP
      payment_total := payment_total + (payment_record->>'amount')::NUMERIC;
    END LOOP;
  END IF;
  
  -- Calculate final balance
  NEW.final_balance := NEW.total - NEW.deposit - payment_total;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update final_balance whenever payments change
CREATE TRIGGER update_final_balance
  BEFORE INSERT OR UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION calculate_final_balance();

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Staff can read their own invoices (based on orders they created)
CREATE POLICY "Staff can read own invoices"
  ON invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = invoices.order_id
      AND orders.created_by = auth.uid()
    )
  );

-- Staff can insert their own invoices
CREATE POLICY "Staff can insert own invoices"
  ON invoices
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = invoices.order_id
      AND orders.created_by = auth.uid()
    )
  );

-- Staff can update their own invoices
CREATE POLICY "Staff can update own invoices"
  ON invoices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = invoices.order_id
      AND orders.created_by = auth.uid()
    )
  );

-- Staff can delete their own invoices
CREATE POLICY "Staff can delete own invoices"
  ON invoices
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = invoices.order_id
      AND orders.created_by = auth.uid()
    )
  );

-- Admins can read all invoices
CREATE POLICY "Admins can read all invoices"
  ON invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can insert all invoices
CREATE POLICY "Admins can insert all invoices"
  ON invoices
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update all invoices
CREATE POLICY "Admins can update all invoices"
  ON invoices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete all invoices
CREATE POLICY "Admins can delete all invoices"
  ON invoices
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );