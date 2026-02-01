import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Calendar, LogOut, Settings } from 'lucide-react';

export function UserMenu() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/auth')}
        className="rounded-xl text-muted-foreground hover:text-foreground"
      >
        登录
      </Button>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl gap-2"
        >
          <div className="w-6 h-6 rounded-full bg-sage/20 flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="头像" className="w-full h-full object-cover" />
            ) : (
              <User className="w-3.5 h-3.5 text-sage" />
            )}
          </div>
          <span className="text-sm max-w-[80px] truncate">
            {profile?.username || '用户'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl">
        <DropdownMenuItem
          onClick={() => navigate('/profile')}
          className="rounded-lg cursor-pointer"
        >
          <Settings className="w-4 h-4 mr-2" />
          个人资料
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/history')}
          className="rounded-lg cursor-pointer"
        >
          <Calendar className="w-4 h-4 mr-2" />
          历史记录
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
