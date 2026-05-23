import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'pinspiresecretjwttokenkey9876543210!', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (Creates verified account immediately)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'Username or email already registered' });
    }

    // Create user (isVerified is true by default now)
    const user = await User.create({
      username,
      email,
      password,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
      isVerified: true,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      savedPosts: user.savedPosts,
      isVerified: user.isVerified,
      token: generateToken(user._id),
      message: 'Registration successful! Welcome to Pinspire.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user and get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email and select password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Fetch full verified user details
    const fullUser = await User.findById(user._id);

    res.json({
      _id: fullUser._id,
      username: fullUser.username,
      email: fullUser.email,
      avatar: fullUser.avatar,
      bio: fullUser.bio,
      followers: fullUser.followers,
      following: fullUser.following,
      savedPosts: fullUser.savedPosts,
      isVerified: fullUser.isVerified,
      token: generateToken(fullUser._id),
      message: 'Login successful!',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user profile session
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ message: 'Server error fetching active session' });
  }
};

// @desc    Mock endpoint for sign out log
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
