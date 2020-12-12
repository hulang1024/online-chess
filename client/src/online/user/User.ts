export default class User {
  id: number;

  username: string;

  nickname: string;

  gender: number;

  avatarUrl: string;

  password: string;

  isAdmin: boolean;

  isOnline: boolean;

  lastLoginTime: string;

  static SYSTEM: User;
}

const user = new User();
user.id = 0;
user.nickname = '系统';

User.SYSTEM = user;
