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
import ChessTargetDrawer from "./ChessTargetDrawer";
import Checkmate from "./rule/Checkmate";
import CheckmateOverlay from "./CheckmateOverlay";
import ChessEatOverlay from "./ChessEatOverlay";
import SOUND from "../../audio/SOUND";
import ChessboardClickEvent from "./ChessboardClickEvent";
import Chess from "./rule/Chess";
import ChessAction from "./ChessAction";

export default class Player extends eui.Group implements RoundGame {
    public chessboard = new DisplayChessboard();
    // 视角棋方
    private viewChessHost: ChessHost;
    private lastViewChessHost: ChessHost;
    // 当前走棋方
    private activeChessHost: ChessHost;
    private checkmate: Checkmate;
    fromPosTargetDrawer = new ChessTargetDrawer(this.chessboard);
    private chessEatOverlay = new ChessEatOverlay();
    private checkmateOverlay = new CheckmateOverlay();
    private chessActionStack: Array<ChessAction>;

    constructor() {
        super();

        this.width = this.chessboard.width;
        this.height = this.chessboard.height;

        this.addChild(this.chessboard);

        this.addChild(this.chessEatOverlay);
        this.addChild(this.checkmateOverlay);

        this.chessboard.addEventListener(ChessboardClickEvent.TYPE, (event: ChessboardClickEvent) => {
            this.dispatchEvent(event);
        }, this);
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

    startRound(viewChessHost: ChessHost, activeChessHost?: ChessHost, chesses?: Array<any>) {
        this.lastViewChessHost = this.viewChessHost;
        this.viewChessHost = viewChessHost;
        if (this.lastViewChessHost == null) {
            this.lastViewChessHost = viewChessHost;
        }
        this.activeChessHost = activeChessHost || ChessHost.RED;
        this.chessActionStack = [];

        this.fromPosTargetDrawer.clear();

        if (chesses) {
            // 把棋子放到棋盘上
            const chessClassMap = {
                R: ChessR,
                N: ChessN,
                M: ChessM,
                G: ChessG,
                K: ChessK,
                C: ChessC,
                S: ChessS
            };
            this.clearChessboard();
            chesses.forEach(chess => {
                let pos = new ChessPos(chess.row, chess.col);
                // 服务器保存数据默认视角是红方，如果是黑方就翻转下
                if (this.viewChessHost == ChessHost.BLACK) {
                    pos = this.reverseViewPos(pos);
                }
                chess = new chessClassMap[chess.type](pos, chess.host);
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

    moveChess(fromPos: ChessPos, toPos: ChessPos, chessHost: ChessHost) {
        let chess = this.chessboard.chessAt(this.convertViewPos(fromPos, chessHost));

        this.chessboard.getChessList().forEach((chess: DisplayChess) => {
            if (chess.isLit()) {
                chess.setLit(false);
            }
        });

        chess.setSelected(false);
        chess.setLit(true);
        this.fromPosTargetDrawer.draw(this.convertViewPos(fromPos, chessHost));
        let soundChannel = SOUND.get('click').play(0, 1);
        soundChannel.volume = 0.7;

        // 记录动作
        let action = new ChessAction();
        action.chessHost = chessHost;
        action.chessType = chess.constructor;
        action.fromPos = fromPos;
        action.toPos = toPos;
        this.chessActionStack.push(action);

        this.moveOneChess(chess, this.convertViewPos(toPos, chessHost));

        this.checkCheckmate();
        this.turnActiveChessHost();
    }

    eatChess(fromPos: ChessPos, toPos: ChessPos, chessHost: ChessHost) {
        this.chessboard.getChessList().forEach((chess: DisplayChess) => {
            if (chess.isLit()) {
                chess.setLit(false);
            }
        });

        let sourceChess = this.chessboard.chessAt(this.convertViewPos(fromPos, chessHost));
        sourceChess.setSelected(false);
        sourceChess.setLit(true);
        this.fromPosTargetDrawer.draw(this.convertViewPos(fromPos, chessHost));
        let soundChannel = SOUND.get('click').play(0, 1);
        soundChannel.volume = 0.7;
        this.chessEatOverlay.show();

        let targetChess = this.chessboard.chessAt(this.convertViewPos(toPos, chessHost));

        // 记录动作
        let action = new ChessAction();
        action.chessHost = chessHost;
        action.chessType = sourceChess.constructor;
        action.fromPos = fromPos;
        action.toPos = toPos;
        action.eatenChess = targetChess;
        this.chessActionStack.push(action);
        
        this.chessboard.removeChild(targetChess);
        this.moveOneChess(sourceChess, this.convertViewPos(toPos, chessHost));
        this.checkCheckmate();
        this.turnActiveChessHost();
    }

    /** 悔棋 */
    withdraw() {        
        let lastAction = this.chessActionStack.pop();

        // 视角可能变化了，需要转换下
        let fromPos = this.convertViewPos(lastAction.fromPos, lastAction.chessHost);
        let toPos = this.convertViewPos(lastAction.toPos, lastAction.chessHost);
        let chess = this.chessboard.chessAt(toPos);

        // 动画移到之前的开始位置
        const {x, y} = this.chessboard.calcChessDisplayPos(fromPos);
        this.fromPosTargetDrawer.clear(true);
        egret.Tween.get(chess).to({x, y}, 300, egret.Ease.circOut).call(() => {
            chess.setLit(false);
        });

        // 恢复之前的状态
        this.chessboard.getChessArray()[fromPos.row][fromPos.col] = chess;
        this.chessboard.getChessArray()[toPos.row][toPos.col] = null;
        chess.setPos(fromPos);

        // 如果吃了子，把被吃的子加回来
        if (lastAction.eatenChess) {
            this.addChess(lastAction.eatenChess);
        }

        // 当前持棋控制权再转回来
        this.turnActiveChessHost();
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
        this.activeChessHost = reverseChessHost(this.activeChessHost);
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
            chess.setPos(this.reverseViewPos(chess.getPos()));
            this.addChess(chess);
        });

        // 改变位置重新画标记
        let fromPos = this.fromPosTargetDrawer.getSavePos();
        if (fromPos) {
            this.fromPosTargetDrawer.draw(this.reverseViewPos(fromPos));
        }

        this.lastViewChessHost = this.viewChessHost;
        this.viewChessHost = reverseChessHost(this.viewChessHost);
    }

    private initChessLayout() {
        this.clearChessboard();
        const chessHost1 = reverseChessHost(this.viewChessHost);
        const chessHost2 = this.viewChessHost;

        [
            // 对面棋方棋子在上部
            new ChessR(new ChessPos(0, 0), chessHost1),
            new ChessN(new ChessPos(0, 1), chessHost1),
            new ChessM(new ChessPos(0, 2), chessHost1),
            new ChessG(new ChessPos(0, 3), chessHost1),
            new ChessK(new ChessPos(0, 4), chessHost1),
            new ChessG(new ChessPos(0, 5), chessHost1),
            new ChessM(new ChessPos(0, 6), chessHost1),
            new ChessN(new ChessPos(0, 7), chessHost1),
            new ChessR(new ChessPos(0, 8), chessHost1),
            new ChessC(new ChessPos(2, 1), chessHost1),
            new ChessC(new ChessPos(2, 7), chessHost1),
            new ChessS(new ChessPos(3, 0), chessHost1),
            new ChessS(new ChessPos(3, 2), chessHost1),
            new ChessS(new ChessPos(3, 4), chessHost1),
            new ChessS(new ChessPos(3, 6), chessHost1),
            new ChessS(new ChessPos(3, 8), chessHost1),
            // 视角棋方棋子在下部
            new ChessR(new ChessPos(9, 0), chessHost2),
            new ChessN(new ChessPos(9, 1), chessHost2),
            new ChessM(new ChessPos(9, 2), chessHost2),
            new ChessG(new ChessPos(9, 3), chessHost2),
            new ChessK(new ChessPos(9, 4), chessHost2),
            new ChessG(new ChessPos(9, 5), chessHost2),
            new ChessM(new ChessPos(9, 6), chessHost2),
            new ChessN(new ChessPos(9, 7), chessHost2),
            new ChessR(new ChessPos(9, 8), chessHost2),
            new ChessC(new ChessPos(7, 1), chessHost2),
            new ChessC(new ChessPos(7, 7), chessHost2),
            new ChessS(new ChessPos(6, 0), chessHost2),
            new ChessS(new ChessPos(6, 2), chessHost2),
            new ChessS(new ChessPos(6, 4), chessHost2),
            new ChessS(new ChessPos(6, 6), chessHost2),
            new ChessS(new ChessPos(6, 8), chessHost2),
        ].forEach(chess => {
            this.addChess(new DisplayChess(chess));
        });
    }

    /**
     * 将源视角棋方的棋子位置转换为当前设置的视角棋方((this.viewChessHost)的棋子位置
     * @param pos 源视角棋方的棋子位置
     * @param chessHost 源视角棋方
     */
    convertViewPos(pos: ChessPos, chessHost: ChessHost) {
        return this.viewChessHost == chessHost ? pos : this.reverseViewPos(pos);
    }
    
    /**
     * 翻转视角坐标
     * @param pos
     */
    reverseViewPos(pos: ChessPos) {
        return new ChessPos(9 - pos.row, 8 - pos.col);
    }

    private checkCheckmate() {
        // 判断将军
        if (this.checkmate.check(reverseChessHost(this.activeChessHost))) {
            this.checkmateOverlay.show(this.activeChessHost);
        }
    }

    private addChess(chess: DisplayChess) {
        this.chessboard.getChessArray()[chess.getPos().row][chess.getPos().col] = chess;
        this.setChessDisplayPos(chess);
        chess.touchEnabled = true;
        // 可能重复加，删除之前绑定的处理器
        chess.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onChessClick, this);
        
        chess.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onChessClick, this);
        this.chessboard.addChildAt(chess, 10);
    }

    /**
     * 移动一个棋子，eatChess/moveChess 公用
     * @param chess 
     * @param destPos 
     */
    private moveOneChess(chess: DisplayChess, destPos: ChessPos) {
        const {x, y} = this.chessboard.calcChessDisplayPos(destPos);
        egret.Tween.get(chess).to({x, y}, 300, egret.Ease.circOut);
        this.chessboard.getChessArray()[chess.getPos().row][chess.getPos().col] = null;
        this.chessboard.getChessArray()[destPos.row][destPos.col] = chess;
        chess.setPos(destPos);
    }
    
    private onChessClick(touchEvent: egret.TouchEvent) {
        let event = new ChessboardClickEvent();
        event.chess = (<DisplayChess>touchEvent.target);
        event.pos = event.chess.getPos();
        this.dispatchEvent(event);
    }

    private setChessDisplayPos(chess: DisplayChess) {
        const {x, y} = this.chessboard.calcChessDisplayPos(chess.getPos());
        chess.x = x;
        chess.y = y;
    }
}