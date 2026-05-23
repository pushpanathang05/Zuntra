import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Plus } from 'lucide-react';
import API from '../api/axios';

const CategorySelector = ({ selectedCategories, onChange }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef(null);

  // Fetch global categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/categories');
        setSuggestions(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Filter suggestions based on query and already selected categories
  useEffect(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = suggestions.filter(
      (cat) =>
        cat.name.toLowerCase().includes(normalizedQuery) &&
        !selectedCategories.includes(cat.name)
    );
    setFilteredSuggestions(filtered);
    setActiveIndex(-1);
  }, [query, suggestions, selectedCategories]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (categoryName) => {
    const normalized = categoryName.trim().toLowerCase();
    if (normalized && !selectedCategories.includes(normalized)) {
      onChange([...selectedCategories, normalized]);
    }
    setQuery('');
    setIsOpen(false);
  };

  const handleRemove = (catToRemove) => {
    onChange(selectedCategories.filter((cat) => cat !== catToRemove));
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    const showCreateOption =
      query.trim() !== '' &&
      !suggestions.some((cat) => cat.name.toLowerCase() === query.trim().toLowerCase()) &&
      !selectedCategories.includes(query.trim().toLowerCase());

    const totalSuggestions = filteredSuggestions.length + (showCreateOption ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % totalSuggestions);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + totalSuggestions) % totalSuggestions);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredSuggestions.length) {
        handleSelect(filteredSuggestions[activeIndex].name);
      } else if (activeIndex === filteredSuggestions.length && showCreateOption) {
        handleSelect(query);
      } else if (query.trim() !== '') {
        handleSelect(query);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const showCreateOption =
    query.trim() !== '' &&
    !suggestions.some((cat) => cat.name.toLowerCase() === query.trim().toLowerCase()) &&
    !selectedCategories.includes(query.trim().toLowerCase());

  return (
    <div className="space-y-3" ref={dropdownRef}>
      <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
        Categories (Choose multiple or create custom)
      </label>

      {/* Selected pills wrap */}
      <div className="flex flex-wrap gap-2 min-h-[38px] p-1.5 rounded-xl bg-zinc-950/40 border border-white/5">
        <AnimatePresence>
          {selectedCategories.map((cat) => (
            <motion.span
              key={cat}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              layout
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-violet-600/20 to-fuchsia-500/20 text-white border border-violet-500/30 hover:border-violet-500/60 transition-colors"
            >
              #{cat}
              <button
                type="button"
                onClick={() => handleRemove(cat)}
                className="hover:bg-white/10 rounded-full p-0.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        {selectedCategories.length === 0 && (
          <span className="text-zinc-600 text-xs py-1 px-2 italic select-none">
            No categories selected
          </span>
        )}
      </div>

      {/* Input drop field wrapper */}
      <div className="relative">
        <input
          type="text"
          placeholder="Type to search or create categories..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-white text-xs placeholder-zinc-600 focus:border-violet-600 focus:outline-none transition-all"
        />
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />

        {/* Dropdown menu */}
        <AnimatePresence>
          {isOpen && (filteredSuggestions.length > 0 || showCreateOption) && (
            <motion.ul
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute z-50 w-full mt-2 bg-[#18181b] border border-white/5 rounded-2xl max-h-56 overflow-y-auto shadow-2xl p-1"
            >
              {filteredSuggestions.map((cat, idx) => (
                <li
                  key={cat._id}
                  onClick={() => handleSelect(cat.name)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                    idx === activeIndex
                      ? 'bg-violet-600 text-white'
                      : 'text-zinc-300 hover:bg-zinc-950 hover:text-white'
                  }`}
                >
                  <span>{cat.displayName || cat.name}</span>
                  <span className="text-[10px] text-zinc-550 italic font-normal">
                    {cat.postCount} pins
                  </span>
                </li>
              ))}

              {showCreateOption && (
                <li
                  onClick={() => handleSelect(query)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                    activeIndex === filteredSuggestions.length
                      ? 'bg-violet-600 text-white'
                      : 'text-violet-400 hover:bg-violet-600/10 hover:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create new category: "{query.trim().toLowerCase()}"</span>
                </li>
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CategorySelector;
