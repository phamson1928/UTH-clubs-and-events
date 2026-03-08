import { useState, useEffect } from "react";
import axios from "axios";
import { Bell, Check, Trash2, Calendar, UserCheck, Star } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";
import { Badge } from "./ui/badge";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${API_BASE}/notifications`, {
                headers: getAuthHeaders(),
            });
            setNotifications(res.data.data || []);
            setUnreadCount(res.data.unreadCount || 0);
        } catch (error) {
            console.error("[Notifications] Failed to fetch", error);
        }
    };

    useEffect(() => {
        // Check if logged in before fetching
        if (localStorage.getItem("authToken")) {
            fetchNotifications();
            // Polling every 60 seconds
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, []);

    const handleMarkAllRead = async () => {
        try {
            if (unreadCount === 0) return;
            await axios.patch(`${API_BASE}/notifications/read-all`, {}, {
                headers: getAuthHeaders(),
            });
            setUnreadCount(0);
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Mark all read error", error);
        }
    };

    const handleMarkRead = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await axios.patch(`${API_BASE}/notifications/read`, { ids: [id] }, {
                headers: getAuthHeaders(),
            });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Mark read error", error);
        }
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await axios.delete(`${API_BASE}/notifications/${id}`, {
                headers: getAuthHeaders(),
            });
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            // Refresh count
            fetchNotifications();
        } catch (error) {
            console.error("Delete notification error", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'new_event': return <Calendar className="w-4 h-4 text-blue-500" />;
            case 'membership_approved': return <UserCheck className="w-4 h-4 text-green-500" />;
            case 'points_earned': return <Star className="w-4 h-4 text-amber-500" />;
            default: return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-destructive" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 md:w-96 max-h-[80vh] overflow-y-auto" align="end">
                <div className="flex items-center justify-between px-4 py-2 sticky top-0 bg-white z-10">
                    <DropdownMenuLabel className="p-0 font-bold text-lg">Thông báo</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs text-teal-600">
                            <Check className="w-3 h-3 mr-1" /> Đánh dấu đã đọc
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground flex flex-col items-center">
                        <Bell className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm">Bạn không có thông báo nào</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`flex flex-col items-start p-4 cursor-pointer border-b last:border-0 ${notification.is_read ? 'opacity-75' : 'bg-teal-50/30'}`}
                            >
                                <div className="flex justify-between w-full mb-1">
                                    <div className="flex items-center gap-2">
                                        {getIcon(notification.type)}
                                        <span className={`font-semibold text-sm ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {notification.title}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {!notification.is_read && (
                                            <Badge variant="default" className="w-2 h-2 rounded-full p-0 bg-teal-500" title="Chưa đọc" />
                                        )}
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-2 line-clamp-2 w-full text-left">
                                    {notification.message}
                                </p>

                                <div className="flex justify-between w-full items-center mt-1">
                                    <span className="text-xs text-gray-400">
                                        {new Date(notification.created_at).toLocaleString('vi-VN')}
                                    </span>
                                    <div className="flex gap-2">
                                        {!notification.is_read && (
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => handleMarkRead(notification.id, e)}>
                                                <Check className="h-3 w-3 text-teal-600" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-red-600" onClick={(e) => handleDelete(notification.id, e)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
