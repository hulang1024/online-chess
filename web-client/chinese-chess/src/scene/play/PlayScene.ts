import DisplayChess from "./DisplayChess";
import ChessHost from "../../rule/chess_host";
import confirmRequest from '../../rule/confirm_request';
import ChessboardClickEvent from "./ChessboardClickEvent";
import AbstractScene from "../AbstractScene";
import SceneContext from "../SceneContext";
import ReadyButton from "./ReadyButton";
import UserInfoPane from "./UserInfoPane";
import messager from "../../component/messager";
import User from "../../user/User";
import Player from "./Player";
import DisplayChessboard from "./DisplayChessboard";
import Room from "../../online/room/Room";
import Channel from "../../online/chat/Channel";
import ConfirmDialog from "./ConfirmDialog";
import GameButtonsOverlay from "./GameButtonsOverlay";
import ChannelManager from "../../online/chat/ChannelManager";
import ChannelType from "../../online/chat/ChannelType";
import notify, { allowNotify } from "../../component/notify";
import APIAccess from "../../online/api/APIAccess";
import PartRoomRequest from "../../online/room/PartRoomRequest";
import SocketClient from "../../online/ws/socket";
import GameState from "../../online/play/GameState";
import GameStates from "../../online/play/GameStates";
import BindableBool from "../../utils/bindables/BindableBool";
import Bindable from "../../utils/bindables/Bindable";
import ConfirmLeaveDialog from "./ConfirmLeaveDialog";
import TextOverlay from "./TextOverlay";
import ResultDialog from "./ResultDialog";

export default class PlayScene extends AbstractScene {
    // socket消息监听器
    private listeners = {};
    private connectionCloseHandler: Function;
    
    private api: APIAccess;
    private socketClient: SocketClient;
    private channelManager: ChannelManager;

    private player: Player;
    
    private chessboard: DisplayChessboard;

    private room: Room;

    private gameState: Bindable<GameState> = new Bindable<GameState>();

    private activeChessHost: Bindable<ChessHost> = new Bindable<ChessHost>();

    private lastSelected: DisplayChess;

    private user: User;
    private online: BindableBool = new BindableBool();
    private readied: BindableBool = new BindableBool();
    private chessHost: Bindable<ChessHost> = new Bindable<ChessHost>();

    private otherUser: Bindable<User> = new Bindable<User>();
    private otherOnline: BindableBool = new BindableBool();
    private otherReadied: BindableBool = new BindableBool();
    private otherChessHost: Bindable<ChessHost> = new Bindable<ChessHost>();

    private spectatorCount: Bindable<number> = new Bindable<number>(0);

    private gameButtonsOverlay: GameButtonsOverlay;
    private confirmDialog = new ConfirmDialog();
    private textOverlay = new TextOverlay();
    private resultDialog = new ResultDialog();
    private confirmLeaveDialog: ConfirmLeaveDialog = new ConfirmLeaveDialog();
    
    constructor(context: SceneContext, room: Room, initialGameStates?: GameStates) {
        super(context);

        this.api = context.api;
        this.channelManager = context.channelManager;
        this.socketClient = context.socketClient;

        this.room = room || initialGameStates.room;
        this.gameState.value = this.room.gameStatus;
        this.user = this.api.localUser;
        // 初始双方游戏状态和持棋方
        let {
            redChessUser, blackChessUser,
            redReadied, blackReadied,
            redOnline, blackOnline } = this.room;
        if (redChessUser && this.user.id == redChessUser.id) {
            this.online.value = redOnline;
            this.readied.value = redReadied;
            this.chessHost.value = ChessHost.RED;
            this.otherUser.value = blackChessUser;
            this.otherOnline.value = blackOnline;
            this.otherReadied.value = blackReadied;
        }
        if (blackChessUser && this.user.id == blackChessUser.id) {
            this.online.value = blackOnline;
            this.readied.value = blackReadied;
            this.chessHost.value = ChessHost.BLACK;
            this.otherUser.value = redChessUser;
            this.otherOnline.value = redOnline;
            this.otherReadied.value = redReadied;
        }

        this.chessHost.addAndRunOnce((chessHost: ChessHost) => {
            this.otherChessHost.value = ChessHost.reverse(chessHost);
        });

        let channel = new Channel();
        channel.id = this.room.channelId;
        channel.name = '#当前棋桌';
        channel.type = ChannelType.ROOM;
        this.channelManager.joinChannel(channel);

        this.initListeners();

        this.load(initialGameStates);
 
        this.updateWaitInfo();
    }

    private load(initialGameStates: GameStates) {
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
        this.spectatorCount.changed.add((count: number) => {
            lblSpectatorNum.text = `观众数: ${count}`;
            lblSpectatorNum.visible = count > 0;
        });

        head.addChild(headInfo);

        head.addChild(new UserInfoPane(
            this.otherUser, this.otherOnline, this.otherReadied,
            this.otherChessHost, this.activeChessHost));

        this.player = new Player();
        this.player.onGameOver = this.onGameOver.bind(this);
        this.player.activeChessHost.changed.add(this.onTurnActiveChessHost, this);
        this.player.addEventListener(ChessboardClickEvent.TYPE, this.onChessboardClick, this);
        this.chessboard = this.player.chessboard;
        this.chessboard.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.gameButtonsOverlay.hide();
        }, this);

        this.chessboard.addChild(this.confirmDialog);

        this.gameButtonsOverlay = new GameButtonsOverlay(this.gameState);

        let {btnWhiteFlag, btnChessDraw, btnWithdraw} = this.gameButtonsOverlay;
        btnWhiteFlag.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onWhiteFlagClick, this);
        btnChessDraw.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onChessDrawClick, this);
        btnWithdraw.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onWithdrawClick, this);
        this.chessboard.addChild(this.gameButtonsOverlay);
        this.chessboard.addChild(this.textOverlay);
        this.chessboard.addChild(this.resultDialog);
        
        this.addChild(this.player);

        this.addChild(this.confirmLeaveDialog);

        let buttonGroup = new eui.Group();
        buttonGroup.height = 84;
        let buttonGroupLayout = new eui.HorizontalLayout();
        buttonGroupLayout.horizontalAlign = egret.HorizontalAlign.JUSTIFY;
        buttonGroupLayout.paddingRight = 8;
        buttonGroupLayout.paddingLeft = 8;
        buttonGroupLayout.gap = 30;
        buttonGroup.layout = buttonGroupLayout;
        this.addChild(buttonGroup);

        // 离开按钮
        let btnLeave = new eui.Button();
        btnLeave.width = 110;
        btnLeave.height = 50;
        btnLeave.label = "返回";
        btnLeave.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onBackClick, this);
        buttonGroup.addChild(btnLeave);

        // 准备按钮
        let btnReady = new ReadyButton(this.readied, this.otherReadied, this.gameState);
        btnReady.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.socketClient.send('play.ready');
        }, this);
        buttonGroup.addChild(btnReady);

        // 对局操作按钮
        let btnGameOps = new eui.Button();
        btnGameOps.width = 110;
        btnGameOps.label = "对局操作";
        btnGameOps.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.gameButtonsOverlay.toggle();
        }, this);
        buttonGroup.addChild(btnGameOps);

        this.gameState.addAndRunOnce((gameState: GameState) => {
            btnGameOps.visible = gameState == GameState.PLAYING;
        });

        this.chessboard.addEventListener(egret.TouchEvent.TOUCH_TAP, (event: egret.TextEvent) => {
            this.context.chatOverlay.popOut();
        }, this);

        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            let height = this.stage.stageHeight - this.context.toolbar.height;
            let width = this.stage.stageWidth;
            this.player.x = (width - this.player.width) / 2;
            this.player.y = (height - this.player.height) / 2;
            buttonGroup.x = this.player.x;
            buttonGroup.y = height - buttonGroup.height;
            head.x = this.player.x;
            this.player.startGame(this.chessHost.value, (<GameStates>initialGameStates));
        }, this);
        
        if ('Notification' in window) {
            setTimeout(() => {
                Notification.requestPermission();
            }, 500);
        }

        this.gameState.addAndRunOnce((gameState: GameState) => {
            let enabled = gameState == GameState.PLAYING;
            this.chessboard.touchEnabled = enabled;
            this.chessboard.getChessList().forEach(chess => {
                chess.touchEnabled = enabled;
            });
        });
    }

    private initListeners() {
        this.listeners['room.user_left'] = (msg: any) => {
            if (msg.uid == this.user.id) {
                return;
            } else {
                this.gameState.value = GameState.READY;
                this.otherUser.value = null;
                this.otherReadied.value = false;
                this.updateWaitInfo();

                this.textOverlay.visible = false;
                messager.info('对手已离开棋桌', this);
            }
        };

        this.listeners['room.user_join'] = (msg: any) => {
            window.focus();
            this.otherUser.value = msg.user;
            this.otherOnline.value = true;
            this.updateWaitInfo();
            setTimeout(() => {
                let info = `玩家[${this.otherUser.value.nickname}]已加入棋桌`;
                if (document.hidden && allowNotify()) {
                    notify(info, this);
                } else {
                    messager.info(info, this);
                }
            }, 100);
        };

        this.listeners['play.ready'] = (msg: any) => {
            if (msg.uid == this.user.id) {
                this.readied.value = msg.readied;
            } else {
                this.otherReadied.value = msg.readied;
            }
            if (this.gameState.value != GameState.PLAYING) {
                this.updateWaitInfo();
            }
        };

        this.listeners['play.game_start'] = (msg: any) => {
            this.chessHost.value = msg.redChessUid == this.user.id
                ? ChessHost.RED
                : ChessHost.BLACK;
            this.lastSelected = null;
            this.player.startGame(this.chessHost.value);
            this.gameState.value = GameState.PLAYING;
            this.textOverlay.show(`开始对局`, 2000);
        };

        this.listeners['play.chess_pick'] = (msg) => {
            if (msg.chessHost == this.chessHost.value) {
                return;
            }
            
            window.focus();
            
            this.player.pickChess(msg.pickup, msg.pos, msg.chessHost);
        };

        this.listeners['play.chess_move'] = (msg: any) => {
            if (msg.chessHost != this.chessHost.value) {
                window.focus();
            }
            // 走了一步，可以悔棋
            if (!this.gameButtonsOverlay.btnWithdraw.enabled) {
                this.gameButtonsOverlay.btnWithdraw.enabled = true;
            }

            this.player.moveChess(msg.fromPos, msg.toPos, msg.chessHost, msg.moveType == 2);
        };

        this.listeners['play.confirm_request'] = (msg: any) => {
            // 如果是自己发送的请求
            if (msg.chessHost == this.chessHost.value) {
                return;
            }

            // 对方发送的请求
            // 显示确认对话框
            this.confirmDialog.open(confirmRequest.toReadableText(msg.reqType));
            this.confirmDialog.onOkClick = () => {
                // 发送回应到服务器
                this.socketClient.send('play.confirm_response', {reqType: msg.reqType, ok: true});
            };
            this.confirmDialog.onNoClick = () => {
                this.socketClient.send('play.confirm_response', {reqType: msg.reqType, ok: false});
            };
        };

        this.listeners['play.confirm_response'] = (msg: any) => {
            // 如果同意
            if (!msg.ok) {
                // 对方发送的回应
                if (msg.chessHost != this.chessHost.value) {
                    this.textOverlay.show(`对方不同意${confirmRequest.toReadableText(msg.reqType)}`, 3000);
                }
                return;
            }

            // 如果不同意
            if (msg.chessHost != this.chessHost.value) {
                this.textOverlay.show(`对方同意${confirmRequest.toReadableText(msg.reqType)}`, 3000);
            }

            switch (msg.reqType) {
                case confirmRequest.Type.WHITE_FLAG:
                    this.onGameOver(msg.chessHost);
                    break;
                case confirmRequest.Type.DRAW:
                    this.onGameOver(null);
                    break;
                case confirmRequest.Type.WITHDRAW:
                    let more = this.player.withdraw();
                    if (!more) {
                        this.gameButtonsOverlay.btnWithdraw.enabled = false;
                    }
                    break;
            }
        };

        this.listeners['spectator.join'] = (msg: any) => {
            messager.info(`${msg.user.nickname} 加入观看`, this);
            this.spectatorCount.value = msg.spectatorCount;
        };

        this.listeners['spectator.left'] = (msg: any) => {
            this.spectatorCount.value = msg.spectatorCount;
        };

        this.socketClient.addEventListener(egret.Event.CLOSE, this.connectionCloseHandler = (event: egret.Event) => {
            if (this.gameState.value == GameState.READY) {
                this.popScene();
                return;
            }

            this.gameState.value = GameState.PAUSE;
            this.online.value = false;
        }, this);
        

        this.listeners['play.game_continue'] = () => {
            this.online.value = true;
            if (this.online.value && this.otherOnline.value) {
                this.gameState.value = GameState.PLAYING;
            }
            this.socketClient.send('play.game_continue', {ok: true});
        };

        this.listeners['play.game_states'] = (gameStatesMsg: any) => {
            //todo:重连之后同步状态，可能与服务器不一致
        };

        this.listeners['user.offline'] = (msg: any) => {
            if (!(this.otherUser.value && this.otherUser.value.id == msg.uid)) {
                return;
            }
            this.otherOnline.value = false;
            this.gameState.value = GameState.PAUSE;
            this.textOverlay.show('对手已下线/掉线，你可以等待对方回来继续');
        };

        this.listeners['user.online'] = (msg: any) => {
            //判断是否原来就没加入过房间
            if (!(this.otherUser.value && this.otherUser.value.id == msg.uid)) {
                return;
            }
            this.otherOnline.value = true;
            this.textOverlay.show('对手已上线', 3000);
        };

        this.listeners['play.game_continue_response'] = (msg: any) => {
            this.otherOnline.value = true;
            if (msg.ok) {
                this.gameState.value = GameState.PLAYING;
                this.textOverlay.show('对手已回来', 3000);
            } else {
                this.gameState.value = GameState.READY;
                this.textOverlay.show('对手已选择不继续对局', 3000);
            }
        };


        for (let key in this.listeners) {
            this.socketClient.add(key, this.listeners[key]);
        }
    }

    onSceneExit() {
        super.onSceneExit();

        for (let key in this.listeners) {
            this.socketClient.signals[key].remove(this.listeners[key]);
        }
        this.channelManager.leaveChannel(this.room.channelId);
        this.socketClient.removeEventListener(egret.Event.CLOSE, this.connectionCloseHandler, this);

        this.context.chatOverlay.popIn();
    }

    notReadyTimer: any;
    onAppVisibilityChange(hidden: boolean) {        
        if (this.gameState.value == GameState.PLAYING) {
            return;
        }
        if (this.gameState.value == GameState.READY) {
            if (hidden) {
                this.notReadyTimer = setTimeout(() => {
                    this.socketClient.send('play.ready', {readied: false});
                }, 10 * 1000);
            } else {
                clearTimeout(this.notReadyTimer);
            }
        }
    }

    private onGameOver(winChessHost: ChessHost) {
        // 设置未准备状态
        this.otherReadied.value = false;
        this.readied.value = false;
        this.gameState.value = GameState.READY;

        // 请求对局结束
        let result = winChessHost == null
            ? 0 : winChessHost == this.chessHost.value ? 1 : 2;
        this.socketClient.send('play.game_over', {result});
        this.resultDialog.open(result);
        this.resultDialog.onOk = () => {
            // 更新等待信息
            this.updateWaitInfo();
        }
    }

    private onChessboardClick(event: ChessboardClickEvent) {
        if (this.gameState.value != GameState.PLAYING) {
            return;
        }

        if (event.chess == null) {
            // 点击了空白处
            // 并且已经选择了一个棋子
            if (this.lastSelected != null) {
                // 往空白处移动                
                let fromPos = this.lastSelected.getPos();
                let toPos = event.pos;
                let chess = this.chessboard.chessAt(fromPos);
                if (chess.canGoTo(toPos, this.player)) {
                    this.socketClient.send('play.chess_move', {
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
                if (event.chess.getHost() == this.activeChessHost.value) {
                    this.lastSelected = event.chess;
                    this.lastSelected.setSelected(true);
                    this.socketClient.send('play.chess_pick', {
                        pos: this.lastSelected.getPos(),
                        pickup: true
                    });

                    // 将非持棋方的棋子全部启用（这样下次才能点击要吃的目标棋子）
                    this.chessboard.getChessList().forEach(chess => {
                        if (chess.getHost() != this.chessHost.value) {
                            chess.touchEnabled = true;
                        }
                    });
                }
            } else if (event.chess.isSelected() && event.chess.getHost() == this.chessHost.value) {
                // 重复点击，取消选中
                this.lastSelected.setSelected(false);
                this.socketClient.send('play.chess_pick', {
                    pos: this.lastSelected.getPos(),
                    pickup: false
                });
                this.lastSelected = null;
            } else {
                // 当选择了两个棋子（包括了空棋子），并且两个棋子属于不同棋方，是吃子
                if (event.chess.getHost() != this.activeChessHost.value) {
                    let fromPos = this.lastSelected.getPos();
                    let toPos = event.pos;
                    let chess = this.chessboard.chessAt(fromPos);
                    if (chess.canGoTo(toPos, this.player)) {
                        this.socketClient.send('play.chess_move', {
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
                    this.socketClient.send('play.chess_pick', {
                        pos: this.lastSelected.getPos(),
                        pickup: true
                    });
                }
            }
        }
    }

    private onWhiteFlagClick() {
        this.socketClient.send('play.confirm_request', {reqType: confirmRequest.Type.WHITE_FLAG});
        this.textOverlay.show('已发送认输请求，等待对方回应', 3000);
    }

    private onChessDrawClick() {
        this.socketClient.send('play.confirm_request', {reqType: confirmRequest.Type.DRAW});
        this.textOverlay.show('已发送和棋请求，等待对方回应', 3000);
    }

    private onWithdrawClick() {
        this.socketClient.send('play.confirm_request', {reqType: confirmRequest.Type.WITHDRAW});
        this.textOverlay.show('已发送悔棋请求，等待对方回应', 3000);
    }

    private onTurnActiveChessHost(activeChessHost: ChessHost) {
        this.activeChessHost.value = activeChessHost;

        this.chessboard.touchEnabled = this.activeChessHost.value == this.chessHost.value;
        this.chessboard.getChessList().forEach(chess => {
            // 如果当前是本方走，将敌方棋子禁用；否则，全部禁用
            chess.touchEnabled = this.activeChessHost.value == this.chessHost.value
                ? this.chessHost.value == chess.getHost()
                : false;
        });
        this.lastSelected = null;
    }

    private onBackClick() {
        const doLeave = () => {
            let partRoomRequest = new PartRoomRequest(this.room);
            partRoomRequest.success = () => {
                this.popScene();
            };
            partRoomRequest.failure = () => {
                this.popScene();
            };
            this.api.queue(partRoomRequest);
        };

        if (this.gameState.value == GameState.READY) {
            doLeave();
            return;
        }

        this.confirmLeaveDialog.onOk = doLeave;
        this.confirmLeaveDialog.show();
    }

    private updateWaitInfo() {
        let status = 4;
        if (this.otherUser.value == null) {
            status = 0;
        } else if (!this.readied.value && !this.otherReadied.value) {
            status = 1;
        } else if (this.readied.value && !this.otherReadied.value) {
            status = 2;
        } else if (!this.readied.value && this.otherReadied.value) {
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
                3: '对方已准备'
            }[status]);
        }
    }
}