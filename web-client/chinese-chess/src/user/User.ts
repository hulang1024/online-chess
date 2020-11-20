export default class User {
    id: number;
    password: string;
    nickname: string;

    static SYSTEM: User;
}

let user = new User();
user.id = 0;
user.nickname = '系统';

User.SYSTEM = user;