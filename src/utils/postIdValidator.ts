import mongoose from "mongoose";

export default function idIsValid(postid: string) {
  const isValidId = mongoose.Types.ObjectId.isValid(postid);
  if (!isValidId || !postid) {
    return true;
  }
}
