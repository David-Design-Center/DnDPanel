import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserCircle } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';

export const UserSelect = () => {
  const { users, currentUser, setCurrentUser, loginAsAdmin } = useUser();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUserSelect = (value: string) => {
    const selectedUser = users.find(user => user.username === value);
    
    if (!selectedUser) return;
    
    if (selectedUser.role === 'admin') {
      setSelectedUsername(value);
      setPassword('');
      setIsPasswordDialogOpen(true);
    } else {
      // For non-admin users, simply set them as current
      setCurrentUser(selectedUser);
    }
  };

  const handleAdminLogin = async () => {
    if (!selectedUsername) return;
    
    setIsLoading(true);
    try {
      const result = await loginAsAdmin(selectedUsername, password);
      
      if (result.success) {
        setIsPasswordDialogOpen(false);
        toast({
          title: 'Login successful',
          description: `Logged in as ${selectedUsername}`,
        });
      } else {
        toast({
          title: 'Login failed',
          description: result.message || 'Invalid password',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <UserCircle className="h-5 w-5 text-muted-foreground" />
        <Select onValueChange={handleUserSelect} value={currentUser?.username || ''}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select User" />
          </SelectTrigger>
          <SelectContent>
            {users.map(user => (
              <SelectItem key={user.id} value={user.username}>
                {user.username} {user.role === 'admin' ? '(Admin)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Administrator Login</DialogTitle>
            <DialogDescription>
              Please enter the admin password to login as {selectedUsername}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAdminLogin();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPasswordDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAdminLogin} 
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};