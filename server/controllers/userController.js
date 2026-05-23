import User from '../models/User.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';

// @desc    Get user profile details, created pins, and saved pins
// @route   GET /api/users/profile/:username
// @access  Public
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar')
      .populate({
        path: 'savedPosts',
        populate: {
          path: 'user',
          select: 'username avatar',
        },
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get created posts
    const createdPosts = await Post.find({ user: user._id })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });

    // Get liked posts
    const likedPosts = await Post.find({ likes: user._id })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
      },
      createdPosts,
      savedPosts: user.savedPosts,
      likedPosts,
    });
  } catch (error) {
    console.error('Fetch user profile error:', error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

// @desc    Follow or unfollow a user (Atomic + Notification triggers)
// @route   PUT /api/users/:id/follow
// @access  Private
export const followUser = async (req, res) => {
  try {
    const userToFollowId = req.params.id;
    const currentUserId = req.user._id;

    const userToFollow = await User.findById(userToFollowId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User to follow not found' });
    }

    if (userToFollow._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const isFollowing = currentUser.following.includes(userToFollow._id);

    if (isFollowing) {
      // Unfollow -> Pull arrays
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== userToFollow._id.toString()
      );
      userToFollow.followers = userToFollow.followers.filter(
        (id) => id.toString() !== currentUser._id.toString()
      );

      // Clean up notification trigger on unfollow
      await Notification.deleteOne({
        recipient: userToFollowId,
        sender: currentUserId,
        type: 'follow',
      });
    } else {
      // Follow -> Push arrays
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);

      // Create notification
      await Notification.create({
        recipient: userToFollowId,
        sender: currentUserId,
        type: 'follow',
      });
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({
      following: currentUser.following,
      followersCount: userToFollow.followers.length,
      isFollowing: !isFollowing,
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error updating follow status' });
  }
};

// @desc    Update user profile bio and avatar
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { bio, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      followers: updatedUser.followers,
      following: updatedUser.following,
      savedPosts: updatedUser.savedPosts,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile info' });
  }
};
