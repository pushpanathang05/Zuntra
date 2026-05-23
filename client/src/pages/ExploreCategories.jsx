import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ArrowRight, Grid, Hash, RefreshCw } from 'lucide-react';
import API from '../api/axios';
import PinCard from '../components/PinCard';

const ExploreCategories = () => {
  const [searchParams] = useSearchParams();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection/filtered view states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Trending tags list (sample static trending tags from database contents)
  const trendingTags = ['minimal', 'architecture', 'modern', 'workspace', 'darkui', 'interior', 'aesthetic', 'design'];

  // Fetch categories on mount
  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const categoryQuery = searchParams.get('category');
    const tagQuery = searchParams.get('tag');

    if (categoryQuery) {
      handleCategorySelect(categoryQuery);
    } else if (tagQuery) {
      fetchPostsByTag(tagQuery);
    } else {
      loadCategories();
    }
  }, [searchParams]);

  // Fetch posts when category is selected (with pagination)
  const fetchPostsByCategory = async (categoryName, freshPage = 1) => {
    try {
      setPostsLoading(true);
      const { data } = await API.get(`/posts?category=${encodeURIComponent(categoryName)}&page=${freshPage}&limit=12`);
      if (freshPage === 1) {
        setFilteredPosts(data);
      } else {
        setFilteredPosts((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === 12);
      setPage(freshPage);
    } catch (err) {
      console.error('Error fetching posts for category:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  // Fetch posts when tag is selected
  const fetchPostsByTag = async (tagValue) => {
    try {
      setPostsLoading(true);
      setSelectedCategory(null);
      setSelectedTag(tagValue);
      const { data } = await API.get(`/posts/tag/${encodeURIComponent(tagValue)}`);
      setFilteredPosts(data);
      setHasMore(false); // Tag endpoint does not paginate in simple controller
    } catch (err) {
      console.error('Error fetching posts for tag:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleCategorySelect = (catName) => {
    setSelectedTag(null);
    setSelectedCategory(catName);
    fetchPostsByCategory(catName, 1);
  };

  const handleLoadMore = () => {
    if (selectedCategory) {
      fetchPostsByCategory(selectedCategory, page + 1);
    }
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setFilteredPosts([]);
    loadCategories(); // Reload statistics
  };

  const getPinThumbnailSrc = (imgUrl) => {
    if (!imgUrl) return '';
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://') || imgUrl.startsWith('data:')) {
      return imgUrl;
    }
    return `http://localhost:5000${imgUrl}`;
  };

  // Filter categories by search query
  const filteredCategories = categories.filter((cat) =>
    (cat.displayName || cat.name).toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 min-h-[calc(100vh-70px)] bg-[#0f0f11] text-white">
      <AnimatePresence mode="wait">
        {!selectedCategory && !selectedTag ? (
          // MAIN CATEGORIES VIEW
          <motion.div
            key="grid-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-10"
          >
            {/* Header section with Search bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-white/5">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold font-display bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                  Explore Topics
                </h1>
                <p className="text-zinc-500 text-xs mt-1">
                  Discover inspiration across design, development, and lifestyle.
                </p>
              </div>

              {/* Search Bar input */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-550" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#18181b] border border-white/5 text-white text-xs placeholder-zinc-650 focus:border-violet-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Trending Tags Section */}
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold text-zinc-650 uppercase tracking-widest block">
                Trending Tags
              </span>
              <div className="flex flex-wrap gap-2.5">
                {trendingTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => fetchPostsByTag(tag)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-zinc-950 border border-white/5 hover:border-violet-500/30 text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer transition-all hover:scale-105"
                  >
                    <Hash className="w-3.5 h-3.5 text-zinc-550" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Cards Grid */}
            <div className="space-y-4">
              <span className="text-[10px] font-extrabold text-zinc-650 uppercase tracking-widest block">
                All Categories
              </span>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-[1.5] rounded-3xl bg-zinc-950 border border-white/5 animate-pulse"></div>
                  ))}
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="py-20 text-center text-zinc-500 text-sm italic">
                  No matching categories found.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCategories.map((cat) => (
                    <motion.div
                      key={cat._id}
                      whileHover={{ y: -6, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)' }}
                      onClick={() => handleCategorySelect(cat.name)}
                      className="group relative overflow-hidden bg-zinc-950/40 border border-white/5 rounded-3xl p-4 cursor-pointer select-none"
                    >
                      {/* Image Collage Previews */}
                      <div className="grid grid-cols-3 gap-1.5 aspect-[2] rounded-2xl overflow-hidden mb-4 bg-zinc-900/50">
                        {cat.previews && cat.previews.length > 0 ? (
                          cat.previews.map((img, index) => (
                            <img
                              key={index}
                              src={getPinThumbnailSrc(img)}
                              alt=""
                              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                                cat.previews.length === 1 ? 'col-span-3' : 
                                cat.previews.length === 2 && index === 0 ? 'col-span-2' : ''
                              }`}
                            />
                          ))
                        ) : (
                          // Premium geometric placeholder if category has no pins
                          <div className="col-span-3 flex items-center justify-center bg-[#18181b] border-2 border-dashed border-white/5">
                            <Grid className="w-8 h-8 text-zinc-700" />
                          </div>
                        )}
                      </div>

                      {/* Header details */}
                      <div className="flex items-center justify-between mt-2 px-1">
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-violet-400 capitalize transition-colors">
                            {cat.displayName || cat.name}
                          </h3>
                          <span className="text-[10px] text-zinc-550">
                            {cat.postCount} pins published
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#18181b] border border-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-violet-650 group-hover:text-white group-hover:border-transparent transition-all group-hover:scale-105">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          // FILTERED CATEGORY/TAG FEED
          <motion.div
            key="feed-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Header controls */}
            <div className="flex items-center justify-between pb-5 border-b border-white/5">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Topics
              </button>

              <div className="text-right">
                <span className="text-[10px] font-extrabold text-zinc-650 uppercase tracking-widest block">
                  {selectedTag ? 'Filtered by Tag' : 'Filtered by Category'}
                </span>
                <h1 className="text-lg md:text-xl font-extrabold font-display text-white capitalize">
                  {selectedTag ? `#${selectedTag}` : selectedCategory}
                </h1>
              </div>
            </div>

            {/* Posts Grid Masonry */}
            {postsLoading && filteredPosts.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-zinc-950 border border-white/5 rounded-3xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="py-24 text-center text-zinc-500 text-sm italic">
                No posts found under this topic yet.
              </div>
            ) : (
              <div className="space-y-10">
                <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
                  {filteredPosts.map((post) => (
                    <PinCard key={post._id} post={post} />
                  ))}
                </div>

                {/* Infinite scroll load more trigger */}
                {hasMore && selectedCategory && (
                  <div className="flex justify-center pt-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={postsLoading}
                      className="px-6 py-2.5 rounded-xl border border-zinc-800 hover:bg-[#18181b] text-zinc-400 hover:text-white text-xs font-bold cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {postsLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        'Load More Content'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExploreCategories;
