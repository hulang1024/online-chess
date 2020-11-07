import messager from "../component/messager";

interface MessageSignal {
    [index: string]: Signal;
}

class SocketClient extends egret.WebSocket {
    signals: MessageSignal = {};
    stage: egret.Stage;

    constructor() {
        super();
    }

    connect() {
        return new Promise((resolve, reject) => {
            if (this.connected) {
                resolve();
            } else {
                this.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.onSocketMessage, this);
                this.addEventListener(egret.IOErrorEvent.IO_ERROR, (event: egret.IOErrorEvent) => {
                    if (!this.connected) {
                        return;
                    }
                    messager.error('消息错误', this.stage);
                    console.log(event);
                }, this);
                this.addEventListener(egret.Event.CLOSE, (event: egret.Event) => {
                    const tryTimeout = 5000;
                    messager.error(`未连接到服务器，${tryTimeout / 1000}后重试。`, this.stage);

                    setTimeout(() => {
                        this.connect();
                    }, 5000);
                }, this);

                this.addEventListener(egret.Event.CONNECT, (event: any) => {
                    messager.info('连接服务器成功', this.stage);
                    
                    this.runPingTimer();

                    resolve();
                }, this);

                super.connect("180.76.185.34", 9097);
                //super.connect("192.168.1.101", 9097);
            }
        });
    }

    send(type: string, payload?: any) {
        const msgObject = {type, ...payload};
        console.log("发送socket消息", msgObject);
        const msg = JSON.stringify(msgObject);
        this.writeUTF(msg);
    }

    add(type: string, listener: Function) {
        this.initSignal(type);
        this.signals[type].add(listener);
    }

    addOnce(type: string, listener: Function) {
        this.initSignal(type);
        this.signals[type].addOnce(listener);
    }

    private initSignal(type) {
        this.signals[type] = this.signals[type] || new Signal();
    }

    private onSocketMessage(event: egret.Event) {
        const msg = this.readUTF();
        if (!msg || msg == 'pong') {
            return;
        }
        const msgObject: any = JSON.parse(msg);
        console.log("收到socket消息", msgObject);
        this.signals[msgObject.type].dispatch(msgObject);
    }

    private runPingTimer() {
        setInterval(() => {
            this.writeUTF('ping');
        }, 1000 * 30);
    }
}

let socketClient = new SocketClient();
export default socketClient;