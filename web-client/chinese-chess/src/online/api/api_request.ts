import User from "../../user/User";
import APIAccess from "./APIAccess";

export abstract class APIRequest {
    protected api: APIAccess;
    protected httpRequest: egret.HttpRequest;
    protected path: string;
    protected method: HttpMethod;
    private params: {} = null;
    
    public success: APISuccessHandler;
    public failure: APIFailureHandler;

    get user(): User {
        return this.api.localUser;
    }

    public perform(api: APIAccess) {
        this.api = api;
        this.httpRequest = this.createJSONRequest();
        if (this.api.accessToken) {
            this.httpRequest.setRequestHeader("Authorization", `Bearer ${this.api.accessToken.accessToken}`);
        }

        if (this.prepare) {
            this.prepare();
        }

        this.httpRequest.open(`${api.endpoint}/api/${this.path}`, this.method);

        this.httpRequest.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
            let request = <egret.HttpRequest>event.currentTarget;
            let xhr = <XMLHttpRequest>(<any>request)._xhr;
            let isSuccessStatusCode = 200 <= xhr.status && xhr.status <= 299;
            let responseObject: any;
            try {
                responseObject = request.response ? JSON.parse(request.response) : void 0;
            } catch (e) {}
            if (isSuccessStatusCode) {
                this.triggerSuccess(responseObject);
            } else {
                this.triggerFailure(responseObject);
                this.api.handleHttpExceptionStatus(xhr.status);
            }
        }, this);

        this.httpRequest.addEventListener(egret.IOErrorEvent.IO_ERROR, (event: egret.Event) => {
            let request = <egret.HttpRequest>event.currentTarget;
            let xhr = <XMLHttpRequest>(<any>request)._xhr;
            let responseObject: any;
            try {
                responseObject = request.response ? JSON.parse(request.response) : void 0;
            } catch (e) {}
            this.triggerFailure(responseObject);
            this.api.handleHttpExceptionStatus(xhr.status);
        }, this);

        this.httpRequest.send(this.params ? JSON.stringify(this.params) : void 0);
    }

    protected createHttpRequest() {
        // 默认JSON请求
        return this.createJSONRequest();
    }

    protected createJSONRequest() {
        const req = new egret.HttpRequest();
        req.responseType = egret.HttpResponseType.TEXT;
        req.setRequestHeader("Content-Type", "application/json");
        return req;
    }

    protected prepare() {}//todo: 重构

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

