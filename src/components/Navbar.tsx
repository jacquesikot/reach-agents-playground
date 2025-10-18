import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, User, Search, Bot } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Navbar({ searchQuery, onSearchChange }: NavbarProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="border-b bg-background">
      <div className="flex h-16 items-center px-6 gap-4">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Agent Playground</h1>
        </div>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
