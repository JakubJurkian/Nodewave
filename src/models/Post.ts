import mongoose, { Schema } from 'mongoose';

interface Post {
  user: string;
  avatar: string;
  content: string;
  date: Date;
}

const postSchema = new Schema<Post>({
  user: { type: String, required: true },
  avatar: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, required: true },
});

export default mongoose.model('Post', postSchema);
