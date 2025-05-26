/*
  # Create order_items table

  1. New Tables
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders.id)
      - `item` (text)
      - `description` (text)
      - `qty` (integer)
      - `price` (numeric)
      - `total` (numeric, calculated as qty * price)
  2. Security
    - Enable RLS on `order_items` table
    - Add policies for staff to read and write their own order items
    - Add policies for admins to read and write all order items
*/

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  item TEXT NOT NULL,
  description TEXT,
  qty INTEGER NOT NULL CHECK (qty > 0),
  price NUMERIC NOT NULL CHECK (price >= 0),
  total NUMERIC GENERATED ALWAYS AS (qty * price) STORED
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);

-- Enable Row Level Security
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Staff can read their own order items (based on orders they created)
CREATE POLICY "Staff can read own order items"
  ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.created_by = auth.uid()
    )
  );

-- Staff can insert their own order items
CREATE POLICY "Staff can insert own order items"
  ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.created_by = auth.uid()
    )
  );

-- Staff can update their own order items
CREATE POLICY "Staff can update own order items"
  ON order_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.created_by = auth.uid()
    )
  );

-- Staff can delete their own order items
CREATE POLICY "Staff can delete own order items"
  ON order_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.created_by = auth.uid()
    )
  );

-- Admins can read all order items
CREATE POLICY "Admins can read all order items"
  ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can insert all order items
CREATE POLICY "Admins can insert all order items"
  ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update all order items
CREATE POLICY "Admins can update all order items"
  ON order_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete all order items
CREATE POLICY "Admins can delete all order items"
  ON order_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );