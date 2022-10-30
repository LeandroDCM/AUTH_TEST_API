import mongoose from "mongoose";

export interface PostInterface extends mongoose.Document {
  post: string;
  name: string;
  user: string;
  length: number;
}

export const PostSchema = new mongoose.Schema({
  name: { type: String, required: false },
  post: { type: String, required: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
});

const Post = mongoose.model<PostInterface>("Post", PostSchema);

export { Post };
