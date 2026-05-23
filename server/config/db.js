import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pinspire');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    // Do not crash the app, but log clearly so the developer knows they need a running DB
    console.warn('WARNING: Could not connect to MongoDB. Please ensure MongoDB is running locally or provide MONGODB_URI in your .env file.');
  }
};

export default connectDB;
