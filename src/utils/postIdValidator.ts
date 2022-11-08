import mongoose from "mongoose";

export default function idIsValid(postid: string) {
  return !(postid && mongoose.Types.ObjectId.isValid(postid));
}
