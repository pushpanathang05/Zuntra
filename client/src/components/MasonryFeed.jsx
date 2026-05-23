import React from 'react';
import PinCard from './PinCard';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      mass: 0.8
    }
  }
};

const MasonryFeed = ({ pins, loading, onSaveToggle, onLikeToggle }) => {
  if (loading) {
    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 w-full">
        {Array.from({ length: 8 }).map((_, index) => {
          const heights = ['h-64', 'h-80', 'h-96', 'h-72', 'h-90'];
          const randomHeight = heights[index % heights.length];
          return (
            <div
              key={index}
              className={`break-inside-avoid mb-6 w-full rounded-3xl bg-[#18181b] border border-[#27272a]/30 p-5 flex flex-col justify-end gap-3.5 ${randomHeight} animate-pulse relative overflow-hidden`}
            >
              {/* Shimmer pulse effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]"></div>

              <div className="h-4 bg-zinc-800 rounded w-2/3"></div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-zinc-800"></div>
                  <div className="h-3 bg-zinc-800 rounded w-16"></div>
                </div>
                <div className="w-14 h-7 bg-zinc-800 rounded-full"></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (!pins || pins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center mb-5 text-zinc-500 shadow-xl">
          🔍
        </div>
        <h3 className="text-xl font-bold text-white mb-2 font-display">No Results Found</h3>
        <p className="text-zinc-400 text-sm max-w-sm font-sans leading-relaxed">
          We couldn't find any pins matching your criteria. Try adjusting your search query or explore categories!
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 w-full"
    >
      {pins.map((pin) => (
        <motion.div
          key={pin._id}
          variants={itemVariants}
          className="break-inside-avoid"
        >
          <PinCard
            pin={pin}
            onSaveToggle={onSaveToggle}
            onLikeToggle={onLikeToggle}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MasonryFeed;
