import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import MasonryFeed from '../components/MasonryFeed';
import { ChevronRight } from 'lucide-react';

const DEFAULT_CATEGORIES = ['For you', 'Following'];

const Feed = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pins, setPins] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('For you');

  const searchQuery = searchParams.get('search') || '';
  const queryCategory = searchParams.get('category') || '';

  // Fetch unique categories dynamically from DB posts
  const fetchCategoriesList = async () => {
    try {
      const { data } = await API.get('/posts/categories');
      setCategories([...DEFAULT_CATEGORIES, ...data]);
    } catch (err) {
      console.error('Error fetching categories list:', err);
    }
  };

  // Sync category state with query parameter
  useEffect(() => {
    if (queryCategory) {
      setSelectedCategory(queryCategory);
    } else {
      setSelectedCategory('For you');
    }
  }, [queryCategory]);

  const fetchPins = async () => {
    try {
      setLoading(true);
      const params = {};
      
      // If category is not "For you" or "Following", filter feed
      if (selectedCategory && !DEFAULT_CATEGORIES.includes(selectedCategory)) {
        params.category = selectedCategory;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const { data } = await API.get('/posts', { params });
      setPins(data);
    } catch (err) {
      console.error('Error fetching feed pins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesList();
  }, []);

  useEffect(() => {
    fetchPins();
  }, [selectedCategory, searchQuery]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (DEFAULT_CATEGORIES.includes(category)) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    searchParams.delete('search');
    setSearchParams(searchParams);
  };

  return (
    <div className="px-6 md:px-10 py-6 max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* Dynamic Categories Row */}
      <div className="flex items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2.5 scrollbar-none flex-1 select-none">
          {categories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-6 py-2 rounded-full font-semibold text-xs md:text-sm tracking-wide transition-all whitespace-nowrap cursor-pointer hover:scale-102 active:scale-98 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-600/20'
                    : 'bg-[#18181b] border border-[#27272a]/60 text-zinc-400 hover:text-zinc-200 hover:bg-[#27272a]/40'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <button className="w-8 h-8 rounded-full bg-[#18181b] border border-[#27272a] hidden sm:flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Query Title Banner */}
      {searchQuery && (
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-zinc-550 text-xs font-semibold uppercase tracking-wider">Search results for:</span>
          <h2 className="text-xl md:text-2xl font-bold font-display text-white">
            "{searchQuery}"
          </h2>
        </div>
      )}

      {/* Masonry Feed */}
      <div className="mt-3">
        <MasonryFeed
          pins={pins}
          loading={loading}
          onLikeToggle={(id, likes) => {
            setPins((prev) =>
              prev.map((p) => (p._id === id ? { ...p, likes } : p))
            );
          }}
        />
      </div>

    </div>
  );
};

export default Feed;
