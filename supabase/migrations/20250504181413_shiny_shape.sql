/*
  # Fix infinite recursion in profiles policies

  This migration fixes the infinite recursion issue in the policies for the profiles table
  by simplifying the admin check policy.
*/

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a new policy that doesn't cause recursion
CREATE POLICY "Admins can view all profiles" 
  ON profiles 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );