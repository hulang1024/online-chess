import User from "../../user/User";
import { APIRequest } from "./api_request";
import LoginRequest from "./LoginRequest";

export default class APIAccess {
    public endpoint: string;
    public localUser: User = new GuestUser();
    public isLoggedIn: boolean;
    public accessToken: AccessToken;

    constructor() {
        this.endpoint = DEBUG ? `${location.protocol}//${location.host}` : 'http://180.76.185.34'
    }

    public queue(request: APIRequest) {
        request.perform(this);
    }
    
    public perform(request: APIRequest) {
        request.perform(this);
    }

    public login(user: User): Promise<void> {
        let loginRequest = new LoginRequest(user);
        return new Promise((resolve, reject) => {
            loginRequest.success = (ret) => {
                this.accessToken = ret.accessToken;
                user.id = ret.userId;
                this.localUser = user;
                this.isLoggedIn = true;
                resolve(ret);
            };
            loginRequest.failure = (ret) => {
                reject(ret);
            }
            loginRequest.perform(this);
        });
    }
}

class GuestUser extends User {
    constructor() {
        super();
        this.id = -1;
        this.nickname = '游客';
    }
}

interface AccessToken {
    accessToken: string;
    expiresIn: number;
}