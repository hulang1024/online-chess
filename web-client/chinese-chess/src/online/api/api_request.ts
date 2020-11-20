import User from "../../user/User";
import APIAccess from "./APIAccess";

export abstract class APIRequest {
    public success: APISuccessHandler;
    public failure: APIFailureHandler;

    protected httpRequest: egret.HttpRequest;
    protected path: string;
    protected method: HttpMethod;
    private params: {} = null;

    constructor() {

    }

    get user(): User {
        return APIAccess.localUser;
    }

    public perform() {
        this.httpRequest = this.createHttpRequest();
        //this.httpRequest.withCredentials = true;
        this.httpRequest.open(`http://192.168.1.100:9000/api/${this.path}`, this.method);

        this.httpRequest.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
            let request = <egret.HttpRequest>event.currentTarget;
            let xhr = <XMLHttpRequest>(<any>request)._xhr;
            let isSuccessStatusCode = 200 <= xhr.status && xhr.status <= 299;
            if (!isSuccessStatusCode) {
                this.triggerFailure();
                return;
            }
            let responseObject = request.response ? JSON.parse(request.response) : void 0;
            this.triggerSuccess(responseObject);
        }, this);

        this.httpRequest.addEventListener(egret.IOErrorEvent.IO_ERROR, (event: egret.Event) => {
            let request = <egret.HttpRequest>event.currentTarget;
            let responseObject = request.response ? JSON.parse(request.response) : void 0;
            this.triggerSuccess(responseObject);
            this.triggerFailure(responseObject || event);
        }, this);

        this.httpRequest.send(this.params ? JSON.stringify(this.params) : void 0);
    }

    protected createHttpRequest() {
        const req = new egret.HttpRequest();
        req.responseType = egret.HttpResponseType.TEXT;
        req.setRequestHeader("Content-Type", "application/json");
        if (APIAccess.token) {
            req.setRequestHeader("token", APIAccess.token);
        }
        return req;
    }

    protected addParam(key: string, value: any) {
        this.params = this.params || {};
        this.params[key] = value;
    }

    private triggerFailure(e?: any) {
        if (!this.failure) return;
        this.failure(e);
    }

    private triggerSuccess(content?: any) {
        if (!this.success) return;
        this.success(content);
    }
}

interface APIFailureHandler {
    (e?: any): void;
}


interface APISuccessHandler {
    (content?: any): void;
}

export enum HttpMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELET = 'delete'
}

