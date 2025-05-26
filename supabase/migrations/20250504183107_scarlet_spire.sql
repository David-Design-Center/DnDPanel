/*
  # Fix orders table RLS policies

  1. Changes:
    - Simplify the RLS policies for order creation 
    - Allow any authenticated user to create orders with their user ID
    - Ensure RLS policies don't cause recursion or permission issues

  2. Security:
    - Maintain security while allowing proper functionality
    - Keep row-level protection based on ownership
*/

-- Create or replace is_admin function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing insert policies for orders to avoid conflicts
DROP POLICY IF EXISTS "Staff can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can insert all orders" ON public.orders;

-- Create a new simplified insert policy that works for all authenticated users
CREATE POLICY "Users can insert orders with own ID"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Keep admin policies to maintain admin privileges
CREATE POLICY "Admins can insert any orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (is_admin());