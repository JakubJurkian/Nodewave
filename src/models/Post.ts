import mongoose, { Schema } from 'mongoose';

interface Post {
  user: string;
  avatar: string;
  content: string;
  date: string;
}

const postSchema = new Schema<Post>({
  user: { type: String, required: true },
  avatar: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: String, required: true },
});

export default mongoose.model('Post', postSchema);
