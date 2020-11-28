import messager from "../../component/messager";
import Room from "../../online/room/Room";
import AbstractScene from "../AbstractScene";
import Channel from "../../online/chat/Channel";
import SceneContext from "../SceneContext";
import DisplayChessboard from "./DisplayChessboard";
import Player from "./Player";
import ChessHost from "../../rule/chess_host";
import TextOverlay from "./TextOverlay";
import confirmRequest from '../../rule/confirm_request';
import UserInfoPane from "./UserInfoPane";
import ChannelManager from "../../online/chat/ChannelManager";
import ChannelType from "../../online/chat/ChannelType";
import SpectatorLeaveRequest from "../../online/spectator/SpectatorLeaveRequest";
import APIAccess from "../../online/api/APIAccess";
import SocketClient from "../../online/socket";
import User from "../../user/User";
import Bindable from "../../utils/bindables/Bindable";
import BindableBool from "../../utils/bindables/BindableBool";
import GameState from "../../online/play/GameState";

export default class SpectatorPlayScene extends AbstractScene {
    // socket消息监听器
    private listeners = {};
    private connectionCloseHandler: Function;
    private api: APIAccess;
    private socketClient: SocketClient;
    private channelManager: ChannelManager;
    private player: Player;
    private room: Room;
    private chessboard: DisplayChessboard;

    private viewChessHost: ChessHost;

    private targetUserId: number = null;

    private redChessUser: Bindable<User> = new Bindable<User>();
    private redOnline: BindableBool = new BindableBool();
    private redReadied: BindableBool = new BindableBool();

    private blackChessUser: Bindable<User> = new Bindable<User>();
    private blackOnline: BindableBool = new BindableBool();
    private blackReadied: BindableBool = new BindableBool();
    
    private spectatorCount: Bindable<number> = new Bindable<number>(0);

    private userInfoPaneGroup = new eui.Group();
    private redChessUserInfoPane: UserInfoPane;
    private blackChessUserInfoPane: UserInfoPane;
    private textOverlay = new TextOverlay();

    constructor(context: SceneContext, spectateResponse: any) {
        super(context);

        this.api = context.api;
        this.channelManager = context.channelManager;
        this.socketClient = context.socketClient;

        this.room = spectateResponse.states.room;

        this.redChessUser.value = this.room.redChessUser;
        this.redOnline.value = this.room.redOnline;
        this.redReadied.value = this.room.redReadied;
        this.blackChessUser.value = this.room.blackChessUser;
        this.blackOnline.value = this.room.blackOnline;
        this.blackReadied.value = this.room.blackReadied;

        if (spectateResponse.targetUserId != null) {
            // 如果是观看用户
            this.targetUserId = spectateResponse.targetUserId;
            if (this.redChessUser.value && this.redChessUser.value.id == this.targetUserId) {
                this.viewChessHost = ChessHost.RED;
            } else {
                this.viewChessHost = ChessHost.BLACK;
            }
        } else {
            this.viewChessHost = Math.random() > 0.5 ? ChessHost.BLACK : ChessHost.RED;
        }
        this.initListeners();

        let channel = new Channel();
        channel.id = this.room.channelId;
        channel.name = '#当前棋桌';
        channel.type = ChannelType.ROOM;
        this.channelManager.joinChannel(channel);
        
        this.load(spectateResponse);
    }
    
    private load(spectateResponse: any) {
        // 头部
        let head = new eui.Group();
        head.height = 60;
        let headLayout = new eui.VerticalLayout();
        head.layout = headLayout;
        headLayout.paddingTop = 0;
        headLayout.paddingRight = 8;
        headLayout.paddingBottom = 0;
        headLayout.paddingLeft = 8;
        this.addChild(head);

        let headInfoLayout = new eui.HorizontalLayout();
        headInfoLayout.horizontalAlign = egret.HorizontalAlign.JUSTIFY;
        let headInfo = new eui.Group();
        headInfo.layout = headInfoLayout;
        headInfo.height = 20;

        let lblRoomName = new eui.Label();
        lblRoomName.width = 300;
        lblRoomName.size = 20;
        lblRoomName.text = '棋桌: ' + this.room.name;
        headInfo.addChild(lblRoomName);

        let lblSpectatorNum = new eui.Label();
        lblSpectatorNum.size = 20;
        headInfo.addChild(lblSpectatorNum);
        head.addChild(headInfo);
        this.spectatorCount.changed.add((count: number) => {
            lblSpectatorNum.text = `观众数: ${count}`;
            lblSpectatorNum.visible = count > 0;
        });

        let userPaneLayout = new eui.HorizontalLayout();
        userPaneLayout.gap = 200;
        userPaneLayout.horizontalAlign = egret.HorizontalAlign.JUSTIFY;
        this.userInfoPaneGroup.width = 510;
        this.userInfoPaneGroup.layout = userPaneLayout;
        head.addChild(this.userInfoPaneGroup);

        this.player = new Player();

        this.redChessUserInfoPane = new UserInfoPane(
            this.redChessUser, this.redOnline, this.redReadied,
            new Bindable<ChessHost>(ChessHost.RED), this.player.activeChessHost);

        this.blackChessUserInfoPane = new UserInfoPane(
            this.blackChessUser, this.blackOnline, this.blackReadied, 
            new Bindable<ChessHost>(ChessHost.BLACK), this.player.activeChessHost);
            
        this.addUserInfoPaneByView();

        this.player.onGameOver = this.onGameOver.bind(this);
        this.chessboard = this.player.chessboard;

        this.chessboard.addChild(this.textOverlay);

        this.player.startRound(this.viewChessHost, spectateResponse.states)
        this.addChild(this.player);

        let buttonGroup = new eui.Group();
        buttonGroup.width = this.player.width;
        buttonGroup.height = 84;
        let buttonGroupLayout = new eui.HorizontalLayout();
        buttonGroupLayout.paddingRight = 8;
        buttonGroupLayout.paddingLeft = 8;
        buttonGroupLayout.gap = 24;
        buttonGroup.layout = buttonGroupLayout;
        this.addChild(buttonGroup);

        // 离开按钮
        let btnLeave = new eui.Button();
        btnLeave.width = 120;
        btnLeave.height = 50;
        btnLeave.label = "返回";
        btnLeave.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.api.perform(new SpectatorLeaveRequest(this.room));
            this.popScene();
        }, this);
        buttonGroup.addChild(btnLeave);

        // 切换视角按钮
        let btnViewChange = new eui.Button();
        btnViewChange.width = 120;
        btnViewChange.height = 50;
        btnViewChange.label = "切换视角";
        btnViewChange.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onViewChangeClick, this);
        buttonGroup.addChild(btnViewChange);

        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            buttonGroup.width = this.stage.stageWidth;
            let height = this.stage.stageHeight - this.context.toolbar.height;
            let width = this.stage.stageWidth;
            this.player.x = (width - this.player.width) / 2;
            this.player.y = (height - this.player.height) / 2;
            buttonGroup.x = this.player.x;
            buttonGroup.y = height - buttonGroup.height;
            head.x = this.player.x;
        }, this);
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, (event: egret.TextEvent) => {
            this.context.chatOverlay.popOut();
        }, this);

        switch (this.room.gameStatus) {
            case GameState.READY:
                this.textOverlay.show('等待对局开始');
                break;
            case GameState.PAUSE:
                this.textOverlay.show('对局暂停');
                break;
            case GameState.PLAYING:
                break;
        }

    }

    onSceneExit() {
        super.onSceneExit();

        for (let key in this.listeners) {
            this.socketClient.signals[key].remove(this.listeners[key]);
        }
        this.socketClient.removeEventListener(egret.Event.CLOSE, this.connectionCloseHandler, this);
        this.channelManager.leaveChannel(this.room.channelId);
    }

    private initListeners() {
        this.socketClient.addEventListener(egret.Event.CLOSE, this.connectionCloseHandler = (event: egret.Event) => {
            this.popScene();
        }, this);

        this.listeners['spectator.join'] = (msg: any) => {
            this.spectatorCount.value = msg.spectatorCount;
        };

        this.listeners['spectator.leave'] = (msg: any) => {
            this.spectatorCount.value = msg.spectatorCount;
        };

        this.listeners['room.join'] = (msg: any) => {
            this.textOverlay.show('玩家加入', 3000);
            
            if (this.blackChessUser.value == null) {
                this.blackChessUser.value = msg.user;
                this.blackReadied.value = false;
            } else {
                this.redChessUser.value = msg.user;
                this.redReadied.value = false;
            }
        };
        
        this.listeners['room.leave'] = (msg: any) => {
            let leaveChessHost: ChessHost;
            if (this.redChessUser.value && msg.uid == this.redChessUser.value.id) {
                this.redChessUser.value = null;
                leaveChessHost = ChessHost.RED;
            } else {
                this.blackChessUser.value = null;
                leaveChessHost = ChessHost.BLACK;
            }

            this.textOverlay.show(`${leaveChessHost == ChessHost.RED ? '红方' : '黑方'}玩家离开`);

            if (this.redChessUser.value == null && this.blackChessUser.value == null) {
                messager.info('你观看的棋桌已经解散', this.stage);
                this.popScene();
                return;
            }

            this.player.activeChessHost.value = null;
        };

        this.listeners['play.ready'] = (msg: any) => {
            let readyStatuText = msg.readied ? '已经准备' : '取消准备';
            if (this.redChessUser.value && msg.uid == this.redChessUser.value.id) {
                this.redReadied.value = msg.readied;
                this.textOverlay.show(`红方${readyStatuText}`);
            }
            if (this.blackChessUser.value && msg.uid == this.blackChessUser.value.id) {
                this.blackReadied.value = msg.readied;
                this.textOverlay.show(`黑方${readyStatuText}`);
            }
        };

        this.listeners['play.game_start'] = (msg: any) => {
            this.textOverlay.show('对局开始', 3000);

            // 新对局可能交换棋方，找出新的红方用户和黑方用户
            let redChessUser: User;
            let blackChessUser: User;
            [this.redChessUser.value, this.blackChessUser.value].forEach(user => {
                if (user.id == msg.redChessUid) {
                    redChessUser = user;
                } else {
                    blackChessUser = user;
                }
            });
            this.redChessUser.value = redChessUser;
            this.blackChessUser.value = blackChessUser;

            // 跟随观看目标用户视角
            if (this.targetUserId) {
                this.viewChessHost = this.targetUserId == redChessUser.id
                    ? ChessHost.RED : ChessHost.BLACK;
            }

            this.player.startRound(this.viewChessHost);
        };

        this.listeners['play.chess_pick'] = (msg) => {            
            this.player.pickChess(msg.pickup, msg.pos, msg.chessHost);
        };

        this.listeners['play.chess_move'] = (msg: any) => {
            this.player.moveChess(msg.fromPos, msg.toPos, msg.chessHost, msg.moveType == 2);
        };
    
        this.listeners['play.confirm_request'] = (msg: any) => {
            let text = msg.chessHost == ChessHost.BLACK ? '黑方' : '红方';
            text += `请求${confirmRequest.toReadableText(msg.reqType)}`;
            this.textOverlay.show(text);
        };
        
        this.listeners['play.confirm_response'] = (msg: any) => {
            let text = '';
            text += msg.chessHost == ChessHost.BLACK ? '黑方' : '红方';
            text += msg.ok ? '同意' : '不同意';
            text += confirmRequest.toReadableText(msg.reqType);
            this.textOverlay.show(text, 4000);

            if (!msg.ok) {
                return;
            }

            switch (msg.reqType) {
                case confirmRequest.Type.WHITE_FLAG:
                    this.onGameOver(msg.chessHost);
                    break;
                case confirmRequest.Type.DRAW:
                    this.onGameOver(null);
                    break;
                case confirmRequest.Type.WITHDRAW:
                    this.player.withdraw();
                    break;
            }
        };

        this.listeners['user.offline'] = (msg: any) => {
            let who: string;
            if (msg.uid == this.redChessUser.value.id) {
                who = '红方';
                this.redOnline.value = false;
            }
            if (msg.uid == this.blackChessUser.value.id) {
                who = '黑方';
                this.blackOnline.value = false;
            }
            let text = `${who}已下线或掉线，可等待回来继续`;
            this.textOverlay.show(text);
        };

        this.listeners['user.online'] = (msg: any) => {
            let who: string;
            if (msg.uid == this.redChessUser.value.id) {
                who = '红方';
                this.redOnline.value = true;
            }
            if (msg.uid == this.blackChessUser.value.id) {
                who = '黑方';
                this.blackOnline.value = true;
            }

            this.textOverlay.show(`${who}已上线`, 3000);
        };

        this.listeners['play.game_continue_response'] = (msg: any) => {
            let who: string;
            if (msg.uid == this.redChessUser.value.id) {
                who = '红方';
                this.redOnline.value = true;
            }
            if (msg.uid == this.blackChessUser.value.id) {
                who = '黑方';
                this.blackOnline.value = true;
            }
            if (msg.ok) {
                let text = `${who}已回来`;
                this.textOverlay.show(text, 3000);
            } else {
                let text = `${who}已选择不继续对局`;
                this.textOverlay.show(text);
            }
        };

        for (let key in this.listeners) {
            this.socketClient.add(key, this.listeners[key]);
        }
    }

    private onViewChangeClick() {
        this.player.reverseChessLayoutView();
        this.viewChessHost = ChessHost.reverse(this.viewChessHost);
        this.userInfoPaneGroup.removeChild(this.redChessUserInfoPane);
        this.userInfoPaneGroup.removeChild(this.blackChessUserInfoPane);
        this.addUserInfoPaneByView();
    }

    private onGameOver(winChessHost: ChessHost) {
        setTimeout(() => {
            this.textOverlay.show(winChessHost == null
                ? '平局'
                : `${winChessHost == ChessHost.RED ? '红方' : '黑方'}赢！`);
        }, 2000);

        setTimeout(() => {
            this.textOverlay.show('等待新对局开始');
        }, 5000);
    }

    private addUserInfoPaneByView() {
        let left: UserInfoPane;
        let right: UserInfoPane;
        if (this.viewChessHost == ChessHost.RED) {
            left = this.blackChessUserInfoPane;
            right = this.redChessUserInfoPane;
        } else {
            left = this.redChessUserInfoPane;
            right = this.blackChessUserInfoPane;
        }

        this.userInfoPaneGroup.addChild(left);
        this.userInfoPaneGroup.addChild(right);
    }
}