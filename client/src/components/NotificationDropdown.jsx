import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { Bell, Heart, MessageSquare, Bookmark, UserPlus, Check, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationDropdown = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch unread count stats on load
  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const { data } = await API.get('/notifications/unread-count');
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Error fetching unread notifications count:', err);
    }
  };

  // Fetch actual list items on dropdown toggle
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data } = await API.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Poll for notifications count every 30 seconds for real-time feel
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      fetchNotifications();
    }
  };

  const handleMarkRead = async (id, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      await API.patch(`/notifications/${id}/read`);
      // Update local states
      if (id === 'all') {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await handleMarkRead(notif._id);
    }
    setIsOpen(false);

    // Redirect user to source interaction target
    if (notif.type === 'follow') {
      navigate(`/profile/${notif.sender?.username}`);
    } else if (notif.post) {
      navigate(`/pin/${notif.post._id}`);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-violet-500 fill-current" />;
      case 'comment':
        return <MessageSquare className="w-3.5 h-3.5 text-fuchsia-500 fill-current" />;
      case 'save':
        return <Bookmark className="w-3.5 h-3.5 text-violet-500 fill-current" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-indigo-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const getNotifText = (type) => {
    switch (type) {
      case 'like':
        return 'liked your pin';
      case 'comment':
        return 'commented on your pin';
      case 'save':
        return 'saved your pin to their board';
      case 'follow':
        return 'started following you';
      default:
        return 'interacted with your profile';
    }
  };

  const getPinThumbnailSrc = (imgUrl) => {
    if (!imgUrl) return '';
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://') || imgUrl.startsWith('data:')) {
      return imgUrl;
    }
    return `http://localhost:5000${imgUrl}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Navbar trigger trigger */}
      <button
        onClick={handleToggle}
        className="relative w-9 h-9 rounded-full bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-[9px] font-extrabold flex items-center justify-center px-1 rounded-full border border-[#0f0f11] shadow-lg shadow-violet-650/30">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 mt-3 w-80 md:w-96 bg-[#18181b] border border-white/5 rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.18)] z-50 overflow-hidden"
          >
            {/* Header Controls */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
              <h3 className="text-sm font-bold text-white font-display">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={(e) => handleMarkRead('all', e)}
                  className="text-[10px] font-bold text-violet-500 hover:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark all as read
                </button>
              )}
            </div>

            {/* List Canvas */}
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-0.5">
              {loading ? (
                <div className="flex flex-col gap-2 py-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-14 bg-zinc-950/40 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : !notifications || notifications.length === 0 ? (
                <div className="py-8 text-center text-zinc-550 text-xs italic">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                      notif.read
                        ? 'bg-zinc-950/20 border-transparent text-zinc-400 hover:bg-zinc-950/40'
                        : 'bg-zinc-950/70 border-violet-500/10 text-white hover:bg-zinc-950 hover:border-violet-500/25'
                    }`}
                  >
                    
                    {/* Left: Avatar & Text */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={notif.sender?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${notif.sender?.username}`}
                          alt={notif.sender?.username}
                          className="w-8.5 h-8.5 rounded-full object-cover border border-zinc-800 bg-zinc-950"
                        />
                        <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#18181b] border border-white/5 flex items-center justify-center">
                          {getNotifIcon(notif.type)}
                        </div>
                      </div>

                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-xs font-semibold leading-snug">
                          <span className="font-bold text-white hover:underline mr-1">
                            {notif.sender?.username}
                          </span>
                          {getNotifText(notif.type)}
                        </span>
                        <span className="text-[9px] text-zinc-550 font-medium">
                          {new Date(notif.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Right: Pin Image Thumbnail or Mark-as-read indicator */}
                    <div className="ml-3 shrink-0">
                      {notif.post ? (
                        <div className="w-9 h-12 rounded-lg overflow-hidden bg-zinc-950 border border-white/5 hover:scale-105 transition-transform">
                          <img
                            src={getPinThumbnailSrc(notif.post.image)}
                            alt={notif.post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        !notif.read && (
                          <button
                            onClick={(e) => handleMarkRead(notif._id, e)}
                            className="w-5 h-5 rounded-full bg-violet-650/10 hover:bg-violet-650/20 text-violet-400 flex items-center justify-center cursor-pointer transition-colors border border-violet-500/10"
                            title="Mark as Read"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default NotificationDropdown;
