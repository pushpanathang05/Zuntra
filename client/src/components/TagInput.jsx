import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hash } from 'lucide-react';

const TagInput = ({ selectedTags, onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = (value) => {
    const cleanTag = value
      .trim()
      .toLowerCase()
      .replace(/^#/, '') // Strip leading hash
      .replace(/[^\w]/g, ''); // Remove non-alphanumeric chars

    if (cleanTag && !selectedTags.includes(cleanTag)) {
      onChange([...selectedTags, cleanTag]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // Remove last tag if input is empty
      onChange(selectedTags.slice(0, -1));
    }
  };

  const handleRemove = (tagToRemove) => {
    onChange(selectedTags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="space-y-3">
      <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
        Searchable Tags (Hashtags / Keywords)
      </label>

      {/* Selected tags + input container */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-[#18181b] border border-[#27272a] focus-within:border-violet-600 transition-all min-h-[44px]">
        <AnimatePresence>
          {selectedTags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/50"
            >
              <Hash className="w-3 h-3 text-zinc-500" />
              {tag}
              <button
                type="button"
                onClick={() => handleRemove(tag)}
                className="hover:bg-white/10 rounded p-0.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        <input
          type="text"
          placeholder={selectedTags.length > 0 ? "Add tag..." : "e.g. minimal, UI, darkmode"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => handleAddTag(inputValue)}
          className="flex-1 min-w-[120px] bg-transparent text-white text-xs placeholder-zinc-650 focus:outline-none py-0.5"
        />
      </div>
      <p className="text-[10px] text-zinc-550 leading-normal font-sans">
        Press <kbd className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-400">Enter</kbd> or <kbd className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-400">comma</kbd> to separate tags.
      </p>
    </div>
  );
};

export default TagInput;
