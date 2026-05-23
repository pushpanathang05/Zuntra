import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import MasonryFeed from '../components/MasonryFeed';
import { Heart, Bookmark, ArrowLeft, Send, Trash2, MoreHorizontal, UploadCloud } from 'lucide-react';
import confetti from 'canvas-confetti';

const PinDetail = () => {
  const { id } = useParams();
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [pin, setPin] = useState(null);
  const [relatedPins, setRelatedPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const fetchPinDetail = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/posts/${id}`);
      setPin(data);

      if (user) {
        setIsLiked(data.likes?.includes(user._id) || false);
        setIsSaved(user.savedPosts?.includes(data._id) || false);
        setIsFollowing(data.user?.followers?.includes(user._id) || false);
      }
      setFollowersCount(data.user?.followers?.length || 0);

      // Fetch related pins using the smart scoring endpoint
      try {
        const { data: relatedData } = await API.get(`/posts/${id}/related`);
        setRelatedPins(relatedData);
      } catch (err) {
        console.error('Error fetching related pins:', err);
      }
    } catch (err) {
      console.error('Error fetching pin details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPinDetail();
  }, [id, user]);

  const handleLike = async (e) => {
    if (!user) return navigate('/auth');

    const originalLiked = isLiked;
    const originalLikesList = [...(pin.likes || [])];

    setIsLiked(!originalLiked);
    const updatedLikesList = originalLiked
      ? originalLikesList.filter((userId) => userId !== user._id)
      : [...originalLikesList, user._id];
    setPin((prev) => ({ ...prev, likes: updatedLikesList }));

    if (!originalLiked) {
      confetti({
        particleCount: 25,
        spread: 35,
        colors: ['#a78bfa', '#c084fc', '#f472b6'],
      });
    }

    try {
      const { data } = await API.put(`/posts/${pin._id}/like`);
      setIsLiked(data.liked);
      setPin((prev) => ({ ...prev, likes: data.likes }));
    } catch (err) {
      console.error('Optimistic like failed, rolling back:', err);
      setIsLiked(originalLiked);
      setPin((prev) => ({ ...prev, likes: originalLikesList }));
    }
  };

  const handleSave = async (e) => {
    if (!user) return navigate('/auth');

    const originalSaved = isSaved;
    const originalSavedList = [...(user.savedPosts || [])];

    setIsSaved(!originalSaved);
    const updatedSavedList = originalSaved
      ? originalSavedList.filter((postId) => postId !== pin._id)
      : [...originalSavedList, pin._id];
    updateUser({ savedPosts: updatedSavedList });

    if (!originalSaved) {
      confetti({
        particleCount: 40,
        spread: 45,
        colors: ['#7c3aed', '#a78bfa', '#f472b6'],
      });
    }

    try {
      const { data } = await API.put(`/posts/${pin._id}/save`);
      setIsSaved(data.saved);
      updateUser({ savedPosts: data.savedPosts });
    } catch (err) {
      console.error('Optimistic save failed, rolling back:', err);
      setIsSaved(originalSaved);
      updateUser({ savedPosts: originalSavedList });
    }
  };

  const handleFollow = async () => {
    if (!user) return navigate('/auth');

    const originalFollowing = isFollowing;
    const originalCount = followersCount;

    setIsFollowing(!originalFollowing);
    setFollowersCount((prev) => (originalFollowing ? prev - 1 : prev + 1));

    try {
      const { data } = await API.put(`/users/${pin.user._id}/follow`);
      setIsFollowing(data.isFollowing);
      setFollowersCount(data.followersCount);
    } catch (err) {
      console.error('Optimistic follow failed, rolling back:', err);
      setIsFollowing(originalFollowing);
      setFollowersCount(originalCount);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/auth');
    if (!commentText.trim()) return;

    try {
      setCommentLoading(true);
      const { data } = await API.post(`/posts/${pin._id}/comments`, {
        content: commentText.trim(),
      });
      setPin((prev) => ({
        ...prev,
        comments: [data, ...prev.comments],
      }));
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeletePin = async () => {
    if (!window.confirm('Are you sure you want to delete this pin?')) return;
    try {
      await API.delete(`/posts/${pin._id}`);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const getOptimizedImageSrc = (imgUrl) => {
    if (!imgUrl) return '';
    let finalUrl = imgUrl;

    if (!imgUrl.startsWith('http://') && !imgUrl.startsWith('https://') && !imgUrl.startsWith('data:')) {
      finalUrl = `http://localhost:5000${imgUrl}`;
    }

    if (finalUrl.includes('cloudinary.com') && finalUrl.includes('/upload/')) {
      return finalUrl.replace('/upload/', '/upload/w_1000,q_auto,f_auto/');
    }

    return finalUrl;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 animate-pulse">
        <div className="h-6 bg-[#18181b] rounded w-24 mb-6"></div>
        <div className="bg-[#18181b]/50 border border-white/5 rounded-3xl overflow-hidden flex flex-col md:flex-row gap-8 p-6 min-h-[500px]">
          <div className="w-full md:w-1/2 rounded-2xl bg-zinc-950 min-h-[300px]"></div>
          <div className="w-full md:w-1/2 flex flex-col gap-6 justify-between">
            <div className="space-y-4">
              <div className="h-4 bg-zinc-900 rounded w-1/4"></div>
              <div className="h-8 bg-zinc-900 rounded w-3/4"></div>
              <div className="h-20 bg-zinc-900 rounded w-full"></div>
            </div>
            <div className="h-12 bg-zinc-900 rounded-full w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!pin) {
    return (
      <div className="text-center py-24">
        <h3 className="text-xl font-bold text-white mb-2 font-display">Pin Not Found</h3>
        <button onClick={() => navigate('/')} className="text-violet-500 font-semibold hover:underline cursor-pointer">
          Go back home
        </button>
      </div>
    );
  }

  const isOwner = user && user._id === pin.user?._id;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-12">
      
      <div className="bg-[#18181b]/60 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[620px] relative">
        
        <div className="w-full md:w-1/2 bg-black/40 flex flex-col justify-between relative min-h-[400px]">
          
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors pointer-events-auto cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors pointer-events-auto cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <img
            src={getOptimizedImageSrc(pin.image)}
            alt={pin.title}
            className="w-full h-full object-contain max-h-[70vh] md:max-h-[80vh] p-2 flex-1"
          />

          <div className="p-4 border-t border-white/5 flex items-center justify-between gap-4 bg-zinc-950/40 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] flex items-center justify-center text-zinc-300 transition-colors cursor-pointer">
                <UploadCloud className="w-4 h-4" />
              </button>

              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-4.5 py-2 rounded-full border text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                  isLiked
                    ? 'bg-violet-650/10 border-violet-500/35 text-violet-400'
                    : 'bg-[#18181b] border-[#27272a] text-zinc-300 hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{pin.likes?.length || 0}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {isOwner && (
                <button
                  onClick={handleDeletePin}
                  className="p-2 rounded-full hover:bg-red-950/30 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete Pin"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleSave}
                className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-lg ${
                  isSaved
                    ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-750 hover:to-fuchsia-600 text-white shadow-violet-600/10'
                }`}
              >
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-between p-6 md:p-9 border-t md:border-t-0 md:border-l border-white/5 bg-[#0e0e11]/90">
          
          <div className="flex-1 overflow-y-auto pr-1">
            
            <div className="flex items-center justify-between gap-4 mb-6">
              <Link to={`/profile/${pin.user?.username}`} className="flex items-center gap-3">
                <img
                  src={pin.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${pin.user?.username}`}
                  alt={pin.user?.username}
                  className="w-10 h-10 rounded-full object-cover border border-[#27272a] bg-zinc-950"
                />
                <div className="flex flex-col">
                  <span className="text-white text-sm font-bold hover:underline">
                    {pin.user?.username}
                  </span>
                  <span className="text-zinc-550 text-[10px] font-semibold">
                    {followersCount} followers
                  </span>
                </div>
              </Link>

              {user?._id !== pin.user?._id && (
                <button
                  onClick={handleFollow}
                  className={`px-4.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                    isFollowing
                      ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      : 'bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-750 hover:to-fuchsia-600 text-white'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-extrabold text-white font-display mb-3 leading-snug">
              {pin.title}
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed mb-6 whitespace-pre-wrap font-sans">
              {pin.description || 'No description provided.'}
            </p>

            {/* Dynamic tag categories rendering */}
            {pin.categories && pin.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 select-none">
                {pin.categories.map((cat, i) => (
                  <span
                    key={i}
                    onClick={() => navigate(`/explore?category=${encodeURIComponent(cat)}`)}
                    className="px-3 py-1 rounded-full bg-[#18181b] hover:bg-[#27272a]/80 cursor-pointer border border-white/5 text-zinc-300 text-[10px] font-bold transition-colors"
                  >
                    🏷️ {cat}
                  </span>
                ))}
              </div>
            )}

            {/* Searchable Hashtags rendering */}
            {pin.tags && pin.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 select-none">
                {pin.tags.map((tag, i) => (
                  <span
                    key={i}
                    onClick={() => navigate(`/explore?tag=${encodeURIComponent(tag)}`)}
                    className="px-3 py-1 rounded-xl bg-violet-600/5 hover:bg-violet-650/15 cursor-pointer border border-violet-500/10 text-violet-400 text-[10px] font-bold transition-colors"
                  >
                    # {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="h-px bg-white/5 w-full mb-6"></div>

            <h3 className="text-sm font-bold text-white font-display mb-4">
              Comments ({pin.comments?.length || 0})
            </h3>

            <div className="space-y-4 max-h-[190px] overflow-y-auto pr-1">
              {!pin.comments || pin.comments.length === 0 ? (
                <p className="text-zinc-650 text-xs py-4 text-center italic">
                  No comments yet. Add a comment to start the discussion!
                </p>
              ) : (
                pin.comments.map((comment) => (
                  <div key={comment._id} className="flex items-start gap-3 text-sm group">
                    <Link to={`/profile/${comment.user?.username}`}>
                      <img
                        src={comment.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${comment.user?.username}`}
                        alt={comment.user?.username}
                        className="w-7.5 h-7.5 rounded-full object-cover border border-zinc-800 bg-zinc-950 mt-0.5"
                      />
                    </Link>
                    <div className="flex-1 bg-[#18181b] border border-white/5 rounded-2xl px-3.5 py-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <Link to={`/profile/${comment.user?.username}`} className="text-white text-xs font-bold hover:underline">
                          {comment.user?.username}
                        </Link>
                        <span className="text-[9px] text-zinc-550 font-medium">
                          {new Date(comment.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-zinc-300 text-xs leading-normal font-sans">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          <div className="pt-4 border-t border-white/5 mt-4">
            {user ? (
              <form onSubmit={handlePostComment} className="flex gap-2 relative">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-3 rounded-full bg-[#18181b] border border-white/10 text-white placeholder-zinc-600 text-xs focus:border-violet-600 focus:outline-none transition-all pr-12"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={300}
                />
                <button
                  type="submit"
                  disabled={commentLoading || !commentText.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-750 hover:to-fuchsia-600 text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer scale-100 active:scale-95"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>
            ) : (
              <div className="text-center bg-[#18181b]/30 border border-white/5 rounded-xl py-3.5 text-xs text-zinc-400">
                Please{' '}
                <Link to="/auth" className="text-violet-500 font-semibold hover:underline">
                  Sign In
                </Link>{' '}
                to leave a comment.
              </div>
            )}
          </div>

        </div>

      </div>

      <div className="flex flex-col gap-6 mt-4">
        <div className="h-px bg-white/5 w-full"></div>
        <h2 className="text-lg md:text-xl font-bold font-display text-white">
          More like this
        </h2>
        <div className="mt-2">
          <MasonryFeed
            pins={relatedPins}
            loading={false}
          />
        </div>
      </div>

    </div>
  );
};

export default PinDetail;
