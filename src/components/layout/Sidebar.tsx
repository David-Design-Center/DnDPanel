import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  Inbox, 
  ShoppingCart, 
  FileText, 
  Mail, 
  LogOut, 
  Settings,
  UserCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/UserContext';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { currentUser, setCurrentUser } = useUser();

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="w-64 min-w-64 bg-card border-r border-border h-screen flex flex-col">
      {/* Logo and App Name */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <ShoppingCart size={24} className="text-foreground" />
          <h1 className="text-xl font-semibold">D&D Panel</h1>
        </div>
      </div>

      <Separator />

      {/* User Info */}
      {currentUser && (
        <div className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <UserCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium">{currentUser.username}</p>
            <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
          </div>
        </div>
      )}

      <Separator className="my-2" />

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1 flex flex-col gap-1">
        {/* Only show Dashboard for admin users */}
        {isAdmin && (
          <Link to="/">
            <Button 
              variant={isActive('/') ? 'secondary' : 'ghost'} 
              className={cn(
                "w-full justify-start gap-3 font-normal", 
                isActive('/') && "font-medium"
              )}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Button>
          </Link>
        )}
        <Link to="/inbox">
          <Button 
            variant={isActive('/inbox') ? 'secondary' : 'ghost'} 
            className={cn(
              "w-full justify-start gap-3 font-normal", 
              isActive('/inbox') && "font-medium"
            )}
          >
            <Inbox size={18} />
            Inbox
          </Button>
        </Link>
        <Link to="/orders">
          <Button 
            variant={isActive('/orders') ? 'secondary' : 'ghost'} 
            className={cn(
              "w-full justify-start gap-3 font-normal", 
              isActive('/orders') && "font-medium"
            )}
          >
            <ShoppingCart size={18} />
            Orders
          </Button>
        </Link>
        <Link to="/invoice-creator">
          <Button 
            variant={isActive('/invoice-creator') ? 'secondary' : 'ghost'} 
            className={cn(
              "w-full justify-start gap-3 font-normal", 
              isActive('/invoice-creator') && "font-medium"
            )}
          >
            <FileText size={18} />
            Invoice Creator
          </Button>
        </Link>
        <Link to="/email-composer">
          <Button 
            variant={isActive('/email-composer') ? 'secondary' : 'ghost'} 
            className={cn(
              "w-full justify-start gap-3 font-normal", 
              isActive('/email-composer') && "font-medium"
            )}
          >
            <Mail size={18} />
            Email Composer
          </Button>
        </Link>
      </nav>

      <div className="p-3 mt-auto">
        <Separator className="my-2" />
        <Button variant="ghost" className="w-full justify-start gap-3 font-normal">
          <Settings size={18} />
          Settings
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 font-normal text-destructive hover:text-destructive"
          onClick={() => setCurrentUser(null)}
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;