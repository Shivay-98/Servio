import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Menu, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import notificationService from '../../services/notification.service';
import { getInitials, formatDate } from '../../utils/helpers';

export default function DashboardHeader({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((state) => state.auth);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: async () => {
      const res = await notificationService.getUnreadCount();
      return res.data?.count || 0;
    },
    refetchInterval: 30000,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['recentNotifications'],
    queryFn: async () => {
      const res = await notificationService.getNotifications({ limit: 5 });
      return res.data?.notifications || [];
    },
    refetchInterval: 30000,
  });

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
    } catch {
      // silent
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <p className="text-sm font-semibold">{user?.firstName}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-sm font-semibold">Notifications</p>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>
              )}
            </div>
            <Separator />
            <ScrollArea className="max-h-72">
              {notifications.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <DropdownMenuItem
                    key={n._id}
                    className="flex cursor-pointer flex-col items-start gap-1 px-3 py-3"
                    onClick={() => !n.isRead && handleMarkRead(n._id)}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <p className={`text-sm ${n.isRead ? 'text-muted-foreground' : 'font-medium'}`}>
                        {n.title}
                      </p>
                      {!n.isRead && <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(n.createdAt)}</p>
                  </DropdownMenuItem>
                ))
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.avatar?.url} />
          <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
            {getInitials(`${user?.firstName || ''} ${user?.lastName || ''}`)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
