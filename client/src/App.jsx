import React, { useContext, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Home, Compass, Plus, MessageSquare, User } from 'lucide-react';

// Lazy load page components for code splitting & bundle optimization
const Feed = lazy(() => import('./pages/Feed'));
const Auth = lazy(() => import('./pages/Auth'));
const ExploreCategories = lazy(() => import('./pages/ExploreCategories'));
const PinDetail = lazy(() => import('./pages/PinDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Upload = lazy(() => import('./pages/Upload'));

// Shimmering Suspense Fallback Loader
const PageLoader = () => (
  <div className="min-h-[60vh] w-full flex items-center justify-center bg-[#0f0f11]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin"></div>
      <span className="text-zinc-550 text-xs font-semibold uppercase tracking-wider animate-pulse">
        Loading...
      </span>
    </div>
  </div>
);

// Helper component to guard private routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f11]">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// Bottom navigation bar for mobile viewports
const MobileNav = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path) => currentPath === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0f0f11]/85 backdrop-blur-xl border-t border-white/5 px-6 py-2 flex items-center justify-around">
      <Link
        to="/"
        className={`flex flex-col items-center justify-center p-1.5 transition-colors ${
          isActive('/') ? 'text-violet-500' : 'text-zinc-400'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[9px] font-medium mt-1">Home</span>
      </Link>

      <Link
        to="/explore"
        className={`flex flex-col items-center justify-center p-1.5 transition-colors ${
          isActive('/explore') ? 'text-violet-500' : 'text-zinc-400'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[9px] font-medium mt-1">Explore</span>
      </Link>

      {/* Floating Action Mobile trigger */}
      <Link
        to="/upload"
        className="w-10 h-10 -mt-5 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-violet-600/30 border-2 border-[#0f0f11] hover:scale-105 active:scale-95 transition-all"
      >
        <Plus className="w-5 h-5" />
      </Link>

      <button
        className="flex flex-col items-center justify-center p-1.5 text-zinc-400"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[9px] font-medium mt-1">Chat</span>
      </button>

      {user ? (
        <Link
          to={`/profile/${user.username}`}
          className={`flex flex-col items-center justify-center p-1.5 transition-colors ${
            isActive(`/profile/${user.username}`) ? 'text-violet-500' : 'text-zinc-400'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] font-medium mt-1">Profile</span>
        </Link>
      ) : (
        <Link
          to="/auth"
          className={`flex flex-col items-center justify-center p-1.5 transition-colors ${
            isActive('/auth') ? 'text-violet-500' : 'text-zinc-400'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] font-medium mt-1">Sign In</span>
        </Link>
      )}
    </nav>
  );
};

// Floating Action Button for quick upload on desktops (bottom-right)
const FloatingActionButton = () => {
  const { user } = useContext(AuthContext);
  if (!user) return null;
  
  return (
    <Link
      to="/upload"
      className="hidden md:flex fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white items-center justify-center shadow-lg shadow-violet-600/20 border border-white/10 transition-transform duration-300 hover:scale-110 active:scale-90"
      title="Create Pin"
    >
      <Plus className="w-5 h-5" />
    </Link>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0f0f11] text-zinc-100 flex flex-col font-sans selection:bg-violet-650/45 selection:text-white pb-16 md:pb-0">
          
          <Navbar />

          <div className="flex flex-1 relative">
            <Sidebar />

            <div className="flex-1 min-w-0">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Feed />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/explore" element={<ExploreCategories />} />
                  <Route path="/pin/:id" element={<PinDetail />} />
                  <Route path="/profile/:username" element={<Profile />} />
                  <Route
                    path="/upload"
                    element={
                      <ProtectedRoute>
                        <Upload />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </div>

          </div>

          <MobileNav />
          <FloatingActionButton />

        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
