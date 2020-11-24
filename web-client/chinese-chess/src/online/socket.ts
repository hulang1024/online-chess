import messager from "../component/messager";
import APIAccess from "./api/APIAccess";
import ChannelManager from "./chat/ChannelManager";
import InfoMessage from "./chat/InfoMessage";

export default class SocketClient extends egret.WebSocket {
    signals: { [s: string]: Signal } = {};
    reconnectedSignal = new Signal();
    private connectedTimes: number = 0;
    private msgSendQueue: Array<Function> = [];
    private api: APIAccess;
    private stage: egret.Stage;
    public channelManager: ChannelManager;

    constructor(api: APIAccess, stage: egret.Stage) {
        super();
        this.api = api;
        this.stage = stage;

        api.stateChanged.add(() => {
            if (api.isLoggedIn) {
                this.queue((send: Function) => {
                    send('user.login', {userId: api.localUser.id});
                });
            }
            if (!this.connected) {
                this.doConnect();
            }
        });

        this.addEventListener(egret.Event.CONNECT, this.onConnected.bind(this), this);
        this.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.onMessage.bind(this), this);
        this.addEventListener(egret.Event.CLOSE, this.onClosed.bind(this), this);
        this.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onIOError.bind(this), this);

        this.add('user.login', this.onLoginMessage.bind(this));
    }

    queue(sendFunc: Function) {
        if (!this.connected) {
            this.msgSendQueue.push(sendFunc);
            return;
        }

        sendFunc(this.send.bind(this));
    }

    send(type: string, payload?: any) {
        const msgObject = {type, ...payload};
        console.log(">发送socket消息", msgObject);
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

    private onMessage(event: egret.Event) {
        const msg = this.readUTF();
        if (!msg || msg == 'pong') {
            return;
        }
        const msgObject: any = JSON.parse(msg);
        console.log("<收到socket消息", msgObject);
        let signal = this.signals[msgObject.type];
        if (signal) {
            signal.dispatch(msgObject);
        }
    }

    private onLoginMessage(msg: any) {
        if (msg.code != 0) {
            switch (msg.code) {
                case 1:
                    messager.fail('未知原因登录失败', this.stage);
                    break;
                case 2:
                    messager.fail('你的账号已在别处登录', this.stage);
                    this.api.logout();
                    break;
                case 3:
                    messager.fail('你还未登录', this.stage);
                    break;
            }
            this.api.logout();
            return;
        }

        if (this.api.isLoggedIn) {
            this.channelManager.getChannel(1).addNewMessages(
                new InfoMessage(this.api.localUser.nickname + ' 登录成功'));
        }
    }

    public doConnect() {
        super.connect(DEBUG ? location.hostname : "180.76.185.34", 9097);
        if (this.connectedTimes > 0) {
            messager.info({msg: '正在连接到服务器', duration: 2000}, this.stage);
        }
    }

    private onConnected(event: any) {
        if (this.connectedTimes > 0) {
            messager.info('成功连接到服务器', this.stage);
        }

        let msgSend: Function;
        while (msgSend = this.msgSendQueue.shift()) {
            msgSend(this.send.bind(this));
        }

        this.runPingTimer();

        this.connectedTimes++;
        
        if (this.connectedTimes > 1) {
            this.reconnectedSignal.dispatch();
            this.send('user.login', {
                userId: this.api.isLoggedIn ? this.api.localUser.id : -1
            });    
        }
    }

    private onClosed(event: egret.Event) {
        const tryTimeout = 3000;
        messager.error({
            msg: `未连接到服务器，${tryTimeout / 1000}秒钟后自动重试。`,
            duration: 1000
        }, this.stage);

        setTimeout(() => {
            this.doConnect();
        }, tryTimeout);
    }

    private onIOError(event: egret.IOErrorEvent) {
        if (!this.connected) {
            return;
        }
        messager.error('消息错误', this.stage);
        console.log(event);
    }

    private runPingTimer() {
        setInterval(() => {
            this.writeUTF('ping');
        }, 1000 * 30);
    }
}