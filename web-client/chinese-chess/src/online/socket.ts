interface MessageSignal {
    [index: string]: Signal;
}

class SocketClient extends egret.WebSocket {
    signals: MessageSignal = {};

    constructor() {
        super();
    }

    connect() {
        return new Promise((resolve, reject) => {
            if (this.connected) {
                resolve();
            } else {
                this.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.onSocketMessage, this);
                this.addEventListener(egret.Event.CONNECT, (event: any) => {
                    console.log("连接服务器成功");
                    resolve();
                }, this);

                super.connect("180.76.185.34", 9097);
                //super.connect("192.168.1.101", 9097);
            }
        });
    }

    send(type: string, payload?: any) {
        const msg = JSON.stringify({type, ...payload});
        console.log("发送socket消息", msg);
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
        console.log("收到socket消息", msg);
        const msgObject: any = JSON.parse(msg);
        this.signals[msgObject.type].dispatch(msgObject);
    }
}

let socketClient = new SocketClient();
export default socketClient;