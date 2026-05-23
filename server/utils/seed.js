import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

dotenv.config();

const mockUsers = [
  {
    username: 'alice_designs',
    email: 'alice@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Digital Designer & Creative Director. Crafting premium dark glassmorphic experiences and visual concepts. Based in Tokyo.',
  },
  {
    username: 'john_travels',
    email: 'john@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Wanderer & Landscape Photographer. Capture the beauty of remote locations worldwide. 🌲✈️',
  },
  {
    username: 'david_eats',
    email: 'david@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    bio: 'Culinary Artist, Coffee Connoisseur, and Minimalist Architect enthusiast. "Simplicity is the ultimate sophistication."',
  },
];

const mockPosts = [
  {
    title: 'Sleek Dark Glassmorphic Dashboard Design',
    description: 'A mock interface concept featuring a clean layout, translucent card panels, vibrant cyan-purple mesh gradients, and rich typography. Perfect inspiration for SaaS dashboards!',
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    userIndex: 0, // alice_designs
  },
  {
    title: 'Mist-Covered Pine Forests of Oregon',
    description: 'An early morning walk through the foggy Oregon woods. The air was crisp and the silence was magical. Shot on 35mm film.',
    category: 'Travel',
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop&q=80',
    userIndex: 1, // john_travels
  },
  {
    title: 'Handcrafted Espresso and Latte Art',
    description: 'Morning rituals. Perfect double-shot espresso with silky steamed milk in a minimalist ceramic cup. The smell of freshly ground beans is unmatched.',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80',
    userIndex: 2, // david_eats
  },
  {
    title: 'Minimalist Japandi Bedroom Interior',
    description: 'Blending Japanese minimalism with Scandinavian functionality. Natural oak wood tones, linen bedding, clean lines, and soft warm ambient lighting.',
    category: 'Architecture',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&auto=format&fit=crop&q=80',
    userIndex: 2, // david_eats
  },
  {
    title: 'Ethereal Purple Gradient Abstract Art',
    description: 'A study in fluid dynamics and light refraction. Vibrant gradients flowing seamlessly, creating a futuristic, holographic glass effect.',
    category: 'Art',
    image: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?w=800&auto=format&fit=crop&q=80',
    userIndex: 0, // alice_designs
  },
  {
    title: 'Majestic Sunset at Mount Fuji, Japan',
    description: 'A golden sunset over Mount Fuji surrounded by full cherry blossom trees in spring. One of the most iconic and peaceful moments from my journey.',
    category: 'Travel',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
    userIndex: 1, // john_travels
  },
  {
    title: 'Retro Cyberpunk City Street at Night',
    description: 'Neon glowing signs reflecting in rain puddles along a narrow Tokyo side alleyway. High contrast cinematic lighting.',
    category: 'Art',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    userIndex: 0, // alice_designs
  },
  {
    title: 'Artisanal Sourdough Pizza with Fresh Basil',
    description: 'Wood-fired sourdough crust topped with rich San Marzano tomato sauce, fresh buffalo mozzarella, fragrant basil leaves, and a drizzle of extra virgin olive oil.',
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    userIndex: 2, // david_eats
  },
  {
    title: 'Geometric Concrete Brutalist Structure',
    description: 'Fascinating interlocking raw concrete shapes casting deep geometric shadows under direct sunlight. Architectural study in modernism.',
    category: 'Architecture',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    userIndex: 2, // david_eats
  },
  {
    title: 'Hidden Turquoise Lagoon in El Nido, Philippines',
    description: 'Kayaking inside a hidden limestone lagoon. The water is so transparent you can see the coral reefs and tropical fish swimming below.',
    category: 'Travel',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
    userIndex: 1, // john_travels
  },
];

const seedDatabase = async () => {
  try {
    // Database connection URI checks
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pinspire';
    console.log(`Connecting to database for seeding: ${dbUri}`);
    await mongoose.connect(dbUri);

    // Clear existing data
    await User.deleteMany();
    await Post.deleteMany();
    await Comment.deleteMany();
    console.log('Database collections cleared successfully.');

    // 1. Create users
    const createdUsers = [];
    for (const u of mockUsers) {
      const newUser = new User({
        username: u.username,
        email: u.email,
        password: u.password, // This gets hashed by pre-save hook
        avatar: u.avatar,
        bio: u.bio,
      });
      await newUser.save();
      createdUsers.push(newUser);
    }
    console.log(`${createdUsers.length} users successfully created.`);

    // 2. Set up follows
    // Alice follows John and David
    createdUsers[0].following.push(createdUsers[1]._id, createdUsers[2]._id);
    createdUsers[1].followers.push(createdUsers[0]._id);
    createdUsers[2].followers.push(createdUsers[0]._id);

    // John follows Alice
    createdUsers[1].following.push(createdUsers[0]._id);
    createdUsers[0].followers.push(createdUsers[1]._id);

    await createdUsers[0].save();
    await createdUsers[1].save();
    await createdUsers[2].save();
    console.log('User social follow relationships set up.');

    // 3. Create Posts
    const createdPosts = [];
    for (const p of mockPosts) {
      const assignedUser = createdUsers[p.userIndex];
      const newPost = new Post({
        title: p.title,
        description: p.description,
        categories: [p.category],
        image: p.image,
        user: assignedUser._id,
      });
      // Set initial likes (e.g. other two users like each post)
      createdUsers.forEach((u) => {
        if (u._id.toString() !== assignedUser._id.toString()) {
          newPost.likes.push(u._id);
        }
      });
      newPost.likesCount = newPost.likes.length;
      await newPost.save();
      createdPosts.push(newPost);
    }
    console.log(`${createdPosts.length} posts/pins created.`);

    // 4. Save some pins for users (Saved tab)
    // Alice saves John's Fuji Sunset (index 5) and David's Pizza (index 7)
    createdUsers[0].savedPosts.push(createdPosts[5]._id, createdPosts[7]._id);
    // John saves Alice's Dashboard (index 0) and David's Bedroom (index 3)
    createdUsers[1].savedPosts.push(createdPosts[0]._id, createdPosts[3]._id);
    // David saves Alice's Abstract Art (index 4)
    createdUsers[2].savedPosts.push(createdPosts[4]._id);

    await createdUsers[0].save();
    await createdUsers[1].save();
    await createdUsers[2].save();
    console.log('Bookmarked saved posts configured.');

    // 5. Add comments
    const commentData = [
      {
        postIndex: 0, // Alice's dashboard
        userIndex: 1, // John says:
        content: 'Wow, this interface layout is extremely beautiful. The glassmorphism is spot on!',
      },
      {
        postIndex: 0, // Alice's dashboard
        userIndex: 2, // David says:
        content: 'Clean columns and typography. Loving the color choices.',
      },
      {
        postIndex: 5, // John's Mt Fuji
        userIndex: 0, // Alice says:
        content: 'Unreal sunset! Adding this to my travel list immediately.',
      },
      {
        postIndex: 2, // David's Espresso
        userIndex: 1, // John says:
        content: 'The lighting on this photo is stunning. Latte art is pristine!',
      },
    ];

    for (const c of commentData) {
      await Comment.create({
        post: createdPosts[c.postIndex]._id,
        user: createdUsers[c.userIndex]._id,
        content: c.content,
      });
    }
    console.log('Starter interaction comments created.');

    console.log('Database successfully seeded with premium MERN Pinterest data!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
