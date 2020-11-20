import messager from "../component/messager";


class SocketClient extends egret.WebSocket {
    signals: { [s: string]: Signal } = {};
    reconnectedSignal = new Signal();
    private connectedSignal = new Signal();
    private connectStarted: boolean = false;
    private onConnected: Function;
    private connectedTimes: number = 0;
    stage: egret.Stage;

    constructor() {
        super();

        this.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.onSocketMessage, this);
        
        this.addEventListener(egret.IOErrorEvent.IO_ERROR, (event: egret.IOErrorEvent) => {
            if (!this.connected) {
                return;
            }
            messager.error('消息错误', this.stage);
            console.log(event);
        }, this);

        this.addEventListener(egret.Event.CLOSE, (event: egret.Event) => {
            const tryTimeout = 3000;
            messager.error({
                msg: `未连接到服务器，${tryTimeout / 1000}秒钟后自动重试。`,
                duration: 1000
            }, this.stage);

            setTimeout(() => {
                this.connectStarted = false;
                this.connect();
            }, tryTimeout);
        }, this);

        // 重新登录监听暂时写在这里
        this.add('user.login', (msg: any) => {
            messager.info(`游客登录成功`, this.stage);
        });
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.connected) {
                resolve();
            } else {
                this.connectedSignal.addOnce(resolve);

                if (!this.onConnected) {
                    this.addEventListener(egret.Event.CONNECT, this.onConnected = (event: any) => {
                        messager.info('成功连接到服务器', this.stage);
                        this.connectStarted = false;

                        this.runPingTimer();

                        this.connectedSignal.dispatch();

                        this.connectedTimes++;
                        
                        if (this.connectedTimes > 1) {
                            this.reconnectedSignal.dispatch();
                        }
                    }, this);
                }

                if (!this.connectStarted) {
                    messager.info({msg: '正在连接到服务器', duration: 2000}, this.stage);

                    super.connect(DEBUG ? "192.168.1.100" : "180.76.185.34", 9097);
                    this.connectStarted = true;
                }
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
        let signal = this.signals[msgObject.type];
        if (signal) {
            signal.dispatch(msgObject);
        }
    }

    private runPingTimer() {
        setInterval(() => {
            this.writeUTF('ping');
        }, 1000 * 30);
    }
}

let socketClient = new SocketClient();
export default socketClient;