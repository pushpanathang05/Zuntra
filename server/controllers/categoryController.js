import Category from '../models/Category.js';
import Post from '../models/Post.js';

// Helper to generate a URL-safe slug from a category name
export const generateSlug = (name) => {
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

// Convert a normalized name into Title Case for display (handles hyphens and spaces)
const titleCase = (raw) => {
  if (!raw) return '';
  return raw
    .toString()
    .replace(/-/g, ' ')
    .split(/\s+/)
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ')
    .trim();
};

// @desc    Get all categories (sorted by post count descending, with preview images)
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({})
      .sort({ postCount: -1, name: 1 })
      .lean();

    // Attach preview images of the latest posts in each category
    const categoriesWithPreviews = await Promise.all(
      categories.map(async (cat) => {
        const posts = await Post.find({ categories: cat.name })
          .select('image')
          .sort({ createdAt: -1 })
          .limit(3)
          .lean();

        // Provide a human-friendly display name (Title Case) while keeping
        // the normalized `name` (lowercase) for lookups.
        const displayName = titleCase(cat.name);

        return {
          ...cat,
          name: cat.name, // normalized name (keeps API compatibility)
          displayName,
          previews: posts.map((p) => p.image),
        };
      })
    );

    res.json(categoriesWithPreviews);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error retrieving categories' });
  }
};

// @desc    Create a new custom category manually
// @route   POST /api/categories
// @access  Private/Public (let's keep public or authenticated)
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const normalizedName = name.trim().toLowerCase();
    const slug = generateSlug(normalizedName);

    // Check if exists
    let category = await Category.findOne({ name: normalizedName });
    if (category) {
      return res.status(400).json({ message: 'Category already exists', category });
    }

    category = await Category.create({
      name: normalizedName,
      slug,
      postCount: 0,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error creating category' });
  }
};
