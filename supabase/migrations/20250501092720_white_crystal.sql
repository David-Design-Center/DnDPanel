/*
  # Create messages table for customer communication

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders.id)
      - `sent_by` (uuid, references profiles.id)
      - `sent_at` (timestamp with time zone)
      - `subject` (text)
      - `content` (text)
      - `attachments` (jsonb, array of attachment objects)
      - `is_read` (boolean)
  2. Security
    - Enable RLS on `messages` table
    - Add policies for staff to read and write their own messages
    - Add policies for admins to read and write all messages
*/

-- Create messages table for customer communication
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  sent_by UUID REFERENCES profiles(id) NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_read BOOLEAN DEFAULT FALSE NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS messages_order_id_idx ON messages(order_id);
CREATE INDEX IF NOT EXISTS messages_sent_by_idx ON messages(sent_by);
CREATE INDEX IF NOT EXISTS messages_sent_at_idx ON messages(sent_at);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Staff can read messages related to their orders
CREATE POLICY "Staff can read own messages"
  ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = messages.order_id
      AND orders.created_by = auth.uid()
    )
    OR sent_by = auth.uid()
  );

-- Staff can insert messages for their orders
CREATE POLICY "Staff can insert messages for own orders"
  ON messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = messages.order_id
      AND orders.created_by = auth.uid()
    )
    OR sent_by = auth.uid()
  );

-- Staff can update their own messages
CREATE POLICY "Staff can update own messages"
  ON messages
  FOR UPDATE
  USING (sent_by = auth.uid());

-- Staff can delete their own messages
CREATE POLICY "Staff can delete own messages"
  ON messages
  FOR DELETE
  USING (sent_by = auth.uid());

-- Admins can read all messages
CREATE POLICY "Admins can read all messages"
  ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can insert all messages
CREATE POLICY "Admins can insert all messages"
  ON messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update all messages
CREATE POLICY "Admins can update all messages"
  ON messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete all messages
CREATE POLICY "Admins can delete all messages"
  ON messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );