import DisplayChess from "./DisplayChess";
import ChessHost from "../../rule/chess_host";
import confirmRequest from '../../rule/confirm_request';
import ChessboardClickEvent from "./ChessboardClickEvent";
import AbstractScene from "../AbstractScene";
import SceneContext from "../SceneContext";
import ReadyButton from "./ReadyButton";
import UserInfoPane from "./UserInfoPane";
import messager from "../../component/messager";
import ResultDialog from "./ResultDialog";
import User from "../../user/User";
import Player from "./Player";
import DisplayChessboard from "./DisplayChessboard";
import Room from "../../online/room/Room";
import Channel from "../../online/chat/Channel";
import ConfirmDialog from "./ConfirmDialog";
import PlayingRoundButtonsOverlay from "./PlayingRoundButtonsOverlay";
import TextOverlay from "./TextOverlay";
import ChannelManager from "../../online/chat/ChannelManager";
import ChannelType from "../../online/chat/ChannelType";
import notify, { allowNotify } from "../../component/notify";
import APIAccess from "../../online/api/APIAccess";
import PartRoomRequest from "../../online/room/PartRoomRequest";
import SocketClient from "../../online/socket";
import UserGameState from "../../online/room/UserGameState";
import GameStates from "../../online/play/GameStates";
import ConfirmLeaveDialog from "../../overlay/play/ConfirmLeaveDialog";

export default class PlayScene extends AbstractScene {
    // socket消息监听器
    private listeners = {};
    private api: APIAccess;
    private socketClient: SocketClient;
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
    private readied: boolean;
    private otherUserGameState: UserGameState;
    private isPlaying = false;
    private room: Room;
    private user: User;
    private otherUser: User;
    private otherUserInfoPane = new UserInfoPane();
    private lblSpectatorNum = new eui.Label();
    private btnReady: ReadyButton;
    private btnRoundOps = new eui.Button();
    private playingRoundButtonsOverlay = new PlayingRoundButtonsOverlay();
    private confirmDialog = new ConfirmDialog();
    private textOverlay = new TextOverlay();
    private resultDialog = new ResultDialog();
    private confirmLeaveDialog: ConfirmLeaveDialog = new ConfirmLeaveDialog();
    
    constructor(context: SceneContext, states: Room | GameStates, isContinue: boolean = false) {
        super(context);

        this.api = context.api;
        this.channelManager = context.channelManager;
        this.socketClient = context.socketClient;

        this.user = this.api.localUser;
        if (!isContinue) {
            this.room = <Room>states;
        } else {
            this.room = (<GameStates>states).room;
        }

        let userGameState: UserGameState;
        if (this.room.blackChessUser && this.room.blackChessUser.id == this.user.id) {
            userGameState = this.room.blackGameState;
            this.chessHost = ChessHost.BLACK;
            this.otherUser = this.room.redChessUser;
            this.otherUserGameState = this.room.redGameState;
        }
        if (this.room.redChessUser && this.room.redChessUser.id == this.user.id) {
            userGameState = this.room.redGameState;
            this.chessHost = ChessHost.RED;
            this.otherUser = this.room.blackChessUser;
            this.otherUserGameState = this.room.blackGameState;
        }
        this.readied = userGameState.readied;

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

        let { lblSpectatorNum } = this;
        lblSpectatorNum.size = 20;
        headInfo.addChild(lblSpectatorNum);

        head.addChild(headInfo);

        this.updateSpectatorCount(this.room.spectatorCount);

        if (this.otherUser != null) {
            this.otherUserInfoPane.load(this.otherUser, ChessHost.reverse(this.chessHost), this.otherUserGameState);
        }
        head.addChild(this.otherUserInfoPane);
        

        this.player = new Player();
        this.player.onWin = this.onWin.bind(this);
        this.player.onTurnActiveChessHost = this.onTurnActiveChessHost.bind(this);
        this.player.addEventListener(ChessboardClickEvent.TYPE, this.onChessboardClick, this);
        this.chessboard = this.player.chessboard;
        this.chessboard.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.playingRoundButtonsOverlay.visible = false;
        }, this);

        this.chessboard.addChild(this.confirmDialog);
        let {btnWhiteFlag, btnChessDraw, btnWithdraw} = this.playingRoundButtonsOverlay;
        btnWhiteFlag.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onWhiteFlagClick, this);
        btnChessDraw.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onChessDrawClick, this);
        btnWithdraw.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onWithdrawClick, this);
        this.chessboard.addChild(this.playingRoundButtonsOverlay);
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
        btnLeave.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
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

            if (!this.isPlaying) {
                doLeave();
                return;
            }

            this.confirmLeaveDialog.onOk = doLeave;
            this.confirmLeaveDialog.show();
        }, this);
        buttonGroup.addChild(btnLeave);

        // 准备按钮
        this.btnReady = new ReadyButton(this.otherUserGameState != null && this.otherUserGameState.readied ? 3 : +this.readied);
        this.btnReady.visible = !(this.readied && this.otherUserGameState != null && this.otherUserGameState.readied);
        this.btnReady.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.socketClient.send('play.ready');
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

        this.chessboard.addEventListener(egret.TouchEvent.TOUCH_TAP, (event: egret.TextEvent) => {
            this.context.chatOverlay.popOut();
        }, this);


        let channel = new Channel();
        channel.id = this.room.channelId;
        channel.name = `当前棋桌`;
        channel.type = ChannelType.ROOM;
        this.channelManager.joinChannel(channel);

        if ('Notification' in window) {
            setTimeout(() => {
                Notification.requestPermission();
            }, 500);
        }

        this.initListeners();

        this.updateWaitInfo();

        if (isContinue) {
            this.isPlaying = true;
            this.playingRoundButtonsOverlay.onPlaying(true);
        }
        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            let height = this.stage.stageHeight - this.context.toolbar.height;
            let width = this.stage.stageWidth;
            this.player.x = (width - this.player.width) / 2;
            this.player.y = (height - this.player.height) / 2;
            buttonGroup.x = this.player.x;
            buttonGroup.y = height - buttonGroup.height;
            head.x = this.player.x;
            this.player.startRound(this.chessHost, (<GameStates>states));
        }, this);
    }

    private initListeners() {

        this.socketClient.addEventListener(egret.Event.CLOSE, this.connectionCloseHandler = (event: egret.Event) => {
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
            if (msg.uid == this.user.id) {
                return;
            } else {
                this.isPlaying = false;
                this.otherUserGameState = null;
                this.otherUserInfoPane.load(null);
                this.updateWaitInfo();
                this.btnReady.visible = true;
                this.btnRoundOps.visible = false;
                this.btnReady.setState(+this.readied);
                this.chessboard.touchEnabled = false;
                this.chessboard.getChessList().forEach(chess => {
                    chess.touchEnabled = false;
                });
                this.textOverlay.visible = false;
                messager.info('对手已离开棋桌', this);
            }
        };

        this.listeners['user.offline'] = (msg: any) => {
            this.textOverlay.show('对手已下线/掉线，你可以等待对方回来继续');
            this.otherUserInfoPane.updateOnline(false);
        };
        
        this.listeners['play.offline_continue'] = (msg: any) => {
            if (msg.uid == this.user.id) {
                return;
            }
            if (msg.ok) {
                this.textOverlay.show('对手已回来', 3000);
                this.otherUserInfoPane.updateOnline(true);
            } else {
                this.textOverlay.show('对手已选择不继续对局', 3000);
            }
        };

        this.listeners['room.join'] = (msg: any) => {
            window.focus();
            this.otherUser = msg.user;
            this.otherUserGameState = new UserGameState();
            this.otherUserGameState.online = true;
            this.otherUserGameState.readied = false;
            this.otherUserInfoPane.load(this.otherUser, ChessHost.reverse(this.chessHost));
            this.updateWaitInfo();
            setTimeout(() => {
                let info = `玩家[${this.otherUser.nickname}]已加入棋桌`;
                if (document.hidden && allowNotify()) {
                    notify(info, this);
                } else {
                    messager.info(info, this);
                }
            }, 100);
        };

        this.listeners['play.ready'] = (msg: any) => {
            if (msg.uid == this.user.id) {
                this.readied = msg.readied;
            } else {
                this.otherUserGameState.readied = msg.readied;
            }
            if (!this.isPlaying) {
                this.updateWaitInfo();
            }
            this.btnReady.setState(this.otherUserGameState != null && this.otherUserGameState.readied ? 3 : +this.readied);
        };

        this.listeners['play.round_start'] = (msg: any) => {
            this.btnReady.visible = false;
            this.btnRoundOps.visible = true;
            this.textOverlay.visible = false;
            this.chessHost = msg.chessHost;
            this.lastSelected = null;
            this.isPlaying = true;
            this.player.startRound(this.chessHost);
            this.playingRoundButtonsOverlay.onPlaying(true);
            this.textOverlay.show(`开始对局`, 2000);
        };

        this.listeners['play.chess_pick'] = (msg) => {
            if (msg.chessHost == this.chessHost) {
                return;
            }
            
            window.focus();
            
            this.player.pickChess(msg.pickup, msg.pos, msg.chessHost);
        };

        this.listeners['play.chess_move'] = (msg: any) => {
            if (msg.chessHost != this.chessHost) {
                window.focus();
            }
            // 走了一步，可以悔棋
            if (!this.playingRoundButtonsOverlay.btnWithdraw.enabled) {
                this.playingRoundButtonsOverlay.btnWithdraw.enabled = true;
            }

            this.player.moveChess(msg.fromPos, msg.toPos, msg.chessHost, msg.moveType == 2);
        };

        this.listeners['play.confirm_request'] = (msg: any) => {
            // 如果是自己发送的请求
            if (msg.chessHost == this.chessHost) {
                return;
            }

            // 对方发送的请求
            // 显示确认对话框
            this.confirmDialog.show(confirmRequest.toReadableText(msg.reqType));
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
                if (msg.chessHost != this.chessHost) {
                    this.textOverlay.show(`对方不同意${confirmRequest.toReadableText(msg.reqType)}`, 3000);
                }
                return;
            }

            // 如果不同意
            if (msg.chessHost != this.chessHost) {
                this.textOverlay.show(`对方同意${confirmRequest.toReadableText(msg.reqType)}`, 3000);
            }

            switch (msg.reqType) {
                case confirmRequest.Type.WHITE_FLAG:
                    this.onWin(msg.chessHost);
                    break;
                case confirmRequest.Type.DRAW:
                    this.onWin(null);
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
            this.socketClient.add(key, this.listeners[key]);
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

    notReadyTimer: any;
    onAppVisibilityChange(hidden: boolean) {        
        if (this.isPlaying) {
            return;
        }
        if (this.readied) {
            if (hidden) {
                this.notReadyTimer = setTimeout(() => {
                    this.socketClient.send('play.ready', {readied: false});
                }, 10 * 1000);
            } else {
                clearTimeout(this.notReadyTimer);
            }
        }
    }

    private onWin(winChessHost: ChessHost) {
        // 禁用棋盘
        this.chessboard.touchEnabled = false;
        this.chessboard.getChessList().forEach(chess => {
            chess.touchEnabled = false;
        });
        // 设置未准备状态
        this.otherUserGameState.readied = false;
        this.readied = false;
        // 隐藏对局操作按钮
        this.btnRoundOps.visible = false;
        this.playingRoundButtonsOverlay.onPlaying(false);
        // 准备按钮状态恢复初始
        this.btnReady.setState(0);

        // 请求对局结束
        this.socketClient.send('play.round_over');
        this.resultDialog.show(winChessHost == null ? null : winChessHost == this.chessHost);
        this.resultDialog.onOk = () => {
            this.isPlaying = false;
            // 显示准备按钮
            this.btnReady.visible = true;
            // 更新等待信息
            this.updateWaitInfo();
        }
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
                if (event.chess.getHost() == this.activeChessHost) {
                    this.lastSelected = event.chess;
                    this.lastSelected.setSelected(true);
                    this.socketClient.send('play.chess_pick', {
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
                this.socketClient.send('play.chess_pick', {
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
        if (!this.isPlaying) {
            return;
        }

        this.activeChessHost = activeChessHost;

        this.otherUserInfoPane.setActive(ChessHost.reverse(this.chessHost) == this.activeChessHost);
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
        if (this.otherUserGameState === null) {
            status = 0;
        } else if (!this.readied && !this.otherUserGameState.readied) {
            status = 1;
        } else if (this.readied && !this.otherUserGameState.readied) {
            status = 2;
        } else if (!this.readied && this.otherUserGameState.readied) {
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