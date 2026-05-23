import React, { useContext, useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { Heart, MessageSquare, Bookmark, MoreHorizontal } from 'lucide-react';
import confetti from 'canvas-confetti';

const PinCard = memo(({ pin, onSaveToggle, onLikeToggle }) => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Primary states
  const [likesCount, setLikesCount] = useState(pin.likes?.length || 0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Sync state with props and user session
  useEffect(() => {
    if (user) {
      setIsLiked(pin.likes?.includes(user._id) || false);
      setIsSaved(user.savedPosts?.includes(pin._id) || false);
    }
    setLikesCount(pin.likes?.length || 0);
    setCommentsCount(pin.comments?.length || 0);
  }, [pin, user]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }

    // Cache original values for rollback on API failure
    const originalLiked = isLiked;
    const originalCount = likesCount;

    // 1. OPTIMISTIC UPDATE: Update UI immediately
    setIsLiked(!originalLiked);
    setLikesCount((prev) => (originalLiked ? prev - 1 : prev + 1));

    if (!originalLiked) {
      // Fire confetti celebration instantly
      confetti({
        particleCount: 20,
        spread: 30,
        origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
        colors: ['#a78bfa', '#c084fc', '#f472b6'],
      });
    }

    // 2. Perform API call in background
    try {
      const { data } = await API.put(`/posts/${pin._id}/like`);
      // Sync back with database counts to ensure consistency
      setIsLiked(data.liked);
      setLikesCount(data.likes.length);

      if (onLikeToggle) {
        onLikeToggle(pin._id, data.likes);
      }
    } catch (err) {
      console.error('Optimistic like failed, rolling back:', err);
      // Revert state on error
      setIsLiked(originalLiked);
      setLikesCount(originalCount);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }

    // Cache original values for rollback
    const originalSaved = isSaved;
    const originalSavedList = [...(user.savedPosts || [])];

    // 1. OPTIMISTIC UPDATE
    setIsSaved(!originalSaved);
    
    // Update global user context immediately
    const updatedSaves = originalSaved
      ? originalSavedList.filter((id) => id !== pin._id)
      : [...originalSavedList, pin._id];
    updateUser({ savedPosts: updatedSaves });

    if (!originalSaved) {
      confetti({
        particleCount: 40,
        spread: 45,
        origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
        colors: ['#7c3aed', '#a78bfa', '#f472b6'],
      });
    }

    // 2. Background API Call
    try {
      const { data } = await API.put(`/posts/${pin._id}/save`);
      setIsSaved(data.saved);
      updateUser({ savedPosts: data.savedPosts });

      if (onSaveToggle) {
        onSaveToggle(pin._id, data.saved);
      }
    } catch (err) {
      console.error('Optimistic save failed, rolling back:', err);
      // Revert state
      setIsSaved(originalSaved);
      updateUser({ savedPosts: originalSavedList });
    }
  };

  const handleCardClick = () => {
    navigate(`/pin/${pin._id}`);
  };

  // Inject Cloudinary optimization tags dynamically
  const getOptimizedImageSrc = (imgUrl) => {
    if (!imgUrl) return '';
    let finalUrl = imgUrl;

    if (!imgUrl.startsWith('http://') && !imgUrl.startsWith('https://') && !imgUrl.startsWith('data:')) {
      finalUrl = `http://localhost:5000${imgUrl}`;
    }

    // Look for Cloudinary asset upload URL pattern
    if (finalUrl.includes('cloudinary.com') && finalUrl.includes('/upload/')) {
      return finalUrl.replace('/upload/', '/upload/w_600,q_auto,f_auto/');
    }

    return finalUrl;
  };

  return (
    <div
      onClick={handleCardClick}
      className="break-inside-avoid mb-6 group relative rounded-3xl overflow-hidden bg-[#18181b] border border-[#27272a]/30 cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgba(124,58,237,0.12)] hover:-translate-y-1 hover:border-[#27272a]"
    >
      <img
        src={getOptimizedImageSrc(pin.image)}
        alt={pin.title}
        className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 bg-zinc-950"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4.5 z-10">
        
        <div className="flex justify-end w-full">
          <button
            onClick={handleSave}
            className={`px-4.5 py-2 rounded-full font-semibold text-[11px] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1 shadow-md ${
              isSaved
                ? 'bg-zinc-800/85 text-zinc-300 border border-zinc-700/60'
                : 'bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-750 hover:to-fuchsia-600 text-white shadow-violet-600/10'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          <h3 className="text-white font-bold text-sm leading-snug font-display line-clamp-1">
            {pin.title}
          </h3>

          <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-2.5">
            <Link
              to={`/profile/${pin.user?.username}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 hover:opacity-90 max-w-[50%]"
            >
              <img
                src={pin.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${pin.user?.username}`}
                alt={pin.user?.username}
                className="w-6.5 h-6.5 rounded-full object-cover border border-zinc-800 bg-zinc-950 shrink-0"
              />
              <span className="text-zinc-200 text-xs font-semibold truncate">
                {pin.user?.username}
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[10px] font-semibold transition-all hover:scale-105 cursor-pointer ${
                  isLiked
                    ? 'bg-violet-600/10 border-violet-500/35 text-violet-400'
                    : 'bg-zinc-950/80 border-[#27272a] text-zinc-400 hover:text-white'
                }`}
              >
                <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likesCount}</span>
              </button>

              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-[#27272a] bg-zinc-950/80 text-[10px] font-semibold text-zinc-400">
                <MessageSquare className="w-3 h-3" />
                <span>{commentsCount}</span>
              </div>

              <div className="p-1.5 rounded-full bg-zinc-950/80 border border-[#27272a] text-zinc-400 hover:text-white transition-all hover:scale-105">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

PinCard.displayName = 'PinCard';

export default PinCard;
