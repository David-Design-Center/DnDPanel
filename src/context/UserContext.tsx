import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

// Use database types for better type safety
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

// User interface based on profiles table in the database
interface User {
  id: ProfileRow['id'];
  full_name: ProfileRow['full_name'];
  role: ProfileRow['role'];
}

interface UserContextType {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  setCurrentUser: (user: User | null) => void;
  loginAsAdmin: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Updated to use profiles table which exists in database types
        const { data, error } = await supabase
          .from("profiles")
          .select('id, full_name, role')
          .eq('role', 'admin');

        if (error) {
          console.error('Error fetching profiles:', error);
          return;
        }

        setUsers(data as User[]);
      } catch (error) {
        console.error('Error in fetchUsers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // We need to add auth functionality since profiles doesn't have passwords
  const loginAsAdmin = async (username: string, password: string) => {
    try {
      // First authenticate with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: username, // assuming username is an email
        password: password,
      });

      if (authError || !authData.user) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Then fetch the user profile to check role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', authData.user.id)
        .eq('role', 'admin')
        .single();

      if (profileError || !profileData) {
        await supabase.auth.signOut(); // Sign out if not admin
        return { success: false, message: 'Not authorized as admin' };
      }

      // Set current user
      setCurrentUser({
        id: profileData.id,
        full_name: profileData.full_name,
        role: profileData.role,
      });

      return { success: true };
    } catch (error) {
      console.error('Error in loginAsAdmin:', error);
      return { success: false, message: 'An error occurred' };
    }
  };

  return (
    <UserContext.Provider
      value={{
        users,
        currentUser,
        isLoading,
        setCurrentUser,
        loginAsAdmin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};