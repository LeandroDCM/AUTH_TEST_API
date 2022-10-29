import mongoose from "mongoose";

export interface Post extends mongoose.Document {
  post: string;
  name: string;
}

export const PostSchema = new mongoose.Schema({
  name: { type: String, required: false },
  post: { type: String, required: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
});

const Post = mongoose.model<Post>("Post", PostSchema);

export { Post };
