export interface IState {
  isAuth: boolean;
  isLoading: boolean;
  currentUser: IUser;
  error: string;
}

export interface IUser {
  _id: string;
  userName: string;
  email: string;
  picture: string;
  groups: string[];
  roles: string[];
}

export interface IAuthBody {
  id: string;
  name: string;
  email: string;
  picture: string;
}
