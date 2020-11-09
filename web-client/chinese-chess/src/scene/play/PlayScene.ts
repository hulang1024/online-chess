import DisplayChess from "./DisplayChess";
import ChessK from "./rule/chess/ChessK";
import ChessHost, { reverseChessHost } from "./rule/chess_host";
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
import SOUND from "../../audio/SOUND";
import Player from "./Player";
import DisplayChessboard from "./DisplayChessboard";
import ChessPos from "./rule/ChessPos";
import Room from "../../online/socket-message/response/Room";
import chatOverlay from "../../overlay/chat/chat";
import ChatChannel from "../../overlay/chat/ChatChannel";

export default class PlayScene extends AbstractScene {
    // socket消息监听器
    private listeners = {};
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

    private room: Room;
    private user: User;
    private otherUserInfoPane =  new UserInfoPane(true);
    private txtWaitTip = new egret.TextField();
    private btnReady: ReadyButton;
    private resultDialog = new ResultDialog();

    constructor(context: SceneContext, roomJoin: any) {
        super(context);

        this.user = platform.getUserInfo();
        this.room = roomJoin.room;
        this.readyed = roomJoin.user.readyed;
        this.chessHost = roomJoin.user.chessHost;

        this.player = new Player();
        this.chessboard = this.player.chessboard;

        this.player.startRound(this.chessHost);

        // 监听棋盘事件
        this.chessboard.addEventListener(ChessboardClickEvent.TYPE, this.onChessboardClick, this);

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
        head.height = 80;
        head.layout = new eui.VerticalLayout();
        group.addChild(head);

        let roomInfo = new eui.Group();
        roomInfo.height = 20;
        let txtRoomNo = new egret.TextField();
        txtRoomNo.size = 20;
        txtRoomNo.text = '房间: ' + this.room.name;
        roomInfo.addChild(txtRoomNo);
        head.addChild(roomInfo);

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
        
        // 提示等待
        let waitInfo = new eui.Group();
        waitInfo.height = 20;
        let { txtWaitTip } = this;
        txtWaitTip.size = 20;

        this.updateWaitState();
        waitInfo.addChild(txtWaitTip);
        head.addChild(waitInfo);

        group.addChild(this.player);

        let buttonGroup = new eui.Group();
        let buttonGroupLayout = new eui.HorizontalLayout();
        buttonGroupLayout.paddingTop = 32;
        buttonGroupLayout.gap = 24;
        buttonGroup.layout = buttonGroupLayout;
        group.addChild(buttonGroup);

        // 离开按钮
        let btnLeave = new eui.Button();
        btnLeave.width = 100;
        btnLeave.height = 50;
        btnLeave.label = "离开房间";
        btnLeave.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            socketClient.send('room.leave');
            this.popScene();
        }, this);
        buttonGroup.addChild(btnLeave);

        // 准备按钮
        this.btnReady = new ReadyButton(this.otherReadyed != null && this.otherReadyed ? 3 : +this.readyed);
        this.btnReady.visible = !(this.readyed && this.otherReadyed != null && this.otherReadyed);
        this.btnReady.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            socketClient.send('chessplay.ready');
        }, this);
        buttonGroup.addChild(this.btnReady);

        // 聊天切换按钮
        let btnChat = new eui.Button();
        btnChat.label = "聊天";
        btnChat.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            chatOverlay.toggleVisible();
        }, this);
        buttonGroup.addChild(btnChat);

        this.addChild(this.resultDialog);

        let channel = new ChatChannel();
        channel.id = this.room.chatChannelId;
        channel.name = `房间[${this.room.name}]`;
        chatOverlay.addChannel(channel);
        chatOverlay.toggleVisible();

        this.initListeners();
    }

    private initListeners() {
        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            messager.info('你已进入房间', this);
        }, this);

        this.chessboard.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            chatOverlay.visible = false;
        }, this);
        
        socketClient.addEventListener(egret.Event.CLOSE, this.connectionCloseHandler = (event: egret.Event) => {
            this.popScene();
        }, this);

        socketClient.add('room.leave', this.listeners['room.leave'] = (msg: any) => {
            if (msg.user.id == this.user.id) {
                return;
            } else {
                this.otherReadyed = null;
                this.otherUserInfoPane.load(null);
                this.updateWaitState();
                this.btnReady.visible = true;
                this.btnReady.setState(+this.readyed);
                this.chessboard.touchEnabled = false;
                this.chessboard.getChessList().forEach(chess => {
                    chess.touchEnabled = false;
                });
                messager.info(`玩家[${msg.user.nickname}]已离开房间`, this);
            }
        });

        socketClient.add('user.offline', this.listeners['user.offline'] = (msg: any) => {
            messager.info(`玩家[${msg.nickname}]已下线或掉线，
                你可以等待对方一会儿，重新连接之后选择继续下棋（自动恢复棋局状态）。
                你也可以直接离开房间，但是房间和棋局状态会被清理。`, this);
            return;
        });
        
        socketClient.add('room.join', this.listeners['room.join'] = (msg: any) => {
            window.focus();
            this.otherReadyed = msg.user.readyed;
            this.otherUserInfoPane.load(msg.user);
            this.updateWaitState();
            SOUND.get('click').play(0, 1);
            setTimeout(() => {
                messager.info(`玩家[${msg.user.nickname}]已加入房间`, this);
            }, 100);
        });

        socketClient.add('chessplay.ready', this.listeners['chessplay.ready'] = (msg: any) => {
            if (msg.uid == this.user.id) {
                this.readyed = msg.readyed;
            } else {
                this.otherReadyed = msg.readyed;
            }
            this.updateWaitState();
            this.btnReady.setState(this.otherReadyed != null && this.otherReadyed ? 3 : +this.readyed);
        });

        socketClient.add('chessplay.round_start', this.listeners['chessplay.round_start'] = (msg: any) => {
            this.btnReady.visible = false;
            this.txtWaitTip.visible = false;
            this.chessHost = msg.chessHost;
            this.activeChessHost = null;
            this.lastSelected = null;
            this.player.startRound(this.chessHost);
            this.turnActiveChessHost();
            SOUND.get('click').play(0, 1);
            messager.info(`棋局开始，${this.chessHost == ChessHost.RED ? '你' : '对方'}先走棋`, this);
        });

        socketClient.add('chessplay.chess_pick', this.listeners['chessplay.chess_pick'] = (msg) => {
            if (msg.chessHost == this.chessHost) {
                return;
            }
            
            window.focus();
            
            this.player.pickChess(msg.pickup, msg.pos, msg.chessHost);
        });

        socketClient.add('chessplay.chess_move', this.listeners['chessplay.chess_move'] = (msg: any) => {
            if (msg.chessHost != this.chessHost) {
                window.focus();
            }

            switch (msg.moveType) {
            case 1:
                this.onMoveChess(msg.fromPos, msg.toPos, msg.chessHost);
                break;
            case 2:
                this.onEatChess(msg.fromPos, msg.toPos, msg.chessHost);
                break;
            }
        });
    }

    onSceneExit() {
        for (let key in this.listeners) {
            socketClient.signals[key].remove(this.listeners[key]);
        }
        socketClient.removeEventListener(egret.Event.CLOSE, this.connectionCloseHandler, this);
        chatOverlay.removeChannel(this.room.chatChannelId);
    }

    private onMoveChess(fromPos: ChessPos, toPos: ChessPos, chessHost: ChessHost) {
        this.player.moveChess(fromPos, toPos, chessHost);
        this.turnActiveChessHost();
    }

    private onEatChess(fromPos: ChessPos, toPos: ChessPos, chessHost: ChessHost) {
        let targetPos = this.player.convertViewPos(toPos, chessHost);
        let targetChess = this.chessboard.chessAt(targetPos.row, targetPos.col);

        this.player.eatChess(fromPos, toPos, chessHost);

        if (targetChess.getChess() instanceof ChessK) {
            this.onRoundEnd(targetChess.getHost() != this.chessHost);
        } else {
            this.turnActiveChessHost();
        }
    }

    private onRoundEnd(isWin: boolean) {
        this.btnReady.visible = true;
        this.chessboard.touchEnabled = false;
        this.chessboard.getChessList().forEach(chess => {
            chess.touchEnabled = false;
        });

        setTimeout(() => {
            this.resultDialog.show(isWin);
            this.resultDialog.onOk = () => {
                this.resultDialog.visible = false;
            }
            socketClient.send('chessplay.ready');
        }, 100);
    }

    onChessboardClick(event: ChessboardClickEvent) {
        if (event.chess == null) {
            // 点击了空白处
            // 并且已经选择了一个棋子
            if (this.lastSelected != null) {
                // 往空白处移动                
                let fromPos = this.lastSelected.getPos();
                let toPos = event.pos;
                let chess = this.chessboard.chessAt(fromPos.row, fromPos.col);
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
                    SOUND.get('select').play(0, 1);
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
                SOUND.get('click').play(0, 1);
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
                    let chess = this.chessboard.chessAt(fromPos.row, fromPos.col);
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
                    SOUND.get('select').play(0, 1);
                    socketClient.send('chessplay.chess_pick', {
                        pos: this.lastSelected.getPos(),
                        pickup: true
                    });
                }
            }
        }
    }

    private turnActiveChessHost() {
        if (this.activeChessHost == null) {
            this.activeChessHost = ChessHost.RED;
        } else {
            this.activeChessHost = reverseChessHost(this.activeChessHost);
        }

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

    private updateWaitState() {
        let status = 3;
        if (this.otherReadyed === null) {
            status = 0;
        } else if (!this.readyed && !this.otherReadyed) {
            status = 1;
        } else if (this.readyed && !this.otherReadyed) {
            status = 2;
        } else {
            status = 3;
        }
        this.txtWaitTip.visible = status != 3;
        this.txtWaitTip.text = {
            0: '等待玩家加入',
            1: '等待对方准备',
            2: '等待对方开始',
            3: ''}[status];
    }
}