export default class User {
  id: number;

  username: string;

  nickname: string;

  gender: number;

  avatarUrl: string;

  password: string;

  isAdmin: boolean;

  isOnline: boolean;

  registerTime: string;

  lastLoginTime: string;

  lastActiveTime: string;

  playGameType: number;

  userIp: string;

  static SYSTEM: User;

  constructor(id?: number) {
    if (typeof id != 'undefined') {
      this.id = id;
    }
  }
}

User.SYSTEM = (() => {
  const user = new User(0);
  user.nickname = '系统';
  return user;
})();

export function isSystemUser(user: User) {
  return user.id == 0 || (user.id < 0 && user.id > -100);
}
