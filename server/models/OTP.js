import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: [true, 'OTP value is required'],
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Document will expire when expiresAt time is reached
    },
  },
  {
    timestamps: true,
  }
);

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;
