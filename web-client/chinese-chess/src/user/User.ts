export default class User {
    id: number;
    username: string;
    nickname: string;

    constructor(id: number, nickname: string) {
        this.id = id;
        this.nickname = nickname;
    }

    static SYSTEM = new User(0, "系统");
}