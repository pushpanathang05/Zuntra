import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import MasonryFeed from '../components/MasonryFeed';
import { Settings, PenTool, X, CheckCircle, MapPin, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, updateUser: updateAuthUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [profileUser, setProfileUser] = useState(null);
  const [createdPins, setCreatedPins] = useState([]);
  const [savedPins, setSavedPins] = useState([]);
  const [likedPins, setLikedPins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Follow states
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Edit states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Read active tab from URL param or default to 'posts'
  const activeTab = searchParams.get('tab') || 'posts';

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/users/profile/${username}`);
      setProfileUser(data.user);
      setCreatedPins(data.createdPosts);
      setSavedPins(data.savedPosts);
      setLikedPins(data.likedPosts || []);
      
      setFollowersCount(data.user.followers?.length || 0);
      if (currentUser) {
        setIsFollowing(data.user.followers?.some((f) => f._id === currentUser._id || f === currentUser._id) || false);
      }
      
      setEditBio(data.user.bio || '');
      setEditAvatar(data.user.avatar || '');
    } catch (err) {
      console.error('Error fetching profile user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [username, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) return navigate('/auth');
    try {
      setFollowLoading(true);
      const { data } = await API.put(`/users/${profileUser._id}/follow`);
      setIsFollowing(data.isFollowing);
      setFollowersCount(data.followersCount);
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      const { data } = await API.put('/users/profile', {
        bio: editBio,
        avatar: editAvatar,
      });

      setProfileUser((prev) => ({
        ...prev,
        bio: data.bio,
        avatar: data.avatar,
      }));
      updateAuthUser({ bio: data.bio, avatar: data.avatar });
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleTabChange = (tabName) => {
    searchParams.set('tab', tabName);
    setSearchParams(searchParams);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 animate-pulse flex flex-col items-center">
        <div className="w-full h-48 bg-[#18181b] rounded-3xl mb-8"></div>
        <div className="w-28 h-28 rounded-full bg-[#18181b] -mt-20 border-4 border-[#0f0f11] mb-6"></div>
        <div className="h-6 bg-[#18181b] rounded w-48 mb-3"></div>
        <div className="h-4 bg-[#18181b] rounded w-32 mb-10"></div>
        <div className="w-full h-80 bg-[#18181b]/50 rounded-3xl"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-24">
        <h3 className="text-xl font-bold text-white mb-2 font-display">User Not Found</h3>
        <button onClick={() => navigate('/')} className="text-violet-500 font-semibold hover:underline">
          Go back home
        </button>
      </div>
    );
  }

  const isSelf = currentUser && currentUser._id === profileUser._id;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col items-center relative">
      
      {/* Cover Image banner */}
      <div className="w-full h-44 md:h-52 rounded-[28px] overflow-hidden bg-gradient-to-r from-indigo-950/70 via-zinc-900 to-fuchsia-950/60 border border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent"></div>
      </div>

      {/* Avatar (overlapping Cover) */}
      <div className="relative -mt-16 md:-mt-20 mb-4.5 group">
        <img
          src={profileUser.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profileUser.username}`}
          alt={profileUser.username}
          className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-[#0f0f11] shadow-2xl bg-zinc-950"
        />
        {isSelf && (
          <button
            onClick={() => setShowEditModal(true)}
            className="absolute bottom-1 right-1 p-2 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white transition-all shadow-md cursor-pointer hover:scale-105"
            title="Edit Profile"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Creator Details */}
      <div className="flex flex-col items-center text-center max-w-lg mb-8">
        <h1 className="text-2xl font-extrabold text-white font-display tracking-tight flex items-center gap-1.5 justify-center">
          {profileUser.username}
          <CheckCircle className="w-4 h-4 text-violet-500 fill-current text-white" />
        </h1>
        <span className="text-zinc-550 text-xs font-medium font-sans mt-0.5">
          @{profileUser.username.toLowerCase()}
        </span>

        {/* Bio */}
        <p className="text-zinc-300 text-xs md:text-sm mt-3 font-sans leading-relaxed px-4">
          {profileUser.bio || (isSelf ? 'Designer | Photographer | Coffee lover ☕. Creating things that inspire.' : 'Creating things that inspire.')}
        </p>

        {/* Info Rows (Location) */}
        <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 mt-4 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-zinc-650" />
            San Francisco, CA
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#27272a]"></span>
          <span className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-zinc-650" />
            creative.io
          </span>
        </div>

        {/* Creator Stats */}
        <div className="flex items-center gap-6 text-xs font-semibold text-zinc-400 mt-5 border-t border-white/5 pt-4.5 w-full justify-center">
          <div className="flex flex-col items-center">
            <span className="text-white font-bold text-sm">{createdPins.length}</span>
            <span className="text-zinc-550 text-[10px] uppercase font-bold tracking-wider mt-0.5">Posts</span>
          </div>
          <span className="w-px h-6 bg-white/5"></span>
          <div className="flex flex-col items-center">
            <span className="text-white font-bold text-sm">{followersCount}</span>
            <span className="text-zinc-550 text-[10px] uppercase font-bold tracking-wider mt-0.5">Followers</span>
          </div>
          <span className="w-px h-6 bg-white/5"></span>
          <div className="flex flex-col items-center">
            <span className="text-white font-bold text-sm">{profileUser.following?.length || 0}</span>
            <span className="text-zinc-550 text-[10px] uppercase font-bold tracking-wider mt-0.5">Following</span>
          </div>
        </div>

        {/* Follow Button */}
        <div className="mt-6 flex items-center gap-3">
          {isSelf ? (
            <button
              onClick={() => setShowEditModal(true)}
              className="px-5 py-2 rounded-full bg-[#18181b] hover:bg-[#27272a] text-white font-semibold text-xs border border-[#27272a] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PenTool className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`px-7 py-2.5 rounded-full font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-lg ${
                isFollowing
                  ? 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-750'
                  : 'bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-750 hover:to-fuchsia-600 text-white shadow-violet-600/20'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full border-b border-white/5 flex justify-center gap-8 mb-8 relative z-10">
        {[
          { id: 'posts', label: 'Posts', count: createdPins.length },
          { id: 'saved', label: 'Saved', count: savedPins.length },
          { id: 'liked', label: 'Liked', count: likedPins.length },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className="py-3 text-[11px] font-extrabold tracking-wider uppercase relative transition-all cursor-pointer text-zinc-400 hover:text-white"
            >
              <span className="mr-1">{tab.label}</span>
              <span className="text-[10px] text-zinc-550 font-semibold bg-[#18181b] border border-white/5 px-1.5 py-0.5 rounded-md">
                {tab.count}
              </span>
              
              {/* Highlight bar with Framer layout transition */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Grid Canvas */}
      <div className="w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'posts' && (
              <MasonryFeed
                pins={createdPins}
                loading={false}
                onLikeToggle={(id, likes) => {
                  setCreatedPins((prev) => prev.map((p) => (p._id === id ? { ...p, likes } : p)));
                }}
              />
            )}
            {activeTab === 'saved' && (
              <MasonryFeed
                pins={savedPins}
                loading={false}
                onLikeToggle={(id, likes) => {
                  setSavedPins((prev) => prev.map((p) => (p._id === id ? { ...p, likes } : p)));
                }}
                onSaveToggle={(id, saved) => {
                  if (!saved) {
                    setSavedPins((prev) => prev.filter((p) => p._id !== id));
                  }
                }}
              />
            )}
            {activeTab === 'liked' && (
              <MasonryFeed
                pins={likedPins}
                loading={false}
                onLikeToggle={(id, likes) => {
                  // If we unlike a post on our Liked tab, remove it instantly from view!
                  if (isSelf && !likes.includes(currentUser._id)) {
                    setLikedPins((prev) => prev.filter((p) => p._id !== id));
                  } else {
                    setLikedPins((prev) => prev.map((p) => (p._id === id ? { ...p, likes } : p)));
                  }
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Edit Profile Settings Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6.5 relative shadow-2xl">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-[#27272a] text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold text-white mb-4.5 font-display tracking-tight">Edit Profile settings</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider font-sans">Avatar Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-zinc-700 text-xs focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600/35 transition-all"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider font-sans">Bio</label>
                <textarea
                  placeholder="Tell your story..."
                  rows={4}
                  maxLength={160}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-zinc-700 text-xs focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600/35 transition-all resize-none"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                />
                <span className="text-[10px] text-zinc-600 float-right mt-1 font-sans">
                  {editBio.length}/160 characters
                </span>
              </div>

              <button
                type="submit"
                disabled={saveLoading}
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-750 hover:to-fuchsia-600 text-white text-xs font-bold rounded-xl mt-6 cursor-pointer hover:scale-102 flex justify-center items-center gap-1.5"
              >
                {saveLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                ) : (
                  'Save changes'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
