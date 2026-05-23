import Post from '../models/Post.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import Category from '../models/Category.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary if credentials exist
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Local helper to generate slug
const slugify = (name) => {
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// @desc    Create a new post/pin (Parses multiple custom categories & tags)
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { title, description, caption, categories, tags } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    let imageUrl = '';

    if (isCloudinaryConfigured) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: 'pinspire',
        });
        fs.unlinkSync(req.file.path);
        imageUrl = uploadResult.secure_url;
      } catch (err) {
        console.error('Cloudinary upload failure, falling back to local file:', err);
        imageUrl = `/uploads/${req.file.filename}`;
      }
    } else {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Process categories
    let categoriesArray = [];
    if (categories) {
      if (Array.isArray(categories)) {
        categoriesArray = categories.map((c) => c.trim().toLowerCase());
      } else {
        categoriesArray = categories
          .split(',')
          .map((c) => c.trim().toLowerCase())
          .filter((c) => c.length > 0);
      }
    }
    const normalizedCats = [...new Set(categoriesArray)]; // Deduplicate

    // Process tags (hashtags/keywords)
    let tagsArray = [];
    if (tags) {
      if (Array.isArray(tags)) {
        tagsArray = tags.map((t) => t.trim().toLowerCase().replace(/^#/, ''));
      } else {
        tagsArray = tags
          .split(',')
          .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
          .filter((t) => t.length > 0);
      }
    }
    const normalizedTags = [...new Set(tagsArray)]; // Deduplicate

    // Create the post
    const post = await Post.create({
      title,
      description: description || caption || '',
      caption: caption || description || '',
      categories: normalizedCats,
      tags: normalizedTags,
      image: imageUrl,
      user: req.user._id,
      postedBy: req.user._id,
      likesCount: 0,
    });

    // Auto-create category database documents and increment postCounts
    for (const catName of normalizedCats) {
      const slug = slugify(catName);
      await Category.findOneAndUpdate(
        { name: catName },
        {
          $setOnInsert: { name: catName, slug },
          $inc: { postCount: 1 },
        },
        { upsert: true, new: true }
      );
    }

    const populatedPost = await Post.findById(post._id)
      .select('-__v')
      .populate('user', 'username avatar')
      .populate('postedBy', 'username avatar')
      .lean();

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ message: error.message || 'Server error creating post' });
  }
};

// @desc    Get all posts (with search, category, and pagination)
// @route   GET /api/posts
// @access  Public
export const getAllPosts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    let query = {};

    if (category && category !== 'For you' && category !== 'Following') {
      query.categories = category.trim().toLowerCase();
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { caption: searchRegex },
        { categories: searchRegex },
        { tags: searchRegex },
      ];
    }

    const skipIndex = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const posts = await Post.find(query)
      .select('title image categories tags likes likesCount user postedBy createdAt')
      .populate('user', 'username avatar')
      .populate('postedBy', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(parseInt(limit, 10))
      .lean();

    res.json(posts);
  } catch (error) {
    console.error('Fetch posts error:', error);
    res.status(500).json({ message: error.message || 'Server error fetching posts' });
  }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .select('-__v')
      .populate('user', 'username avatar bio followers following')
      .populate('postedBy', 'username avatar bio followers following')
      .lean();

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comments = await Comment.find({ post: post._id })
      .select('-__v')
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      ...post,
      comments,
    });
  } catch (error) {
    console.error('Fetch post by ID error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Server error fetching post details' });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this post' });
    }

    // Decrement postCount for categories associated with this post
    if (post.categories && post.categories.length > 0) {
      await Category.updateMany(
        { name: { $in: post.categories } },
        { $inc: { postCount: -1 } }
      );
    }

    // Clean up notifications & comments
    await Comment.deleteMany({ post: post._id });
    await Notification.deleteMany({ post: post._id });

    if (!post.image.startsWith('http') && !post.image.startsWith('https')) {
      const filePath = `.${post.image}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error deleting post' });
  }
};

// @desc    Like or unlike a post (Atomic Updates + Notification hooks)
// @route   PUT /api/posts/:id/like
// @access  Private
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id).select('likes user');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadyLiked = post.likes.includes(userId);
    let updatedPost;

    if (alreadyLiked) {
      updatedPost = await Post.findByIdAndUpdate(
        id,
        {
          $pull: { likes: userId },
          $inc: { likesCount: -1 }
        },
        { new: true, select: 'likes likesCount' }
      );

      // Clean up notification trigger on unlike
      await Notification.deleteOne({
        recipient: post.user,
        sender: userId,
        type: 'like',
        post: id,
      });
    } else {
      updatedPost = await Post.findByIdAndUpdate(
        id,
        {
          $addToSet: { likes: userId },
          $inc: { likesCount: 1 }
        },
        { new: true, select: 'likes likesCount' }
      );

      // Dispatch notification (ignore if self interaction)
      if (post.user.toString() !== userId.toString()) {
        await Notification.create({
          recipient: post.user,
          sender: userId,
          type: 'like',
          post: id,
        });
      }
    }

    res.json({
      likes: updatedPost.likes,
      likesCount: updatedPost.likesCount,
      liked: !alreadyLiked
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error updating like' });
  }
};

// @desc    Save or unsave a post (Atomic Updates + Notification hooks)
// @route   PUT /api/posts/:id/save
// @access  Private
export const savePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id).select('user saves');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const user = await User.findById(userId).select('savedPosts');
    const alreadySaved = user.savedPosts.includes(id);
    let updatedUser;

    if (alreadySaved) {
      // Pull user from post.saves & post from user.savedPosts
      await Post.findByIdAndUpdate(id, { $pull: { saves: userId } });
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { savedPosts: id } },
        { new: true, select: 'savedPosts' }
      );

      // Delete save notification
      await Notification.deleteOne({
        recipient: post.user,
        sender: userId,
        type: 'save',
        post: id,
      });
    } else {
      // Add user to post.saves & post to user.savedPosts
      await Post.findByIdAndUpdate(id, { $addToSet: { saves: userId } });
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { savedPosts: id } },
        { new: true, select: 'savedPosts' }
      );

      // Dispatch save notification (ignore if self bookmark)
      if (post.user.toString() !== userId.toString()) {
        await Notification.create({
          recipient: post.user,
          sender: userId,
          type: 'save',
          post: id,
        });
      }
    }

    res.json({
      savedPosts: updatedUser.savedPosts,
      saved: !alreadySaved
    });
  } catch (error) {
    console.error('Save post error:', error);
    res.status(500).json({ message: 'Server error saving post' });
  }
};

// @desc    Add comment to a post (Trigger Notification hooks)
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.id).select('user');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      post: req.params.id,
      user: req.user._id,
      content,
    });

    const populatedComment = await Comment.findById(comment._id)
      .select('-__v')
      .populate('user', 'username avatar')
      .lean();

    // Dispatch comment notification
    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.user,
        sender: req.user._id,
        type: 'comment',
        post: req.params.id,
      });
    }

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error writing comment' });
  }
};

// @desc    Get posts by category
// @route   GET /api/posts/category/:name
// @access  Public
export const getPostsByCategory = async (req, res) => {
  try {
    const { name } = req.params;
    const normalizedCategory = name.trim().toLowerCase();

    const posts = await Post.find({
      categories: normalizedCategory,
    })
      .select('title image categories tags likes likesCount user postedBy createdAt')
      .populate('user', 'username avatar')
      .populate('postedBy', 'username avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.json(posts);
  } catch (error) {
    console.error('Fetch posts by category error:', error);
    res.status(500).json({ message: 'Server error retrieving posts by category' });
  }
};

// @desc    Get posts by tag
// @route   GET /api/posts/tag/:tag
// @access  Public
export const getPostsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const normalizedTag = tag.trim().toLowerCase().replace(/^#/, '');

    const posts = await Post.find({
      tags: normalizedTag,
    })
      .select('title image categories tags likes likesCount user postedBy createdAt')
      .populate('user', 'username avatar')
      .populate('postedBy', 'username avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.json(posts);
  } catch (error) {
    console.error('Fetch posts by tag error:', error);
    res.status(500).json({ message: 'Server error retrieving posts by tag' });
  }
};

// @desc    Get related posts based on shared categories and tags
// @route   GET /api/posts/:id/related
// @access  Public
export const getRelatedPosts = async (req, res) => {
  try {
    const { id } = req.params;

    const currentPost = await Post.findById(id).select('categories tags');
    if (!currentPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Find other posts sharing categories or tags
    const relatedPosts = await Post.find({
      _id: { $ne: currentPost._id },
      $or: [
        { categories: { $in: currentPost.categories } },
        { tags: { $in: currentPost.tags } },
      ],
    })
      .select('title image categories tags likes likesCount user postedBy createdAt')
      .populate('user', 'username avatar')
      .populate('postedBy', 'username avatar')
      .limit(12)
      .lean();

    // Score based on overlap
    const scoredPosts = relatedPosts.map((post) => {
      let score = 0;
      if (post.categories && currentPost.categories) {
        const sharedCats = post.categories.filter((cat) =>
          currentPost.categories.includes(cat)
        );
        score += sharedCats.length * 2;
      }
      if (post.tags && currentPost.tags) {
        const sharedTags = post.tags.filter((t) =>
          currentPost.tags.includes(t)
        );
        score += sharedTags.length;
      }
      return { ...post, score };
    });

    // Sort by match quality, then freshness
    scoredPosts.sort((a, b) => b.score - a.score || b.createdAt - a.createdAt);

    res.json(scoredPosts);
  } catch (error) {
    console.error('Fetch related posts error:', error);
    res.status(500).json({ message: 'Server error retrieving related posts' });
  }
};

// @desc    Get all distinct categories/tags in use (legacy support)
// @route   GET /api/posts/categories
// @access  Public
export const getDistinctCategories = async (req, res) => {
  try {
    const categories = await Category.find({ postCount: { $gt: 0 } })
      .select('name')
      .lean();
    // Helper: Title-case a normalized category name for display
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

    // Map to simple array of title-cased names for backward compatibility
    const activeCategories = categories.map((c) => titleCase(c.name));
    res.json(activeCategories);
  } catch (error) {
    console.error('Error fetching distinct categories:', error);
    res.status(500).json({ message: 'Server error retrieving categories list' });
  }
};
