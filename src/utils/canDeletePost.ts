import { User } from "../models/User";
import { IUser } from "../interface/IUser";
import { IPost } from "../interface/IPost";
import Role from "./USER_ROLES";

export async function canDeletePost(user: IUser, thisPost: IPost) {
  const postOwner = (await User.findById(
    thisPost.user,
    "-password -name -email"
  )) as IUser;

  if (user.role_id === Role.ADM) return true;
  if (user.role_id === Role.MOD && postOwner.role_id !== Role.ADM) return true;
  if (
    user.role_id === Role.USER &&
    user._id.valueOf() === postOwner._id.valueOf()
  )
    return true;
}
