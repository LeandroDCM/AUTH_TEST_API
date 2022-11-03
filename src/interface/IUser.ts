export interface IUser {
  username: string;
  role_id: number;
  is_activated: boolean;
  resetLink: string;
  name: string;
  email: string;
  password: string;
  _id: string;
  id: string;
  save: any;
  updateOne: any;
  deleteOne: any;
}
