/*
  # Create orders table

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `customer_name` (text)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `zip` (text)
      - `phone_1` (text)
      - `phone_2` (text)
      - `email` (text)
      - `created_by` (uuid, references profiles.id)
      - `created_at` (timestamp with time zone)
      - `po_number` (text)
  2. Security
    - Enable RLS on `orders` table
    - Add policies for staff to read and write their own orders
    - Add policies for admins to read and write all orders
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone_1 TEXT,
  phone_2 TEXT,
  email TEXT,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  po_number TEXT
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS orders_created_by_idx ON orders(created_by);
CREATE INDEX IF NOT EXISTS orders_customer_name_idx ON orders(customer_name);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Staff can read their own orders
CREATE POLICY "Staff can read own orders"
  ON orders
  FOR SELECT
  USING (auth.uid() = created_by);

-- Staff can insert their own orders
CREATE POLICY "Staff can insert own orders"
  ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Staff can update their own orders
CREATE POLICY "Staff can update own orders"
  ON orders
  FOR UPDATE
  USING (auth.uid() = created_by);

-- Staff can delete their own orders
CREATE POLICY "Staff can delete own orders"
  ON orders
  FOR DELETE
  USING (auth.uid() = created_by);

-- Admins can read all orders
CREATE POLICY "Admins can read all orders"
  ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can insert all orders
CREATE POLICY "Admins can insert all orders"
  ON orders
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update all orders
CREATE POLICY "Admins can update all orders"
  ON orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete all orders
CREATE POLICY "Admins can delete all orders"
  ON orders
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );