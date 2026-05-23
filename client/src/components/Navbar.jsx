import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Compass, Search, MessageSquare, LogOut } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();

  const urlSearchQuery = searchParams.get('search') || '';

  // Synchronize input value with URL search keyword
  useEffect(() => {
    setSearchVal(urlSearchQuery);
  }, [urlSearchQuery]);

  // Debounce the typed input
  const debouncedSearchVal = useDebounce(searchVal, 400);

  // Automatically update URL search query parameter when debounced value changes (Live search)
  useEffect(() => {
    if (debouncedSearchVal.trim() !== urlSearchQuery.trim()) {
      if (debouncedSearchVal.trim()) {
        navigate(`/?search=${encodeURIComponent(debouncedSearchVal.trim())}`);
      } else if (urlSearchQuery) {
        navigate('/');
      }
    }
  }, [debouncedSearchVal, navigate, urlSearchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleClearSearch = () => {
    setSearchVal('');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 px-4 md:px-8 py-3.5 flex items-center justify-between gap-6 bg-[#0f0f11]/70 backdrop-blur-xl border-b border-white/5">
      
      <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-xl tracking-tight select-none shrink-0">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-600/10">
          <Compass className="w-4.5 h-4.5 text-white" />
        </div>
        <span className="font-display font-semibold text-lg hidden sm:inline text-white">Pinspire</span>
      </Link>

      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search for inspiration..."
          className="w-full pl-11 pr-12 py-2.5 rounded-full bg-[#18181b] border border-[#27272a] text-white placeholder-zinc-500 text-sm focus:border-violet-600 focus:ring-1 focus:ring-violet-600/35 focus:outline-none transition-all duration-200"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
        />
        {searchVal && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs font-semibold"
          >
            Clear
          </button>
        )}
      </form>

      <div className="flex items-center gap-4 shrink-0">
        {user ? (
          <>
            {/* Interactive Notification Dropdown */}
            <NotificationDropdown />

            {/* Messages Chat bubble */}
            <button className="w-9 h-9 rounded-full bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer">
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* Profile trigger */}
            <Link
              to={`/profile/${user.username}`}
              className="flex items-center gap-2 pl-1 pr-1 py-1 md:pr-3.5 rounded-full bg-[#18181b] border border-[#27272a] hover:border-zinc-700 hover:bg-zinc-900 transition-colors"
            >
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`}
                alt={user.username}
                className="w-7 h-7 rounded-full object-cover bg-zinc-950 border border-[#27272a]"
              />
              <span className="hidden md:inline text-xs font-bold text-zinc-300">
                {user.username}
              </span>
            </Link>

            {/* Log Out button */}
            <button
              onClick={() => {
                logout();
                navigate('/auth');
              }}
              className="w-9 h-9 rounded-full bg-[#18181b]/50 hover:bg-red-950/20 hover:border-red-900/40 hover:text-red-400 text-zinc-500 border border-[#27272a] flex items-center justify-center transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-750 hover:to-fuchsia-600 text-white text-xs font-bold shadow-lg shadow-violet-650/20 transition-all hover:scale-102 cursor-pointer"
          >
            Sign In
          </Link>
        )}
      </div>

    </nav>
  );
};

export default Navbar;
