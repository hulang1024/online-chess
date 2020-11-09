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
import ChessTrackDrawer from "./ChessTrackDrawer";
import Checkmate from "./rule/Checkmate";
import CheckmateOverlay from "./CheckmateOverlay";
import ChessEatOverlay from "./ChessEatOverlay";
import SOUND from "../../audio/SOUND";

export default class Player extends eui.Group implements RoundGame {
    public chessboard = new DisplayChessboard();
    // 视角棋方
    private viewChessHost: ChessHost;
    // 当前走棋方
    private activeChessHost: ChessHost;

    private checkmate: Checkmate;
    private chessTrackDrawer = new ChessTrackDrawer(this.chessboard);
    private chessEatOverlay = new ChessEatOverlay();
    private checkmateOverlay = new CheckmateOverlay();

    constructor() {
        super();

        this.width = this.chessboard.width;
        this.height = this.chessboard.height;

        this.addChild(this.chessboard);

        this.addChild(this.chessEatOverlay);
        this.addChild(this.checkmateOverlay);
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
        this.viewChessHost = viewChessHost;
        this.activeChessHost = activeChessHost || ChessHost.RED;

        this.chessTrackDrawer.clear();

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
            this.chessboard.clear();
            chesses.forEach(chess => {
                let pos = new ChessPos(chess.row, chess.col);
                // 服务器保存数据默认视角是红方，如果是黑方就翻转下
                if (this.viewChessHost == ChessHost.BLACK) {
                    pos = this.reverseViewPos(pos);
                }
                chess = new chessClassMap[chess.type](pos, chess.host);
                this.chessboard.addChess(new DisplayChess(chess));
            });
        } else {
            this.resetChessLayout();
        }

        this.checkmate = new Checkmate(this, this.viewChessHost);

        this.chessboard.touchEnabled = false;
        this.chessboard.getChessList().forEach(chess => {
            chess.touchEnabled = false;
        });
    }

    pickChess(picked: boolean, pos: ChessPos, chessHost: ChessHost) {
        this.chessboard.getChessList().forEach((chess: DisplayChess) => {
            if (chess.isSelected()) {
                chess.setSelected(false);
            }
        });
        
        pos = this.convertViewPos(pos, chessHost);
        this.chessboard.chessAt(pos.row, pos.col).setSelected(picked);
        SOUND.get(picked ? 'select' : 'click').play(0, 1);
    }

    moveChess(fromPos: ChessPos, toPos: ChessPos, chessHost: ChessHost) {
        fromPos = this.convertViewPos(fromPos, chessHost);
        toPos = this.convertViewPos(toPos, chessHost);

        let chess = this.chessboard.chessAt(fromPos.row, fromPos.col);

        this.chessTrackDrawer.draw(fromPos, toPos);

        chess.setSelected(false);
        this.chessboard.moveChess(chess, toPos);
        SOUND.get('click').play(0, 1);
        this.checkCheckmate();
        this.turnChessHost();
    }

    eatChess(fromPos: ChessPos, toPos: ChessPos, chessHost: ChessHost) {
        fromPos = this.convertViewPos(fromPos, chessHost);
        toPos = this.convertViewPos(toPos, chessHost);
        
        let sourceChess = this.chessboard.chessAt(fromPos.row, fromPos.col);
        let targetChess = this.chessboard.chessAt(toPos.row, toPos.col);

        this.chessTrackDrawer.draw(fromPos, toPos);

        sourceChess.setSelected(false);
        this.chessboard.removeChess(targetChess);
        this.chessboard.moveChess(sourceChess, toPos);
        SOUND.get('click').play(0, 1);
        this.chessEatOverlay.show();

        this.checkCheckmate();
        this.turnChessHost();
    }

    turnChessHost() {
        this.activeChessHost = reverseChessHost(this.activeChessHost);
    }

    reverseChessLayoutView() {
        // 保存下棋子引用
        let chesses = [];
        this.chessboard.getChessList().forEach(chess => {
            chesses.push(chess);
        });
        // 清空棋盘
        this.chessboard.clear();
        // 改变位置重新加上去
        chesses.forEach(chess => {
            chess.setPos(this.reverseViewPos(chess.getPos()));
            this.chessboard.addChess(chess);
        });

        // 改变位置重新画标记
        let trackPos = this.chessTrackDrawer.getSavePos();
        if (trackPos.pos1 && trackPos.pos2) {
            this.chessTrackDrawer.draw(
                this.reverseViewPos(trackPos.pos1),
                this.reverseViewPos(trackPos.pos2));
        }

        this.viewChessHost = reverseChessHost(this.viewChessHost);
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
    private reverseViewPos(pos: ChessPos) {
        return new ChessPos(9 - pos.row, 8 - pos.col);
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
                this.chessboard.addChess(new DisplayChess(chess));
            }
        };

        this.chessboard.clear();
        
        // 对面棋方棋子在上部
        addChessGroup(reverseChessHost(this.viewChessHost), [0, 2, 3]);
        // 视角棋方棋子在下部
        addChessGroup(this.viewChessHost, [9, 7, 6]);
    }

    private checkCheckmate() {
        // 判断将军
        if (this.checkmate.check(reverseChessHost(this.activeChessHost))) {
            this.checkmateOverlay.show(this.activeChessHost);
        }
    }
}