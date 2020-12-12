import User from './User';

export default class GuestUser extends User {
  constructor() {
    super();
    this.id = -1;
    this.nickname = '游客';
    this.avatarUrl = '';
  }
}
