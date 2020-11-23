import DisplayChess from "./DisplayChess";
import DisplayChessboard from "./DisplayChessboard";
import ChessK from "../../rule/chess/ChessK";
import ChessHost from "../../rule/chess_host";
import ChessPos from "../../rule/ChessPos";
import RoundGame from "../../rule/RoundGame";
import ChessTargetDrawer from "./ChessTargetDrawer";
import Checkmate from "../../rule/Checkmate";
import CheckmateOverlay from "./CheckmateOverlay";
import ChessEatOverlay from "./ChessEatOverlay";
import SOUND from "../../audio/SOUND";
import ChessboardClickEvent from "./ChessboardClickEvent";
import ChessAction from "../../rule/ChessAction";
import CHESS_CLASS_KEY_MAP, { createIntialLayoutChessList } from "../../rule/chess_map";
import GameStates from "../../online/play/GameStates";

export default class Player extends eui.Group implements RoundGame {
    public chessboard: DisplayChessboard;
    // 视角棋方
    private viewChessHost: ChessHost;
    private lastViewChessHost: ChessHost;
    // 当前走棋方
    private activeChessHost: ChessHost;
    private checkmate: Checkmate;
    private chessEatOverlay = new ChessEatOverlay();
    private checkmateOverlay = new CheckmateOverlay();
    private chessActionStack: Array<ChessAction>;
    fromPosTargetDrawer: ChessTargetDrawer;
    onWin: Function;
    onTurnActiveChessHost: Function;

    constructor() {
        super();

        let layout = new eui.HorizontalLayout();
        layout.horizontalAlign = egret.HorizontalAlign.CENTER;
        layout.paddingLeft = 1;
        layout.paddingRight = 1;
        this.layout = layout;

        this.height = 567;
        this.width = 548 - 2;

        this.chessboard = new DisplayChessboard(this.height, this.width);
        this.chessboard.addEventListener(ChessboardClickEvent.TYPE, (event: ChessboardClickEvent) => {
            this.dispatchEvent(event);
        }, this);
        this.addChild(this.chessboard);
        this.chessboard.addChild(this.chessEatOverlay);
        this.chessboard.addChild(this.checkmateOverlay);

        this.fromPosTargetDrawer = new ChessTargetDrawer(this.chessboard);
    }

    //Override
    getChessboard() {
        return this.chessboard;
    }

    //Override
    isHostAtChessboardTop(chessHost: ChessHost) {
        // 视角棋方总是在底部
        return chessHost != this.viewChessHost;
    }

    startRound(viewChessHost: ChessHost, gameStates?: GameStates) {
        this.lastViewChessHost = this.viewChessHost;
        this.viewChessHost = viewChessHost;
        if (this.lastViewChessHost == null) {
            this.lastViewChessHost = viewChessHost;
        }
        this.activeChessHost = (gameStates && gameStates.activeChessHost) || ChessHost.RED;
        this.chessActionStack = [];

        this.fromPosTargetDrawer.clear();

        if (gameStates && gameStates.chesses) {
            // 把棋子放到棋盘上
            this.clearChessboard();
            gameStates.chesses.forEach(chess => {
                let pos = new ChessPos(chess.row, chess.col);
                // 服务器保存数据默认视角是红方，如果当前视图是黑方就要翻转下
                if (this.viewChessHost == ChessHost.BLACK) {
                    pos = pos.reverseView();
                }
                chess = new CHESS_CLASS_KEY_MAP[chess.type](pos, chess.host);
                this.addChess(new DisplayChess(chess));
            });
        } else {
            this.initChessLayout();
        }

        this.checkmate = new Checkmate(this, this.viewChessHost);

        this.chessboard.touchEnabled = false;
        this.chessboard.getChessList().forEach(chess => {
            chess.touchEnabled = false;
        });

        this.onTurnActiveChessHost(this.activeChessHost);

        if (gameStates) {
            this.loadActionStackState(gameStates);
        }
    }

    pickChess(picked: boolean, pos: ChessPos, chessHost: ChessHost) {
        this.chessboard.getChessList().forEach((chess: DisplayChess) => {
            if (chess.isSelected() && chess.getHost() == chessHost) {
                chess.setSelected(false);
            }
        });
        
        pos = this.convertViewPos(pos, chessHost);
        this.chessboard.chessAt(pos).setSelected(picked);
    }

    private loadActionStackState(states: GameStates) {
        if (!(states.actionStack && states.actionStack.length)) {
            return;
        }
        let actionStack: Array<ChessAction> = states.actionStack.map(act => {
            let action = new ChessAction();
            action.chessHost = ChessHost[<string>act.chessHost];
            action.chessType = CHESS_CLASS_KEY_MAP[act.chessType];
            action.fromPos = ChessPos.make(act.fromPos);
            action.toPos = ChessPos.make(act.toPos);
            if (act.eatenChess) {
                let chessClass = CHESS_CLASS_KEY_MAP[act.eatenChess.type];
                let chess = new chessClass(
                    this.convertViewPos(act.toPos, action.chessHost),
                    ChessHost[<string>act.eatenChess.chessHost]);
                action.eatenChess = chess;
            }
            return action;
        });
        this.loadActionStack(actionStack);

        let lastAction = actionStack[actionStack.length - 1];
        let { chessHost, fromPos, toPos } = lastAction;
        this.fromPosTargetDrawer.draw(this.convertViewPos(fromPos, chessHost));
        let chess = this.chessboard.chessAt(this.convertViewPos(toPos, chessHost));
        if (chess) {
            chess.setLit(true);
        }
    }

    moveChess(fromPos: ChessPos, toPos: ChessPos, chessHost: ChessHost, isEat: boolean) {
        this.chessboard.getChessList().forEach((chess: DisplayChess) => {
            if (chess.isLit()) {
                chess.setLit(false);
            }
        });

        // 被移动棋子
        let chess = this.chessboard.chessAt(this.convertViewPos(fromPos, chessHost));
        let targetChess: DisplayChess;

        // 记录动作
        let action = new ChessAction();
        action.chessHost = chessHost;
        action.chessType = chess.constructor;
        action.fromPos = fromPos;
        action.toPos = toPos;
        if (isEat) {
            // 吃目标棋子
            targetChess = this.chessboard.chessAt(this.convertViewPos(toPos, chessHost))
            action.eatenChess = targetChess;
            this.chessboard.removeChild(targetChess);
        }
        this.chessActionStack.push(action);

        // 被移动棋子选择状态置不选中
        chess.setSelected(false);
        toPos = this.convertViewPos(toPos, chessHost);
        // 移动棋子动画
        const {x, y} = this.chessboard.calcChessDisplayPos(toPos);
        egret.Tween.get(chess).to({x, y}, 200, egret.Ease.circOut).call(() => {
            // 高亮被移动棋子
            chess.setLit(true);
            // 画移动源位置标记
            this.fromPosTargetDrawer.draw(this.convertViewPos(fromPos, chessHost));
            // 音效
            let soundChannel = SOUND.get('click').play(0, 1);
            soundChannel.volume = 0.7;

            // 设置棋盘状态
            this.chessboard.getChessArray()[chess.getPos().row][chess.getPos().col] = null;
            this.chessboard.getChessArray()[toPos.row][toPos.col] = chess;
            chess.setPos(toPos);
        
            if (isEat) {
                // 判断胜负
                if (targetChess != null && targetChess.is(ChessK)) {
                    this.onWin(chess.getHost());
                } else {
                    this.chessEatOverlay.show();
                    this.checkCheckmate();
                    this.turnActiveChessHost();
                }
            } else {
                this.checkCheckmate();
                this.turnActiveChessHost();
            }
        });
    }

    /** 悔棋 */
    withdraw(): boolean {        
        this.chessboard.getChessList().forEach((chess: DisplayChess) => {
            if (chess.isSelected()) {
                chess.setSelected(false);
            }
        });
        this.fromPosTargetDrawer.clear(true);

        let lastAction = this.chessActionStack.pop();

        // 视角可能变化了，需要转换下
        let fromPos = this.convertViewPos(lastAction.fromPos, lastAction.chessHost);
        let toPos = this.convertViewPos(lastAction.toPos, lastAction.chessHost);
        let chess = this.chessboard.chessAt(toPos);

        // 动画移到之前的开始位置
        const {x, y} = this.chessboard.calcChessDisplayPos(fromPos);
        chess.setLit(false);
        egret.Tween.get(chess).to({x, y}, 200, egret.Ease.circOut).call(() => {
            // 如果吃了子，把被吃的子加回来
            if (lastAction.eatenChess) {
                if (lastAction.eatenChess instanceof DisplayChess) {
                    this.addChess(lastAction.eatenChess);
                } else {
                    this.addChess(new DisplayChess(lastAction.eatenChess));
                }
            }
            
            // 恢复之前的状态
            chess.setPos(fromPos);
            this.chessboard.getChessArray()[fromPos.row][fromPos.col] = chess;
            this.chessboard.getChessArray()[toPos.row][toPos.col] = null;

            // 画上手的棋子走位标记
            if (this.chessActionStack.length > 0) {
                let prevAction = this.chessActionStack[this.chessActionStack.length - 1];
                let chess = this.chessboard.chessAt(
                    this.convertViewPos(prevAction.toPos, prevAction.chessHost));
                chess.setLit(true);
                this.fromPosTargetDrawer.draw(
                    this.convertViewPos(prevAction.fromPos, prevAction.chessHost));
            }
            
            this.turnActiveChessHost();
        });
 
        return this.chessActionStack.length > 0;
    }

    loadActionStack(actionStack: Array<ChessAction>) {
        this.chessActionStack = actionStack;
    }

    clearChessboard() {
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                let chess = this.chessboard.chessAt(new ChessPos(row, col));
                if (chess) {
                    this.chessboard.removeChild(chess);
                }
            }
        }
    }

    turnActiveChessHost() {
        this.activeChessHost = ChessHost.reverse(this.activeChessHost);
        this.onTurnActiveChessHost(this.activeChessHost);
    }
    
    reverseChessLayoutView() {
        // 保存下棋子引用
        let chesses = [];
        this.chessboard.getChessList().forEach(chess => {
            chesses.push(chess);
        });
        // 清空棋盘
        this.clearChessboard();
        // 改变位置重新加上去
        chesses.forEach(chess => {
            chess.setPos(ChessPos.reverseView(chess.getPos()));
            this.addChess(chess);
        });

        // 改变位置重新画标记
        let fromPos = this.fromPosTargetDrawer.getSavePos();
        if (fromPos) {
            this.fromPosTargetDrawer.draw(ChessPos.reverseView(fromPos));
        }

        this.lastViewChessHost = this.viewChessHost;
        this.viewChessHost = ChessHost.reverse(this.viewChessHost);
    }

    private initChessLayout() {
        /*
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++)
                new ChessTargetDrawer(this.chessboard).draw(new ChessPos(row, col));
        }
        return;*/
        this.clearChessboard();
        // 对面棋方棋子在上部
        const chessHost1 = ChessHost.reverse(this.viewChessHost);
        // 视角棋方棋子在下部
        const chessHost2 = this.viewChessHost;

        createIntialLayoutChessList(chessHost1, chessHost2).forEach(chess => {
            this.addChess(new DisplayChess(chess));
        });
    }

    /**
     * 将源视角棋方的棋子位置转换为当前设置的视角棋方((this.viewChessHost)的棋子位置
     * @param pos 源视角棋方的棋子位置
     * @param chessHost 源视角棋方
     */
    convertViewPos(pos: ChessPos, chessHost: ChessHost) {
        return this.viewChessHost == chessHost ? pos : ChessPos.reverseView(pos);
    }

    private checkCheckmate() {
        // 判断将军
        if (this.checkmate.check(ChessHost.reverse(this.activeChessHost))) {
            this.checkmateOverlay.show(this.activeChessHost);
        }
    }

    private addChess(chess: DisplayChess) {
        const size = this.chessboard.calcChessSize();
        chess.setSize(size, size);
        this.chessboard.getChessArray()[chess.getPos().row][chess.getPos().col] = chess;
        this.setChessDisplayPos(chess);
        chess.touchEnabled = true;
        // 可能重复加，删除之前绑定的处理器
        chess.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onChessClick, this);
        
        chess.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onChessClick, this);
        this.chessboard.addChildAt(chess, 10);
    }

    private onChessClick(touchEvent: egret.TouchEvent) {
        let event = new ChessboardClickEvent();
        event.chess = (<DisplayChess>touchEvent.target);
        event.pos = event.chess.getPos();
        this.dispatchEvent(event);
    }

    private setChessDisplayPos(chess: DisplayChess) {
        const {x, y} = this.chessboard.calcChessDisplayPos(chess.getPos());
        chess.anchorOffsetX = this.chessboard.calcChessSize() / 2;
        chess.anchorOffsetY = this.chessboard.calcChessSize() / 2;
        chess.x = x;
        chess.y = y;
    }
}