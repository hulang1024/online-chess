export abstract class APIRequest {
    public success: APISuccessHandler;
    public failure: APIFailureHandler;

    protected httpRequest: egret.HttpRequest;
    protected path: string;
    protected method: HttpMethod;
    private params: {} = {};

    constructor() {

    }

    public perform() {
        this.httpRequest = this.createHttpRequest();
        //this.httpRequest.withCredentials = true;
        this.httpRequest.open(`http://localhost:9000/api/${this.path}`, this.method);

        this.httpRequest.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
            let request = <egret.HttpRequest>event.currentTarget;
            let xhr = <XMLHttpRequest>(<any>request)._xhr;
            let isSuccessStatusCode = 200 <= xhr.status && xhr.status <= 299;
            if (!isSuccessStatusCode) {
                this.triggerFailure();
                return;
            }
            let responseObject = JSON.parse(request.response);
            this.triggerSuccess(responseObject);
        }, this);

        this.httpRequest.addEventListener(egret.IOErrorEvent.IO_ERROR, (e: egret.IOErrorEvent) => {
            this.triggerFailure(e);
        }, this);

        this.httpRequest.send(JSON.stringify(this.params));
    }

    protected createHttpRequest() {
        const req = new egret.HttpRequest();
        req.responseType = egret.HttpResponseType.TEXT;
        req.setRequestHeader("Content-Type", "application/json");
        return req;
    }

    protected addParam(key: string, value: any) {
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
    POST = 'post'
}

