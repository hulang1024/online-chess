import Signal from "src/utils/signals/Signal";
import APIAccess from "../api/APIAccess";
import ChannelManager from "../chat/ChannelManager";
import { Notify } from "quasar";
import { setupEvents } from './events/setup';
import * as user_events from "./events/user";
import ServerMsg from "./ServerMsg";

interface ServerMsgQueueElement {
  signal: Signal;
  message: ServerMsg
}

export default class SocketService {
  public readonly disconnect = new Signal();
  public readonly reconnected = new Signal();
  public channelManager: ChannelManager;
  // 是否已成功游客或者正式登陆
  private isLoggedIn: boolean = false;
  private socket: WebSocket;
  private connected: boolean = false;
  private connectedTimes: number = 0;
  // 消息类型 -> signal
  private messageTypeBoundSignalMap: {[s: string]: Signal} = {};
  private msgSendQueue: Array<Function> = [];
  private serverMsgQueue: Array<ServerMsgQueueElement> = [];
  private isQueueLooping: boolean;
  private api: APIAccess;

  constructor(api: APIAccess) {
    this.api = api;

    setupEvents(this);
    
    api.isLoggedIn.changed.add((isAPILoggedIn: boolean) => {
      if (isAPILoggedIn) {
        this.isLoggedIn = false;
      }
      if (!this.connected) {
        this.doConnect();
      } else {
        this.login();
      }
    });

    user_events.loggedIn.add(this.onLoginMessage, this);
    user_events.online.add(this.onFriendOnline, this);
    user_events.offline.add(this.onFriendOffline, this);
  }

  public queue(sendFunc: Function) {
    if (!this.connected) {
      this.msgSendQueue.push(sendFunc);
      return;
    }

    sendFunc(this.send.bind(this));
  }

  public send(type: string, payload?: any) {
    const msgObject = {type, ...payload};
    console.log(">发送socket消息", msgObject);
    const msg = JSON.stringify(msgObject);
    this.socket.send(msg);
  }

  public addEvent(type: string, signal: Signal) {
    this.messageTypeBoundSignalMap[type] = signal;
  }

  public login() {
    if (this.isLoggedIn) {
      return;
    }
    const isAPILoggedIn = this.api.isLoggedIn.value;
    this.queue((send: Function) => {
    send('user.login',
      {token: isAPILoggedIn ? this.api.accessToken?.accessToken : 'guest'});
    });
  }

  public doConnect() {
    if (this.connected) {
      return;
    }
    
    this.socket = new WebSocket(`${location.protocol == 'https:' ? 'wss' : 'ws'}://${true ? location.hostname : "180.76.185.34"}:9097`);
    
    this.socket.onopen = () => {
      this.connected = true;
      this.onConnected();
    };

    this.socket.onclose = () => {
      this.connected = false;
      this.onDisconnect();
    };

    this.socket.onmessage = (event: any) => {
      this.onMessage(event.data);
    };
    
    if (this.connectedTimes > 0) {
      console.log('正在连接到服务器');
    }
  }

  private onMessage(message: any) {
    const msgObject: any = JSON.parse(message);
    console.log("<收到socket消息", msgObject);
    let signal = this.messageTypeBoundSignalMap[msgObject.type];
    if (signal?.getNumListeners() > 0) {
      signal.dispatch(msgObject);
    } else {
      // 放入未消费的消息
      this.serverMsgQueue.push({signal, message: msgObject});
    }
  }

  private onLoginMessage(msg: user_events.UserLoggedInMsg) {
    if (msg.code != 0) {
      switch (msg.code) {
        case 1:
        Notify.create({type: 'error', message: '未知原因登录失败'});
        break;
        case 2:
        Notify.create({type: 'error', message: '你的账号已在别处登录'});
        this.api.logout();
        break;
        case 3:
        Notify.create({type: 'error', message: '你还未登录'});
        break;
      }
      this.api.logout();
      return;
    }

    this.isLoggedIn = true;
  }

  private onFriendOnline(msg: user_events.UserOnlineMsg) {
    Notify.create(`已上线：${msg.nickname}`);
  }

  private onFriendOffline(msg: user_events.UserOfflineMsg) {
    Notify.create(`已下线：${msg.nickname}`);
  }

  private onConnected() {
    if (this.connectedTimes > 0) {
      console.log('成功连接到服务器');
    }
    

    this.login(); 

    this.connectedTimes++;
    
    if (this.connectedTimes > 1) {
      this.reconnected.dispatch();
    }

    if (!this.isQueueLooping) {
      this.startQueueLoop();
    }

    let msgSend: Function | any;
    while (msgSend = this.msgSendQueue.shift()) {
      msgSend(this.send.bind(this));
    }
  }

  private onDisconnect() {
    this.disconnect.dispatch();
    this.isLoggedIn = false;
    this.serverMsgQueue = [];
    const tryTimeout = 3000;
    console.log(`未连接到服务器，${tryTimeout / 1000}秒钟后自动重试。`);

    setTimeout(() => {
      this.doConnect();
    }, tryTimeout);
  }

  private startQueueLoop() {
    this.isQueueLooping = true;
    console.log('queue looping');
    setTimeout(() => {
      let removed: ServerMsgQueueElement[] = [];
      for (let i = 0; i < this.serverMsgQueue.length; i++) {
        let element = this.serverMsgQueue[i];
        // 如果已经当前有监听
        if (element.signal.getNumListeners() > 0) {
          // 触发信号
          try {
            element.signal.dispatch(element.message);
          } catch(e) {}
          // 加入删除
          removed.push(element);
        }
      }

      this.serverMsgQueue = this.serverMsgQueue.filter(e => !removed.includes(e));

      if (this.serverMsgQueue.length) {
        this.startQueueLoop();
      } else {
        this.isQueueLooping = false;
      }
    }, 1000);
  }
}