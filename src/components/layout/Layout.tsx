import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { UserSelect } from '@/components/UserSelect';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="overflow-auto flex-1 flex flex-col">
        <header className="h-16 border-b border-border flex items-center px-6">
          <div className="flex justify-between items-center w-full">
            <UserSelect />
            <div className="text-sm text-muted-foreground">
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;