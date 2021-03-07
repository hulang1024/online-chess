import { Notify } from "quasar";
import { api, configManager } from "src/boot/main";
import { ConfigItem } from "src/config/ConfigManager";
import GuestUser from "src/user/GuestUser";
import Signal from "src/utils/signals/Signal";
import APIAccess, { APIState } from "../api/APIAccess";
import ChannelManager from "../chat/ChannelManager";
import * as UserServerMsgs from "../user/user_server_messages";
import ServerMsg from "./ServerMsg";

interface ServerMsgQueueElement {
  signal: Signal;
  message: ServerMsg
}

interface SendFunc {
  (send: (type: string, payload?: unknown) => void): void;
}

export default class SocketService {
  public readonly disconnect = new Signal();

  public readonly reconnected = new Signal();

  public readonly loggedIn = new Signal();

  public channelManager: ChannelManager;

  // 是否已成功游客或者正式登陆
  private isWSLoggedIn = false;

  private socket: WebSocket;

  private connected = false;

  private connectedTimes = 0;

  // 消息类型 -> signal
  private messageTypeBoundSignalMap: {[s: string]: Signal} = {};

  private msgSendQueue: Array<SendFunc> = [];

  private serverMsgQueue: Array<ServerMsgQueueElement> = [];

  private isQueueLooping: boolean;

  private api: APIAccess = api;

  constructor() {
    api.state.changed.add((state: APIState) => {
      if (state == APIState.online) {
        // 当API登录成功，需要WS(重新)登录
        this.isWSLoggedIn = false;
        if (!this.connected) {
          this.doConnect();
        } else {
          this.login();
        }
      } else if (state == APIState.offline) {
        // 注销时无需重新登录，服务器已保证游客身份
        this.isWSLoggedIn = false;
      }
    });

    this.on('user.login', this.onLoginMessage.bind(this), this);
  }

  public queue(sendFunc: SendFunc) {
    if (!this.connected) {
      this.msgSendQueue.push(sendFunc);
      return;
    }

    sendFunc(this.send.bind(this));
  }

  public send(type: string, payload?: unknown) {
    // eslint-disable-next-line
    const msgObject = {type, ...payload as any};
    console.log(">发送socket消息", msgObject);
    const msg = JSON.stringify(msgObject);
    this.socket.send(msg);
  }

  public addSignal(type: string, signal: Signal) {
    this.messageTypeBoundSignalMap[type] = signal;
  }

  public on(type: string, listener: any, listenerContext: any = null) {
    const signal = this.messageTypeBoundSignalMap[type] || new Signal();
    signal.add(listener, listenerContext);
    this.addSignal(type, signal);
  }

  public off(type: string, listener?: any, listenerContext: any = null) {
    if (listener) {
      this.messageTypeBoundSignalMap[type].remove(listener, listenerContext);
    } else {
      delete this.messageTypeBoundSignalMap[type];
    }
  }

  private login() {
    if (this.isWSLoggedIn) {
      return;
    }
    this.queue((send) => {
      send('user.login', {
        token: this.api.accessToken?.accessToken,
      });
    });
  }

  public doConnect() {
    if (this.connected) {
      return;
    }

    this.socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:9097`);

    this.socket.onopen = () => {
      this.connected = true;
      this.onConnected();
    };

    this.socket.onclose = () => {
      this.connected = false;
      this.onDisconnect();
    };

    this.socket.onmessage = (event: {data: string}) => {
      this.onMessage(event.data);
    };
  }

  private onMessage(message: string) {
    const serverMsg = JSON.parse(message) as ServerMsg;
    console.log("<收到socket消息", serverMsg);
    const signal = this.messageTypeBoundSignalMap[serverMsg.type];
    if (signal?.getNumListeners() > 0) {
      signal.dispatch(serverMsg);
    } else {
      // 放入未消费的消息
      this.serverMsgQueue.push({ signal, message: serverMsg });
    }
  }

  private async onLoginMessage(msg: UserServerMsgs.UserLoggedInMsg) {
    if (msg.code !== 0) {
      switch (msg.code) {
        case 1:
          Notify.create({ type: 'error', message: '未知原因登录失败' });
          this.api.logout();
          break;
        case 2:
          Notify.create({ type: 'error', message: '你的账号已在别处登录' });
          this.api.logout();
          break;
        case 3: {
          const lastLoginUser = this.api.localUser;
          const token = configManager.get(ConfigItem.token) as string;
          if ((!(lastLoginUser instanceof GuestUser)
            && (lastLoginUser.username && lastLoginUser.password)) || token) {
            await this.api.login(lastLoginUser, token);
          } else {
            await this.api.login(new GuestUser());
          }
          break;
        }
        default:
          break;
      }
      return;
    }

    this.isWSLoggedIn = true;
    this.loggedIn.dispatch();
  }

  private onConnected() {
    if (this.connectedTimes > 0) {
      this.showConnectionNotify('', true);
    }

    this.login();

    this.connectedTimes += 1;

    if (this.connectedTimes > 1) {
      this.reconnected.dispatch();
    }

    if (!this.isQueueLooping) {
      this.startQueueLoop();
    }

    while (true) {
      const msgSend: SendFunc | undefined = this.msgSendQueue.shift();
      if (msgSend) {
        msgSend(this.send.bind(this));
      } else {
        break;
      }
    }
  }

  private onDisconnect() {
    this.disconnect.dispatch();
    this.isWSLoggedIn = false;
    this.serverMsgQueue = [];

    const tryTimeout = 3000;

    this.showConnectionNotify('正在连接到服务器');

    setTimeout(() => {
      this.doConnect();
    }, tryTimeout);
  }

  private startQueueLoop() {
    this.isQueueLooping = true;
    console.log('queue looping');
    setTimeout(() => {
      const removed: ServerMsgQueueElement[] = [];
      for (let i = 0; i < this.serverMsgQueue.length; i += 1) {
        const element = this.serverMsgQueue[i];
        // 如果已经当前有监听
        if (element.signal?.getNumListeners() > 0) {
          // 触发信号
          try {
            element.signal.dispatch(element.message);
          } catch (e) {
            console.error(e);
          }
          // 加入删除
          removed.push(element);
        }
      }

      this.serverMsgQueue = this.serverMsgQueue.filter((e) => !removed.includes(e));

      if (this.serverMsgQueue.length) {
        this.startQueueLoop();
      } else {
        this.isQueueLooping = false;
      }
    }, 1000);
  }

  private lastNotify: ((opts: any) => any) | null = null;

  private showConnectionNotify(message: string, done = false) {
    if (this.lastNotify == null) {
      this.lastNotify = Notify.create({
        group: false,
        spinner: true,
        timeout: 0,
        position: 'bottom',
        caption: '',
        message,
      }) as VoidFunction;
    } else {
      const opts = {
        message,
      };
      if (done) {
        Object.assign(opts, {
          icon: 'done',
          spinner: false,
          timeout: 1000,
          message: '连接成功',
        });
      }
      this.lastNotify(opts);
      if (done) {
        this.lastNotify = null;
      }
    }
  }
}
