/*
  # Create users table and add sample users

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, not null)
      - `role` (text, either 'admin' or 'user')
      - `password` (text, only required for admin)
      - `created_at` (timestamp with time zone)
  2. Security
    - Enable RLS on `users` table
    - Add policies for public access to read users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to users
CREATE POLICY "Allow public to read users"
  ON users
  FOR SELECT
  TO public
  USING (true);

-- Insert sample users
INSERT INTO users (username, role, password)
VALUES 
  ('David', 'admin', 'admin123'), -- In a real app, this should be properly hashed
  ('Nikita', 'user', NULL),
  ('Anna', 'user', NULL),
  ('Dima', 'user', NULL);