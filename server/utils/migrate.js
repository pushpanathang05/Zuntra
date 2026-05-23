import Category from '../models/Category.js';
import Post from '../models/Post.js';

const slugify = (name) => {
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const migrateCategories = async () => {
  try {
    console.log('Running category database migration...');

    // 1. Fetch all posts
    const posts = await Post.find({});
    
    // Clear Category collection to rebuild it accurately
    await Category.deleteMany({});
    
    const categoryCounts = {};

    for (const post of posts) {
      let updated = false;

      // Ensure postedBy is populated for legacy data compatibility
      if (!post.postedBy && post.user) {
        post.postedBy = post.user;
        updated = true;
      }

      // Normalize categories to lowercase
      if (post.categories && post.categories.length > 0) {
        const normalized = post.categories
          .map((c) => c.trim().toLowerCase())
          .filter((c) => c.length > 0);

        // Check if there was any casing change
        const hasChange = normalized.some((val, idx) => val !== post.categories[idx]);
        if (hasChange || updated) {
          post.categories = normalized;
          updated = true;
        }

        // Track category counts
        for (const catName of normalized) {
          categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
        }
      }

      if (updated) {
        await post.save();
      }
    }

    // 2. Insert normalized categories
    for (const [catName, count] of Object.entries(categoryCounts)) {
      if (catName && catName.trim() !== '') {
        const slug = slugify(catName);
        await Category.create({
          name: catName,
          slug,
          postCount: count,
        });
      }
    }

    console.log('Category database migration completed successfully!');
  } catch (error) {
    console.error('Category database migration failed:', error);
  }
};

export default migrateCategories;
