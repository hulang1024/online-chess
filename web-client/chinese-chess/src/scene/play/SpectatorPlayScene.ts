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
import ChessAction from "../../rule/ChessAction";
import CHESS_CLASS_KEY_MAP from "../../rule/chess_map";
import ChannelManager from "../../online/chat/ChannelManager";
import ChannelType from "../../online/chat/ChannelType";
import ChessPos from "../../rule/ChessPos";
import SpectatorLeaveRequest from "../../online/spectator/SpectatorLeaveRequest";
import APIAccess from "../../online/api/APIAccess";
import SocketClient from "../../online/socket";
import User from "../../user/User";
import UserGameState from "../../online/room/UserGameState";

export default class SpectatorPlayScene extends AbstractScene {
    // socket消息监听器
    private listeners = {};
    private api: APIAccess;
    private socketClient: SocketClient;
    private channelManager: ChannelManager;
    private viewChessHost: ChessHost;
    private player: Player;
    private room: Room;
    private chessboard: DisplayChessboard;
    private textOverlay = new TextOverlay();
    private userInfoPaneGroup = new eui.Group();
    private redChessUser: User;
    private blackChessUser: User;
    private redChessUserInfoPane = new UserInfoPane();
    private blackChessUserInfoPane = new UserInfoPane();
    private lblSpectatorNum = new eui.Label();

    constructor(context: SceneContext, spectateResponse: any) {
        super(context);

        this.api = context.api;
        this.channelManager = context.channelManager;
        this.socketClient = context.socketClient;

        let layout = new eui.VerticalLayout();
        layout.paddingLeft = 0;
        layout.paddingTop = 8;
        layout.paddingRight = 0;
        layout.paddingBottom = 8;
        let group = new eui.Group();
        group.layout = layout;
        this.addChild(group);


        this.viewChessHost = ChessHost.BLACK;
        this.room = spectateResponse.states.room;

        // 头部
        let head = new eui.Group();
        head.height = 60;
        let headLayout = new eui.VerticalLayout();
        head.layout = headLayout;
        headLayout.paddingTop = 0;
        headLayout.paddingRight = 8;
        headLayout.paddingBottom = 0;
        headLayout.paddingLeft = 8;
        group.addChild(head);

        let headInfoLayout = new eui.HorizontalLayout();
        headInfoLayout.horizontalAlign = egret.HorizontalAlign.JUSTIFY;
        let headInfo = new eui.Group();
        headInfo.width = 510;
        headInfo.layout = headInfoLayout;
        headInfo.height = 20;

        let lblRoomName = new eui.Label();
        lblRoomName.width = 300;
        lblRoomName.size = 20;
        lblRoomName.text = '棋桌: ' + this.room.name;
        headInfo.addChild(lblRoomName);

        let { lblSpectatorNum } = this;
        lblSpectatorNum.size = 20;
        headInfo.addChild(lblSpectatorNum);

        head.addChild(headInfo);

        this.updateSpectatorCount(this.room.spectatorCount);

        let userPaneLayout = new eui.HorizontalLayout();
        userPaneLayout.gap = 200;
        userPaneLayout.horizontalAlign = egret.HorizontalAlign.JUSTIFY;
        this.userInfoPaneGroup.width = 510;
        this.userInfoPaneGroup.layout = userPaneLayout;
        this.addUserInfoPaneByView();
        head.addChild(this.userInfoPaneGroup);

        this.blackChessUser = this.room.blackChessUser;
        this.redChessUser = this.room.redChessUser;

        this.redChessUserInfoPane.load(this.redChessUser, ChessHost.RED, this.room.redGameState);
        this.blackChessUserInfoPane.load(this.blackChessUser, ChessHost.BLACK, this.room.blackGameState);

        this.player = new Player();
        this.player.onWin = this.onWin.bind(this);
        this.player.onTurnActiveChessHost = this.onTurnActiveChessHost.bind(this);
        this.chessboard = this.player.chessboard;

        this.chessboard.addChild(this.textOverlay);

        if (this.room.status == 2) {
            this.textOverlay.show('等待对局开始');
        }

        this.player.startRound(ChessHost.BLACK, spectateResponse.states)
        group.addChild(this.player);

        let buttonGroup = new eui.Group();
        let buttonGroupLayout = new eui.HorizontalLayout();
        buttonGroupLayout.horizontalAlign = egret.HorizontalAlign.JUSTIFY;
        buttonGroupLayout.paddingTop = 32;
        buttonGroupLayout.paddingRight = 8;
        buttonGroupLayout.paddingBottom = 32;
        buttonGroupLayout.paddingLeft = 8;
        buttonGroupLayout.gap = 24;
        buttonGroup.layout = buttonGroupLayout;
        group.addChild(buttonGroup);

        // 离开按钮
        let btnLeave = new eui.Button();
        btnLeave.width = 120;
        btnLeave.height = 50;
        btnLeave.label = "离开棋桌";
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

        // 聊天切换按钮
        let btnChat = new eui.Button();
        btnChat.width = 100;
        btnChat.label = "聊天";
        btnChat.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.context.chatOverlay.toggle();
        }, this);
        buttonGroup.addChild(btnChat);

        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            buttonGroup.width = this.stage.stageWidth;
        }, this);
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, (event: egret.TextEvent) => {
            this.context.chatOverlay.popOut();
        }, this);

        this.initListeners();

        let channel = new Channel();
        channel.id = this.room.channelId;
        channel.name = `当前棋桌`;
        channel.type = ChannelType.ROOM;
        this.channelManager.joinChannel(channel);
    }

    onSceneExit() {
        super.onSceneExit();

        for (let key in this.listeners) {
            this.socketClient.signals[key].remove(this.listeners[key]);
        }

        this.channelManager.leaveChannel(this.room.channelId);
    }

    private initListeners() {
        this.listeners['spectator.join'] = (msg: any) => {
            this.updateSpectatorCount(msg.spectatorCount);
        };

        this.listeners['spectator.leave'] = (msg: any) => {
            this.updateSpectatorCount(msg.spectatorCount);
        };

        this.listeners['room.join'] = (msg: any) => {
            this.textOverlay.show('玩家加入', 3000);
            
            let joinUserGameState = new UserGameState();
            joinUserGameState.online = true;
            joinUserGameState.readied = false;
            if (this.blackChessUser == null) {
                this.blackChessUser = msg.user;
                this.blackChessUserInfoPane.load(this.blackChessUser, ChessHost.BLACK, joinUserGameState);
            } else {
                this.redChessUser = msg.user;
                this.redChessUserInfoPane.load(this.redChessUser, ChessHost.RED, joinUserGameState);
            }
        };
        
        this.listeners['room.leave'] = (msg: any) => {
            let leaveChessHost: ChessHost;
            if (this.redChessUser && msg.uid == this.redChessUser.id) {
                this.redChessUser = null;
                leaveChessHost = ChessHost.RED;
            } else {
                this.blackChessUser = null;
                leaveChessHost = ChessHost.BLACK;
            }

            this.textOverlay.show(`${leaveChessHost == ChessHost.RED ? '红方' : '黑方'}玩家离开`);

            (leaveChessHost == ChessHost.RED
                ? this.redChessUserInfoPane
                : this.blackChessUserInfoPane).load(null);
            
            if (this.redChessUser == null && this.blackChessUser == null) {
                messager.info('棋桌已解散', this.stage);
                this.popScene();
                return;
            }

            this.redChessUserInfoPane.setActive(false);
            this.blackChessUserInfoPane.setActive(false);
        };

        this.listeners['play.ready'] = (msg: any) => {
            let readyStatuText = msg.readied ? '已经准备' : '取消准备';
            if (this.redChessUser && msg.uid == this.redChessUser.id) {
                this.textOverlay.show(`红方${readyStatuText}`);
            }
            if (this.blackChessUser && msg.uid == this.blackChessUser.id) {
                this.textOverlay.show(`黑方${readyStatuText}`);
            }
        };

        this.listeners['spectator.play.round_start'] = (msg: any) => {
            this.textOverlay.show('开始对局', 3000);

            // 新对局可能交换棋方，找红方用户和黑方用户
            let redChessUser: User;
            let blackChessUser: User;
            [this.redChessUser, this.blackChessUser].forEach(user => {
                if (user.id == msg.redChessUid) {
                    redChessUser = user;
                }
                if (user.id == msg.blackChessUid) {
                    blackChessUser = user;
                }
            });
            if (this.redChessUser != redChessUser || this.blackChessUser != blackChessUser) {
                this.redChessUser = redChessUser;
                this.blackChessUser = blackChessUser;
                this.redChessUserInfoPane.load(this.redChessUser, ChessHost.RED);
                this.blackChessUserInfoPane.load(this.blackChessUser, ChessHost.BLACK);
            }
            this.redChessUserInfoPane.setActive(false);
            this.blackChessUserInfoPane.setActive(false);

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
                    this.onWin(msg.chessHost, true);
                    break;
                case confirmRequest.Type.DRAW:
                    this.onWin(null, true);
                    break;
                case confirmRequest.Type.WITHDRAW:
                    this.player.withdraw();
                    break;
            }
        };

        this.listeners['user.offline'] = (msg: any) => {
            let offlineUser: User;
            if (msg.uid == this.redChessUser.id) {
                offlineUser = this.redChessUser;
                this.redChessUserInfoPane.updateOnline(false);
            }
            if (msg.uid == this.blackChessUser.id) {
                offlineUser = this.blackChessUser;
                this.blackChessUserInfoPane.updateOnline(false);
            }
            let text = `${offlineUser.nickname}已下线或掉线，可等待对方回来继续`;
            messager.info(text, this);
        };

        this.listeners['play.offline_continue'] = (msg: any) => {
            let offlineUser: User;
            if (msg.uid == this.redChessUser.id) {
                offlineUser = this.redChessUser;
                this.redChessUserInfoPane.updateOnline(true);
            }
            if (msg.uid == this.blackChessUser.id) {
                offlineUser = this.blackChessUser;
                this.blackChessUserInfoPane.updateOnline(true);
            }
            if (msg.ok) {
                let text = `${offlineUser.nickname}已回来`;
                messager.info(text, this);
            } else {
                let text = `${offlineUser.nickname}已选择不继续对局`;
                messager.info(text, this);
            }
        };

        this.listeners['chat.message'] = (msg: any) => {
            if (msg.channelId == this.room.channelId && msg.sender.id != 0) {
                this.channelManager.openChannel(this.room.channelId);
                this.context.chatOverlay.popIn();
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

    private onTurnActiveChessHost(activeChessHost: ChessHost) {
        this.redChessUserInfoPane.setActive(activeChessHost == ChessHost.RED);
        this.blackChessUserInfoPane.setActive(activeChessHost == ChessHost.BLACK);
    }
    
    private onWin(winChessHost: ChessHost, delay: boolean = false) {
        setTimeout(() => {
            this.textOverlay.show(winChessHost == null
                ? '平局'
                : `${winChessHost == ChessHost.RED ? '红方' : '黑方'}赢！`);
        }, delay ? 2000 : 0);

        setTimeout(() => {
            this.textOverlay.show('等待新对局开始');
        }, 5000);
    }

    private updateSpectatorCount = (count: number) => {
        this.lblSpectatorNum.text = `观众数: ${count}`;
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