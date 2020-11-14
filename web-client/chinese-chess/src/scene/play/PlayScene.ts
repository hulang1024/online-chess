import DisplayChess from "./DisplayChess";
import ChessHost, { reverseChessHost } from "./rule/chess_host";
import confirmRequest from './confirm_request';
import ChessboardClickEvent from "./ChessboardClickEvent";
import AbstractScene from "../AbstractScene";
import SceneContext from "../SceneContext";
import ReadyButton from "./ReadyButton";
import socketClient from "../../online/socket";
import platform from "../../Platform";
import UserInfoPane from "./UserInfoPane";
import messager from "../../component/messager";
import ResultDialog from "./ResultDialog";
import User from "../../user/User";
import Player from "./Player";
import DisplayChessboard from "./DisplayChessboard";
import ChessPos from "./rule/ChessPos";
import Room from "../../online/socket-message/response/Room";
import Channel from "../../online/chat/Channel";
import ConfirmDialog from "./ConfirmDialog";
import PlayingRoundButtonsOverlay from "./PlayingRoundButtonsOverlay";
import TextOverlay from "./TextOverlay";
import ChannelManager from "../../online/chat/ChannelManager";
import ChannelType from "../../online/chat/ChannelType";

export default class PlayScene extends AbstractScene {
    // socket消息监听器
    private listeners = {};
    private channelManager: ChannelManager;
    // 连接关闭处理器
    private connectionCloseHandler: Function;
    private player: Player;
    private chessboard: DisplayChessboard;
    // 我方棋方
    private chessHost: ChessHost;
    // 当前走棋方
    private activeChessHost: ChessHost;
    // 我方最近选中棋
    private lastSelected: DisplayChess;
    // 准备状态
    private readyed: boolean;
    private otherReadyed: boolean = null;
    private isPlaying = false;
    private room: Room;
    private user: User;
    private otherUserInfoPane =  new UserInfoPane(true);
    private lblSpectatorNum = new eui.Label();
    private btnReady: ReadyButton;
    private btnRoundOps = new eui.Button();
    private playingRoundButtonsOverlay = new PlayingRoundButtonsOverlay();
    private confirmDialog = new ConfirmDialog();
    private textOverlay = new TextOverlay();
    private resultDialog = new ResultDialog();
    
    constructor(context: SceneContext, roomJoin: any, channelManager: ChannelManager) {
        super(context);

        this.channelManager = channelManager;

        this.user = platform.getUserInfo();
        this.room = roomJoin.room;
        this.readyed = roomJoin.user.readyed;
        this.chessHost = roomJoin.user.chessHost;

        this.player = new Player();
        this.player.onWin = this.onWin.bind(this);
        this.player.onTurnActiveChessHost = this.onTurnActiveChessHost.bind(this);
        this.chessboard = this.player.chessboard;

        this.player.startRound(this.chessHost);

        // 监听棋盘事件
        this.player.addEventListener(ChessboardClickEvent.TYPE, this.onChessboardClick, this);

        let layout = new eui.VerticalLayout();
        layout.paddingLeft = 8;
        layout.paddingTop = 8;
        layout.paddingRight = 8;
        layout.paddingBottom = 8;
        let group = new eui.Group();
        group.layout = layout;

        this.addChild(group);

        // 头部
        let head = new eui.Group();
        head.height = 60;
        head.layout = new eui.VerticalLayout();
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
        lblRoomName.text = '房间: ' + this.room.name;
        headInfo.addChild(lblRoomName);

        let { lblSpectatorNum } = this;
        lblSpectatorNum.size = 20;
        headInfo.addChild(lblSpectatorNum);

        head.addChild(headInfo);

        this.updateSpectatorCount(this.room.spectatorCount);

        // 对方玩家信息
        let otherUser = null;
        roomJoin.room.users.forEach((user: any) => {
            if (user.id != this.user.id) {
                otherUser = user;
                this.otherReadyed = user.readyed;
            }
        });

        if (otherUser != null) {
            this.otherUserInfoPane.load(otherUser);
        }
        head.addChild(this.otherUserInfoPane);
        
        group.addChild(this.player);

        let buttonGroup = new eui.Group();
        let buttonGroupLayout = new eui.HorizontalLayout();
        buttonGroupLayout.horizontalAlign = egret.HorizontalAlign.JUSTIFY;
        buttonGroupLayout.paddingTop = 32;
        buttonGroupLayout.paddingRight = 16;
        buttonGroupLayout.gap = 30;
        buttonGroup.layout = buttonGroupLayout;
        group.addChild(buttonGroup);

        // 离开按钮
        let btnLeave = new eui.Button();
        btnLeave.width = 110;
        btnLeave.height = 50;
        btnLeave.label = "离开房间";
        btnLeave.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            //if (this.isPlaying)
            this.popScene();
            socketClient.send('room.leave');
        }, this);
        buttonGroup.addChild(btnLeave);

        // 准备按钮
        this.btnReady = new ReadyButton(this.otherReadyed != null && this.otherReadyed ? 3 : +this.readyed);
        this.btnReady.visible = !(this.readyed && this.otherReadyed != null && this.otherReadyed);
        this.btnReady.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            socketClient.send('chessplay.ready');
        }, this);
        buttonGroup.addChild(this.btnReady);

        // 对局操作按钮
        let { btnRoundOps } = this;
        btnRoundOps.visible = !this.btnReady.visible;
        btnRoundOps.width = 110;
        btnRoundOps.label = "对局操作";
        btnRoundOps.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.playingRoundButtonsOverlay.toggle();
        }, this);
        buttonGroup.addChild(btnRoundOps);

        this.chessboard.addChild(this.confirmDialog);
        let {btnWhiteFlag, btnChessDraw, btnWithdraw} = this.playingRoundButtonsOverlay;
        btnWhiteFlag.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onWhiteFlagClick, this);
        btnChessDraw.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onChessDrawClick, this);
        btnWithdraw.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onWithdrawClick, this);
        this.chessboard.addChild(this.playingRoundButtonsOverlay);
        this.chessboard.addChild(this.textOverlay);
        this.chessboard.addChild(this.resultDialog);

        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            buttonGroup.width = this.stage.stageWidth;
        }, this);
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, (event: egret.TextEvent) => {
            this.context.chatOverlay.popOut();
        }, this);
        this.chessboard.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.playingRoundButtonsOverlay.visible = false;
        }, this);

        this.updateWaitInfo();

        let channel = new Channel();
        channel.id = this.room.channelId;
        channel.name = `当前房间`;
        channel.type = ChannelType.ROOM;
        this.channelManager.joinChannel(channel);

        this.initListeners();
    }

    private initListeners() {
        socketClient.addEventListener(egret.Event.CLOSE, this.connectionCloseHandler = (event: egret.Event) => {
            this.popScene();
        }, this);

        this.listeners['spectator.join'] = (msg: any) => {
            messager.info(`${msg.user.nickname} 加入观看`, this);
            this.updateSpectatorCount(msg.spectatorCount);
        };

        this.listeners['spectator.leave'] = (msg: any) => {
            this.updateSpectatorCount(msg.spectatorCount);
        };

        this.listeners['room.leave'] = (msg: any) => {
            if (msg.user.id == this.user.id) {
                return;
            } else {
                this.otherReadyed = null;
                this.otherUserInfoPane.load(null);
                this.updateWaitInfo();
                this.btnReady.visible = true;
                this.btnRoundOps.visible = false;
                this.btnReady.setState(+this.readyed);
                this.chessboard.touchEnabled = false;
                this.chessboard.getChessList().forEach(chess => {
                    chess.touchEnabled = false;
                });
                messager.info(`${msg.user.nickname} 已离开房间`, this);
            }
        };

        this.listeners['user.offline'] = (msg: any) => {
            messager.info(`${msg.nickname} 已下线或掉线，
                你可以等待对方一会儿，重新连接之后选择继续下棋（自动恢复棋局状态）。
                你也可以直接离开房间，但是房间和棋局状态会被清理。`, this);
            return;
        };
        
        this.listeners['room.join'] = (msg: any) => {
            window.focus();
            this.otherReadyed = msg.user.readyed;
            this.otherUserInfoPane.load(msg.user);
            this.updateWaitInfo();
            setTimeout(() => {
                messager.info(`玩家[${msg.user.nickname}]已加入房间`, this);
            }, 100);
        };

        this.listeners['chessplay.ready'] = (msg: any) => {
            if (msg.uid == this.user.id) {
                this.readyed = msg.readyed;
            } else {
                this.otherReadyed = msg.readyed;
            }
            if (!this.isPlaying) {
                this.updateWaitInfo();
            }
            this.btnReady.setState(this.otherReadyed != null && this.otherReadyed ? 3 : +this.readyed);
        };

        this.listeners['chessplay.round_start'] = (msg: any) => {
            this.btnReady.visible = false;
            this.btnRoundOps.visible = true;
            this.textOverlay.visible = false;
            this.chessHost = msg.chessHost;
            this.lastSelected = null;
            this.isPlaying = true;
            this.player.startRound(this.chessHost);
            this.playingRoundButtonsOverlay.onPlaying(true);
            this.textOverlay.show(`棋局开始，${this.chessHost == ChessHost.RED ? '你' : '对方'}先走棋`, 2000);
        };

        this.listeners['chessplay.chess_pick'] = (msg) => {
            if (msg.chessHost == this.chessHost) {
                return;
            }
            
            window.focus();
            
            this.player.pickChess(msg.pickup, msg.pos, msg.chessHost);
        };

        this.listeners['chessplay.chess_move'] = (msg: any) => {
            if (msg.chessHost != this.chessHost) {
                window.focus();
            }
            // 走了一步，可以悔棋
            if (!this.playingRoundButtonsOverlay.btnWithdraw.enabled) {
                this.playingRoundButtonsOverlay.btnWithdraw.enabled = true;
            }

            this.player.moveChess(msg.fromPos, msg.toPos, msg.chessHost, msg.moveType == 2);
        };

        this.listeners['chessplay.confirm_request'] = (msg: any) => {
            // 如果是自己发送的请求
            if (msg.chessHost == this.chessHost) {
                return;
            }

            // 对方发送的请求
            // 显示确认对话框
            this.confirmDialog.show(confirmRequest.toReadableText(msg.reqType));
            this.confirmDialog.onOkClick = () => {
                // 确认执行
                switch (msg.reqType) {
                    case confirmRequest.Type.WHITE_FLAG:
                        this.onWin(msg.chessHost);
                        break;
                    case confirmRequest.Type.DRAW:
                        this.onRoundOver();
                        break;
                    case confirmRequest.Type.WITHDRAW:
                        let more = this.player.withdraw();
                        if (!more) {
                            this.playingRoundButtonsOverlay.btnWithdraw.enabled = false;
                        }
                        break;
                }

                // 发送回应到服务器
                socketClient.send('chessplay.confirm_response', {reqType: msg.reqType, ok: true});
            };
            this.confirmDialog.onNoClick = () => {
                socketClient.send('chessplay.confirm_response', {reqType: msg.reqType, ok: false});
            };
        };

        this.listeners['chessplay.confirm_response'] = (msg: any) => {
            // 如果是自己发送的回应
            if (msg.chessHost == this.chessHost) {
                return;
            }

            // 对方发送的回应

            if (!msg.ok) {
                this.textOverlay.show(`对方不同意${confirmRequest.toReadableText(msg.reqType)}`, 3000);
                return;
            }

            this.textOverlay.show(`对方同意${confirmRequest.toReadableText(msg.reqType)}`, 3000);
            switch (msg.reqType) {
                case confirmRequest.Type.WHITE_FLAG:
                    this.onWin(msg.chessHost);
                    break;
                case confirmRequest.Type.DRAW:
                    this.onRoundOver(true);
                    break;
                case confirmRequest.Type.WITHDRAW:
                    let more = this.player.withdraw();
                    if (!more) {
                        this.playingRoundButtonsOverlay.btnWithdraw.enabled = false;
                    }
                    break;
            }
        };

        this.listeners['chat.message'] = (msg: any) => {
            if (msg.channelId == this.room.channelId && msg.sender.id != 0) {
                this.channelManager.openChannel(msg.channelId);
                this.context.chatOverlay.popIn();
            }
        };
        
        for (let key in this.listeners) {
            socketClient.add(key, this.listeners[key]);
        }
    }

    onSceneExit() {
        for (let key in this.listeners) {
            socketClient.signals[key].remove(this.listeners[key]);
        }
        socketClient.removeEventListener(egret.Event.CLOSE, this.connectionCloseHandler, this);
        this.channelManager.leaveChannel(this.room.channelId);
    }

    private onWin(winChessHost: ChessHost) {
        this.onRoundOver();
        this.resultDialog.show(winChessHost == this.chessHost);
        this.resultDialog.onOk = () => {
            this.isPlaying = false;
            // 显示准备按钮
            this.btnReady.visible = true;
            // 更新等待信息
            this.updateWaitInfo();
        }
    }

    private onRoundOver(isDraw: boolean = false) {
        // 禁用棋盘
        this.chessboard.touchEnabled = false;
        this.chessboard.getChessList().forEach(chess => {
            chess.touchEnabled = false;
        });
        // 设置未准备状态
        this.otherReadyed = false;
        this.readyed = false;
        // 隐藏对局操作按钮
        this.btnRoundOps.visible = false;
        this.playingRoundButtonsOverlay.onPlaying(false);
        // 准备按钮状态恢复初始
        this.btnReady.setState(0);

        // 如果是和棋
        if (isDraw) {
            this.isPlaying = false;
            // 显示准备按钮
            this.btnReady.visible = true;
            // 更新等待信息
            this.updateWaitInfo();
        }
        // 请求对局结束
        socketClient.send('chessplay.round_over');
    }

    private updateSpectatorCount = (count: number) => {
        this.lblSpectatorNum.text = `观众数: ${count}`;
        this.lblSpectatorNum.visible = count > 0;
    }

    private onChessboardClick(event: ChessboardClickEvent) {
        if (event.chess == null) {
            // 点击了空白处
            // 并且已经选择了一个棋子
            if (this.lastSelected != null) {
                // 往空白处移动                
                let fromPos = this.lastSelected.getPos();
                let toPos = event.pos;
                let chess = this.chessboard.chessAt(fromPos);
                if (chess.canGoTo(toPos, this.player)) {
                    socketClient.send('chessplay.chess_move', {
                        moveType: 1,
                        fromPos,
                        toPos
                    });
                }
            }
        } else {
            // 点击了一个棋子
            if (this.lastSelected == null) {
                // 并且之前并未选择棋子
                // 现在是选择要走的棋子，只能先选中持棋方棋子
                if (event.chess.getHost() == this.activeChessHost) {
                    this.lastSelected = event.chess;
                    this.lastSelected.setSelected(true);
                    socketClient.send('chessplay.chess_pick', {
                        pos: this.lastSelected.getPos(),
                        pickup: true
                    });

                    // 将非持棋方的棋子全部启用（这样下次才能点击要吃的目标棋子）
                    this.chessboard.getChessList().forEach(chess => {
                        if (chess.getHost() != this.chessHost) {
                            chess.touchEnabled = true;
                        }
                    });
                }
            } else if (event.chess.isSelected() && event.chess.getHost() == this.chessHost) {
                // 重复点击，取消选中
                this.lastSelected.setSelected(false);
                socketClient.send('chessplay.chess_pick', {
                    pos: this.lastSelected.getPos(),
                    pickup: false
                });
                this.lastSelected = null;
            } else {
                // 当选择了两个棋子（包括了空棋子），并且两个棋子属于不同棋方，是吃子
                if (event.chess.getHost() != this.activeChessHost) {
                    let fromPos = this.lastSelected.getPos();
                    let toPos = event.pos;
                    let chess = this.chessboard.chessAt(fromPos);
                    if (chess.canGoTo(toPos, this.player)) {
                        socketClient.send('chessplay.chess_move', {
                            moveType: 2,
                            fromPos,
                            toPos
                        });
                    }
                } else {
                    // 选中了本方的，取消上个选中
                    this.lastSelected.setSelected(false);
                    event.chess.setSelected(true);
                    this.lastSelected = event.chess;
                    socketClient.send('chessplay.chess_pick', {
                        pos: this.lastSelected.getPos(),
                        pickup: true
                    });
                }
            }
        }
    }

    private onWhiteFlagClick() {
        socketClient.send('chessplay.confirm_request', {reqType: confirmRequest.Type.WHITE_FLAG});
        this.textOverlay.show('已发送认输请求，等待对方回应', 3000);
    }

    private onChessDrawClick() {
        socketClient.send('chessplay.confirm_request', {reqType: confirmRequest.Type.DRAW});
        this.textOverlay.show('已发送和棋请求，等待对方回应', 3000);
    }

    private onWithdrawClick() {
        socketClient.send('chessplay.confirm_request', {reqType: confirmRequest.Type.WITHDRAW});
        this.textOverlay.show('已发送悔棋请求，等待对方回应', 3000);
    }

    private onTurnActiveChessHost(activeChessHost: ChessHost) {
        if (!this.isPlaying) {
            return;
        }

        this.activeChessHost = activeChessHost;

        this.otherUserInfoPane.setActive(this.chessHost != this.activeChessHost);
        console.log("现在 " + (this.activeChessHost == ChessHost.BLACK ? "黑方" : "红方") + " 持棋");
        this.chessboard.touchEnabled = this.activeChessHost == this.chessHost;
        this.chessboard.getChessList().forEach(chess => {
            // 如果当前是本方走，将敌方棋子禁用；否则，全部禁用
            chess.touchEnabled = this.activeChessHost == this.chessHost
                ? this.chessHost == chess.getHost()
                : false;
        });
        this.lastSelected = null;
    }

    private updateWaitInfo() {
        let status = 4;
        if (this.otherReadyed === null) {
            status = 0;
        } else if (!this.readyed && !this.otherReadyed) {
            status = 1;
        } else if (this.readyed && !this.otherReadyed) {
            status = 2;
        } else if (!this.readyed && this.otherReadyed) {
            status = 3;
        } else {
            status = 4;
        }
        if (status == 4) {
            this.textOverlay.visible = false;
        } else {
            this.textOverlay.show({
                0: '等待玩家加入',
                1: '请点击准备!',
                2: '等待对方开始',
                3: '对方已准备，请点击开始!'
            }[status]);
        }
    }
}