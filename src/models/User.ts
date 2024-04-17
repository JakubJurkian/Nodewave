import mongoose, { Schema } from 'mongoose';

interface User {
  username: string;
  email: string;
  password: string;
  avatar: string;
  resetToken: string | undefined;
  resetTokenExpiration: Date | number | undefined;
}

const userSchema = new Schema<User>({
  username: { type: String, required: true },
  avatar: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  resetToken: { type: String, required: false },
  resetTokenExpiration: { type: Date, required: false },
});

export default mongoose.model('User', userSchema);
