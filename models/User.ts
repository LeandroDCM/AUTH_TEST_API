import mongoose from "mongoose";

export interface User extends mongoose.Document {
  name: string;
  email: string;
  password: string;
}

export const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "post" },
  resetLink: { data: String, default: "" },
});

const User = mongoose.model<User>("User", UserSchema);

export { User };
