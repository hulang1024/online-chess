export default class User {
    id: number;
    nickname: string;
    gender: number;
    avatarUrl: string;
    password: string;

    static SYSTEM: User;
}

let user = new User();
user.id = 0;
user.nickname = '系统';

User.SYSTEM = user;