import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import apiClient from '../apiClient';

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (isOpen) {
      const fetchNotifications = async () => {
        setIsLoading(true);
        try {
          const response = await apiClient.get('/notifications');
          setNotifications(response.data || []);
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    // Optionally call backend endpoint here: await apiClient.put('/notifications/mark-all-read');
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      try {
        // --- THIS IS THE FIX ---
        // This line now sends a DELETE request to your backend endpoint.
        await apiClient.delete('/notifications');
        // Instantly update the UI to show an empty list
        setNotifications([]);
      } catch (error) {
        console.error("Failed to clear notifications:", error);
        alert("Could not clear notifications. Please try again.");
      }
    } 
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-medium text-sm">Notifications</h4>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="w-4 h-4 mr-1" /> Mark all as read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Clear all
            </Button>
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <p className="p-4 text-sm text-center text-slate-500">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="p-4 text-sm text-center text-slate-500">You have no new notifications.</p>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`p-3 ${!notification.read ? 'bg-blue-50' : 'bg-white'}`}
                >
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
