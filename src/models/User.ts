import mongoose from "mongoose";

export interface UserInterface extends mongoose.Document {
  username: string;
  role_id: number;
  is_activated: boolean;
  resetLink: string;
  name: string;
  email: string;
  password: string;
}

export const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "post" },
  resetLink: { data: String, default: "" },
  role_id: { type: Number, required: true, default: 1 },
  is_activated: { type: Boolean, required: true, default: false },
});

const User = mongoose.model<UserInterface>("User", UserSchema);

export { User };
