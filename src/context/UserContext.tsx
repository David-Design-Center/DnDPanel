import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
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
        const { data, error } = await supabase
          .from('users')
          .select('id, username, role')
          .order('username');

        if (error) {
          console.error('Error fetching users:', error);
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

  const loginAsAdmin = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, role, password')
        .eq('username', username)
        .eq('role', 'admin')
        .single();

      if (error) {
        return { success: false, message: 'User not found' };
      }

      if (data.password !== password) {
        return { success: false, message: 'Invalid password' };
      }

      // If password is correct, set the current user
      setCurrentUser({
        id: data.id,
        username: data.username,
        role: data.role,
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