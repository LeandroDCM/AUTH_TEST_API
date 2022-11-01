import mongoose from "mongoose";

export default function idIsValid(postid: any) {
  const isValidId = mongoose.Types.ObjectId.isValid(postid);
  if (!isValidId || !postid) {
    return "Post id is not valid";
  }
}
