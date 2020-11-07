import DisplayChess from "./DisplayChess";
import DisplayChessboard from "./DisplayChessboard";
import ChessC from "./rule/chess/ChessC";
import ChessG from "./rule/chess/ChessG";
import ChessK from "./rule/chess/ChessK";
import ChessM from "./rule/chess/ChessM";
import ChessN from "./rule/chess/ChessN";
import ChessR from "./rule/chess/ChessR";
import ChessS from "./rule/chess/ChessS";
import ChessHost, { reverseChessHost } from "./rule/chess_host";
import ChessPos from "./rule/ChessPos";
import RoundGame from "./rule/RoundGame";
import ChessboardClickEvent from "./ChessboardClickEvent";
import ChessTrackDrawer from "./ChessTrackDrawer";
import AbstractScene from "../AbstractScene";
import SceneContext from "../SceneContext";
import Room from "../lobby/room/Room";
import ReadyButton from "./ReadyButton";
import socketClient from "../../online/socket";
import platform from "../../Platform";
import PlayerInfo from "./PlayerInfo";
import RoomPlayer from "../lobby/RoomPlayer";
import messager from "../../component/messager";
import ResultDialog from "./ResultDialog";
import ChatOverlay from "./ChatOverlay";

export default class PlayScene extends AbstractScene implements RoundGame {
    private listeners = {};
    private chessboard: DisplayChessboard = new DisplayChessboard(this);
    // 我方是红还是黑
    private chessHost: ChessHost;
    // 当前走棋方
    private activeHost: ChessHost;
    private lastSelected: DisplayChess;
    private chessTrackDrawer: ChessTrackDrawer = new ChessTrackDrawer(this.chessboard);
    private clickSound = new egret.Sound();
    private selectSound = new egret.Sound();
    private otherPlayerInfo =  new PlayerInfo(true);
    private txtWaitTip = new egret.TextField();
    private player: RoomPlayer;
    private btnReady: ReadyButton;
    private resultDialog = new ResultDialog();
    private chatOverlay = new ChatOverlay();

    constructor(context: SceneContext, room: Room) {
        super(context);

        // 本方玩家
        this.player = platform.getUserInfo();
        //对方玩家
        let otherPlayer: RoomPlayer = null;
        room.players.forEach(player => {
            if (player.id == this.player.id) {
                this.player = player;
            } else {
                otherPlayer = player;
            }
        });
        this.chessHost = this.player.chessHost;

        // sound
        this.clickSound.load("resource/assets/themes/default/audio/click.wav");
        this.selectSound.load("resource/assets/themes/default/audio/select.wav");

        let group = new eui.Group();
        group.x = 8;
        group.y = 8;
        group.layout = new eui.HorizontalLayout();
        this.addChild(group);

        let mainGroup = new eui.Group();
        mainGroup.height = 100;
        mainGroup.layout = new eui.VerticalLayout();
        group.addChild(mainGroup);

        // 头部
        let head = new eui.Group();
        head.height = 80;
        head.layout = new eui.VerticalLayout();
        mainGroup.addChild(head);

        let roomInfo = new eui.Group();
        roomInfo.height = 20;
        let txtRoomNo = new egret.TextField();
        txtRoomNo.size = 20;
        txtRoomNo.text = '房间: ' + room.name;
        roomInfo.addChild(txtRoomNo);
        head.addChild(roomInfo);

        // 对方玩家信息
        if (otherPlayer != null) {
            this.otherPlayerInfo.load(otherPlayer);
        }
        head.addChild(this.otherPlayerInfo);
        
        // 提示等待
        let waitInfo = new eui.Group();
        waitInfo.height = 20;
        let { txtWaitTip } = this;
        txtWaitTip.size = 20;
        // 初始等待提示

        this.updateWaitState(otherPlayer);
        waitInfo.addChild(txtWaitTip);
        head.addChild(waitInfo);

        // 棋盘
        this.chessboard.addEventListener(ChessboardClickEvent.TYPE, this.onChessboardClick, this);
        this.chessboard.touchEnabled = false;
        mainGroup.addChild(this.chessboard);

        this.resetChessLayout();
        this.chessboard.getChessList().forEach(chess => {
            chess.touchEnabled = false;
        });

        let buttonGroup = new eui.Group();
        let buttonGroupLayout = new eui.HorizontalLayout();
        buttonGroupLayout.paddingTop = 32;
        buttonGroupLayout.gap = 24;
        buttonGroup.layout = buttonGroupLayout;
        mainGroup.addChild(buttonGroup);

        // 离开按钮
        let btnLeave = new eui.Button();
        btnLeave.width = 100;
        btnLeave.height = 50;
        btnLeave.label = "离开";
        btnLeave.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            socketClient.send('room.leave');
            this.popScene();
        }, this);
        buttonGroup.addChild(btnLeave);

        // 准备按钮
        this.btnReady = new ReadyButton(otherPlayer && otherPlayer.readyed ? 3 : +this.player.readyed);
        this.btnReady.visible = !(this.player.readyed && otherPlayer && otherPlayer.readyed);
        this.btnReady.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            socketClient.send('chessplay.ready');
        }, this);
        buttonGroup.addChild(this.btnReady);

        // 聊天切换按钮
        let btnChat = new eui.Button();
        btnChat.label = "聊天";
        btnChat.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.chatOverlay.show();
            this.chatOverlay.onOkClick = (msg) => {
                if (!msg) {
                    return;
                }
                this.chatOverlay.visible = false;
                socketClient.send('chat.message', {content: msg});
            };
        }, this);
        buttonGroup.addChild(btnChat);

        this.addChild(this.resultDialog);
        this.addChild(this.chatOverlay);

        (async () => {
            await socketClient.connect();

            socketClient.add('room.leave', this.listeners['room.leave'] = (msg) => {
                if (msg.code != 0) {
                    return;
                }
                if (msg.player.id == this.player.id) {
                    return;
                } else {
                    otherPlayer = null;
                    this.otherPlayerInfo.load(null);
                    this.updateWaitState(otherPlayer);
                    this.btnReady.visible = true;
                    this.btnReady.setState(+this.player.readyed);
                    this.chessboard.touchEnabled = false;
                    this.chessboard.getChessList().forEach(chess => {
                        chess.touchEnabled = false;
                    });
                    messager.info(`玩家[${msg.player.nickname}]已离开房间`, this)
                }
            });
            socketClient.add('room.join', this.listeners['room.join'] = (msg) => {
                window.focus();
                otherPlayer = msg.player;
                this.otherPlayerInfo.load(otherPlayer);
                this.updateWaitState(otherPlayer);
                this.clickSound.play(0, 1);
                setTimeout(() => {
                    messager.info(`玩家[${msg.player.nickname}]加入房间`, this);
                }, 100);
            });

            socketClient.add('chessplay.ready', this.listeners['chessplay.ready'] = (msg) => {
                if (msg.player.id == this.player.id) {
                    this.player.readyed = msg.player.readyed;
                } else {
                    otherPlayer.readyed = msg.player.readyed;
                }
                this.updateWaitState(otherPlayer);
                this.btnReady.setState(otherPlayer && otherPlayer.readyed ? 3 : +this.player.readyed);
            });
            socketClient.add('chessplay.round_start', this.listeners['chessplay.round_start'] = (msg) => {
                this.btnReady.visible = false;
                txtWaitTip.visible = false;
                this.chessHost = msg.host;
                this.startRound();
                this.clickSound.play(0, 1);
                messager.info('棋局开始', this);
            });
            socketClient.add('chat.message', this.listeners['chat.message'] = (msg) => {
                messager.info({msg: '对方消息: ' + msg.content, duration: 6000}, this);
            });
        })();
    }

    onSceneExit() {
        for (let key in this.listeners) {
            socketClient.signals[key].remove(this.listeners[key]);
        }
    }

    startRound() {
        this.lastSelected = null;
        this.resetChessLayout();
        this.chessTrackDrawer.clear();
        this.activeHost = ChessHost.BLACK;
        this.turn();

        // 将远程对方坐标转换到本地坐标
        const remoteToLocalPos = (host: number, row: number, col: number) => {
            let isOtherHost = host != this.chessHost;
            return new ChessPos(
                isOtherHost ? 9 - row : row, // 对方总是在顶部
                isOtherHost ? 8 - col : col  // 左右反转
            )
        };
        
        const toSourceAndTargetPos = (msg) => {
            let sourcePos = remoteToLocalPos(msg.host, msg.sourceChessRow, msg.sourceChessCol);
            let targetPos = remoteToLocalPos(msg.host, msg.targetChessRow, msg.targetChessCol);
            return {sourcePos, targetPos};
        }

        ['chessplay.chess_pick', 'chessplay.chess_move', 'chessplay.chess_eat'].forEach(key => {
            if (this.listeners[key]) {
                socketClient.signals[key].remove(this.listeners[key]);
            }
        });
        socketClient.add('chessplay.chess_pick', this.listeners['chessplay.chess_pick'] = (msg) => {
            window.focus();
            
            let chessPos = remoteToLocalPos(msg.host, msg.chessRow, msg.chessCol);
            this.chessboard.getChessList().forEach((chess: DisplayChess) => {
                if (chess.isSelected()) {
                    chess.setSelected(false);
                }
            })
            this.chessboard.chessAt(chessPos.row, chessPos.col).setSelected(true);
            this.selectSound.play(0, 1);
        });

        socketClient.add('chessplay.chess_move', this.listeners['chessplay.chess_move'] = (msg) => {
            window.focus();
            
            let { sourcePos, targetPos } = toSourceAndTargetPos(msg);
            this.chessTrackDrawer.draw(sourcePos, targetPos);
            let sourceChess = this.chessboard.chessAt(sourcePos.row, sourcePos.col);
            sourceChess.setSelected(false);
            this.chessboard.moveChess(sourceChess, targetPos);
            this.clickSound.play(0, 1);
            this.turn();
        });

        socketClient.add('chessplay.chess_eat', this.listeners['chessplay.chess_eat'] = (msg) => {
            window.focus();

            let { sourcePos, targetPos } = toSourceAndTargetPos(msg);
            this.chessTrackDrawer.draw(sourcePos, targetPos);
            let sourceChess = this.chessboard.chessAt(sourcePos.row, sourcePos.col);
            let targetChess = this.chessboard.chessAt(targetPos.row, targetPos.col);
            sourceChess.setSelected(false);
            this.chessboard.removeChess(targetChess);
            this.chessboard.moveChess(sourceChess, targetPos);
            this.clickSound.play(0, 1);

            if (targetChess.getChess() instanceof ChessK) {
                this.onRoundEnd(targetChess.getHost() != this.chessHost);
            } else {
                this.turn();
            }
        });
    }

    private onRoundEnd(isWin: boolean) {
        this.btnReady.visible = true;
        this.chessboard.touchEnabled = false;
        this.chessboard.getChessList().forEach(chess => {
            chess.touchEnabled = false;
        });

        setTimeout(() => {
            this.resultDialog.show(isWin);
            
            socketClient.send('chessplay.ready');
        }, 100);
    }

    onChessboardClick(event: ChessboardClickEvent) {
        if (event.chess == null) {
            // 点击了空白处
            // 并且已经选择了一个棋子
            if (this.lastSelected != null) {
                // 往空白处移动
                this.onMoveChess(this.lastSelected, event.pos);
            }
        } else {
            // 点击了一个棋子
            if (this.lastSelected == null) {
                // 并且之前并未选择棋子
                // 现在是选择要走的棋子，只能先选中持棋方棋子
                if (event.chess.getHost() == this.activeHost) {
                    this.lastSelected = event.chess;
                    this.lastSelected.setSelected(true);
                    this.selectSound.play(0, 1);
                    socketClient.send('chessplay.chess_pick', {
                        chessRow: this.lastSelected.getPos().row,
                        chessCol: this.lastSelected.getPos().col
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
                this.lastSelected = null;
                this.selectSound.play(0, 1);
            } else {
                // 当选择了两个棋子（包括了空棋子），并且两个棋子属于不同棋方，是吃子
                if (event.chess.getHost() != this.activeHost) {
                    this.onEatChess(this.lastSelected, event.chess);
                } else {
                    // 选中了本方的，取消上个选中
                    this.lastSelected.setSelected(false);
                    event.chess.setSelected(true);
                    this.lastSelected = event.chess;
                    this.selectSound.play(0, 1);
                    socketClient.send('chessplay.chess_pick', {
                        chessRow: this.lastSelected.getPos().row,
                        chessCol: this.lastSelected.getPos().col
                    });
                }
            }
        }
    }

    private onMoveChess(chess: DisplayChess, destPos: ChessPos) {
        // 判断目标位置是否可走
        if (chess.canGoTo(destPos, this)) {
            // 可走
            let srcPos = chess.getPos();
            socketClient.send('chessplay.chess_move', {
                sourceChessRow: srcPos.row,
                sourceChessCol: srcPos.col,
                targetChessRow: destPos.row,
                targetChessCol: destPos.col
            });
            chess.setSelected(false);
        } else {
            console.log('不合规则');
        }
    }

    private onEatChess(chess: DisplayChess, chessToEat: DisplayChess) {
        if (chess.canGoTo(chessToEat.getPos(), this)) {
            let srcPos = chess.getPos();
            let targetPos = chessToEat.getPos();
            socketClient.send('chessplay.chess_eat', {
                sourceChessRow: srcPos.row,
                sourceChessCol: srcPos.col,
                targetChessRow: targetPos.row,
                targetChessCol: targetPos.col
            });
            chess.setSelected(false);
        } else {
            console.log('不合规则');
        }
    }

    private turn() {
        this.activeHost = reverseChessHost(this.activeHost);
        this.otherPlayerInfo.setActive(this.chessHost != this.activeHost);
        console.log("现在 " + (this.activeHost == ChessHost.BLACK ? "黑方" : "红方") + " 持棋");
        this.chessboard.touchEnabled = this.activeHost == this.chessHost;
        this.chessboard.getChessList().forEach(chess => {
            // 如果当前是本方走，将敌方棋子禁用；否则，全部禁用
            chess.touchEnabled = this.activeHost == this.chessHost ? this.chessHost == chess.getHost() : false;
        });
        this.lastSelected = null;
    }

    private resetChessLayout() {
        const addChessGroup = (host: ChessHost, rows: Array<number>) => {
            for (let chess of [
                new ChessR(new ChessPos(rows[0], 0), host),
                new ChessN(new ChessPos(rows[0], 1), host),
                new ChessM(new ChessPos(rows[0], 2), host),
                new ChessG(new ChessPos(rows[0], 3), host),
                new ChessK(new ChessPos(rows[0], 4), host),
                new ChessG(new ChessPos(rows[0], 5), host),
                new ChessM(new ChessPos(rows[0], 6), host),
                new ChessN(new ChessPos(rows[0], 7), host),
                new ChessR(new ChessPos(rows[0], 8), host),
                new ChessC(new ChessPos(rows[1], 1), host),
                new ChessC(new ChessPos(rows[1], 7), host),
                new ChessS(new ChessPos(rows[2], 0), host),
                new ChessS(new ChessPos(rows[2], 2), host),
                new ChessS(new ChessPos(rows[2], 4), host),
                new ChessS(new ChessPos(rows[2], 6), host),
                new ChessS(new ChessPos(rows[2], 8), host)
            ]) {
                let displayChess = new DisplayChess(chess);
                this.chessboard.addChess(displayChess);
            }
        };

        this.chessboard.clear();
        
        // 顶部方
        addChessGroup(reverseChessHost(this.chessHost), [0, 2, 3]);
        // 底部方
        addChessGroup(this.chessHost, [9, 7, 6]);
    }

    private updateWaitState(otherPlayer: RoomPlayer) {
        let status = 3;
        if (otherPlayer == null) {
            status = 0;
        } else if (!this.player.readyed && !otherPlayer.readyed) {
            status = 1;
        } else if (this.player.readyed && !otherPlayer.readyed) {
            status = 2;
        } else {
            status = 3;
        }
        this.txtWaitTip.visible = status != 3;
        this.txtWaitTip.text = {0: '等待玩家加入', 1: '等待对方准备', 2: '等待对方开始', 3: ''}[status];
    }

    getChessboard() {
        return this.chessboard;
    }

    isHostAtChessboardTop(host: ChessHost) {
        // 本方总是在底部，对方总是在顶部
        return host != this.chessHost;
    }
}