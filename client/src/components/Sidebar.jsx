import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Compass,
  Home,
  Compass as ExploreIcon,
  Bell,
  MessageSquare,
  PlusCircle,
  User,
  Bookmark,
  Heart,
  Image as CategoryIcon,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Architecture', emoji: '🏢' },
  { name: 'Interior', emoji: '🛋️' },
  { name: 'Illustration', emoji: '🎨' },
  { name: 'Nature', emoji: '🌲' },
  { name: 'Fashion', emoji: '👗' },
  { name: 'Technology', emoji: '💻' },
  { name: 'Travel', emoji: '✈️' },
  { name: 'Food', emoji: '🍕' },
];

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const isActive = (path) => currentPath === path;

  const handleCategoryClick = (category) => {
    navigate(`/?category=${encodeURIComponent(category)}`);
  };

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col gap-8 py-6 pl-6 pr-4 border-r border-white/5 h-[calc(100vh-70px)] overflow-y-auto sticky top-[70px] bg-[#0f0f11]">
      
      {/* Primary Links */}
      <div className="flex flex-col gap-1">
        <Link
          to="/"
          className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all hover:bg-zinc-900/60 ${
            isActive('/') ? 'bg-zinc-900 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <Link
          to="/explore"
          className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all hover:bg-zinc-900/60 ${
            isActive('/explore') ? 'bg-zinc-900 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ExploreIcon className="w-4 h-4" />
          <span>Explore</span>
        </Link>

        <div className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-all cursor-pointer">
          <div className="flex items-center gap-3.5">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </div>
          <span className="bg-violet-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-lg shadow-violet-650/20">
            3
          </span>
        </div>

        <div className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-all cursor-pointer">
          <MessageSquare className="w-4 h-4" />
          <span>Messages</span>
        </div>

        <Link
          to="/upload"
          className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all hover:bg-zinc-900/60 ${
            isActive('/upload') ? 'bg-zinc-900 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create</span>
        </Link>
      </div>

      {/* User Section (Profile, Saved, Liked) */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-extrabold text-zinc-650 uppercase tracking-widest px-4 mb-2">
          Your
        </span>

        {user ? (
          <>
            <Link
              to={`/profile/${user.username}`}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all hover:bg-zinc-900/60 ${
                isActive(`/profile/${user.username}`) ? 'bg-zinc-900 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </Link>

            <Link
              to={`/profile/${user.username}?tab=saved`}
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-all"
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved</span>
            </Link>

            <Link
              to={`/profile/${user.username}?tab=liked`}
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-all"
            >
              <Heart className="w-4 h-4" />
              <span>Liked</span>
            </Link>
          </>
        ) : (
          <Link
            to="/auth"
            className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30 transition-all"
          >
            <User className="w-4 h-4 animate-pulse" />
            <span className="italic">Sign in to view boards</span>
          </Link>
        )}
      </div>

      {/* Categories Section */}
      <div className="flex flex-col gap-1 mb-6">
        <span className="text-[10px] font-extrabold text-zinc-650 uppercase tracking-widest px-4 mb-2">
          Categories
        </span>

        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => handleCategoryClick(cat.name)}
            className="flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-all text-left w-full cursor-pointer"
          >
            <span className="text-sm shrink-0">{cat.emoji}</span>
            <span className="truncate">{cat.name}</span>
          </button>
        ))}
      </div>

    </aside>
  );
};

export default Sidebar;
