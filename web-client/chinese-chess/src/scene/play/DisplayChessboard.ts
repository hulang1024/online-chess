import ChessboardClickEvent from "./ChessboardClickEvent";
import DisplayChess from "./DisplayChess";
import Chess from "./rule/Chess";
import Chessboard, { CHESSBOARD_COL_NUM, CHESSBOARD_ROW_NUM } from "./rule/chessboard";
import ChessPos from "./rule/ChessPos";
import RoundGame from "./rule/RoundGame";

export default class DisplayChessboard extends eui.Group implements Chessboard {
    private chessArray: Array<Array<DisplayChess>> = new Array(CHESSBOARD_ROW_NUM);
    private game: RoundGame;

    constructor(game: RoundGame) {
        super();
        this.game = game;

        this.width = 523;
        this.height = 580;

        for (let row = 0; row < CHESSBOARD_ROW_NUM; row++) {
            this.chessArray[row] = new Array(CHESSBOARD_COL_NUM);
            for (let col = 0; col < CHESSBOARD_COL_NUM; col++) {
                this.chessArray[row][col] = null;
            }
        }

        let bitmap = new egret.Bitmap();
        bitmap.width = 523;
        bitmap.height = 580;
        bitmap.texture = RES.getRes('chessboard');
        this.addChild(bitmap);
        bitmap.touchEnabled = true;
        bitmap.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onClick, this);
    }

    onClick(touchEvent: egret.TouchEvent) {
        if (!this.touchEnabled) {
            return;
        }
        let row = Math.floor((touchEvent.localY - 5) / 57);
        let col = Math.floor((touchEvent.localX - 3) / 57);
        let pos = new ChessPos(row, col);

        let event = new ChessboardClickEvent();
        event.pos = pos;
        event.chess = this.chessAt(row, col);

        if (event.chess != null) {
            if (!event.chess.touchEnabled) {
                return;
            }
        }

        this.dispatchEvent(event);
    }

    onChessClick(touchEvent: egret.TouchEvent) {
        let event = new ChessboardClickEvent();
        event.chess = (<DisplayChess>touchEvent.target);
        event.pos = event.chess.getPos();
        this.dispatchEvent(event);
    }

    isEmpty(row: number, col: number) {
        return this.chessArray[row][col] == null;
    }

    chessAt(row: number, col: number) {
        return this.chessArray[row][col];
    }
    
    addChess(chess: DisplayChess) {
        this.chessArray[chess.getPos().row][chess.getPos().col] = chess;
        this.setChessDisplayPos(chess);
        chess.touchEnabled = true;
        chess.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onChessClick, this);
        this.addChild(chess);
    }

    moveChess(chess: DisplayChess, destPos: ChessPos) {
        this.chessArray[chess.getPos().row][chess.getPos().col] = null;
        this.chessArray[destPos.row][destPos.col] = chess;
        chess.setPos(destPos);
        this.setChessDisplayPos(chess);
    }

    removeChess(chess: DisplayChess) {
        this.chessArray[chess.getPos().row][chess.getPos().col] = null;
        this.removeChild(chess);
    }

    getChessList() {
        let ret = [];
        for (let row = 0; row < CHESSBOARD_ROW_NUM; row++) {
            for (let col = 0; col < CHESSBOARD_COL_NUM; col++) {
                if (!this.isEmpty(row, col)) {
                    ret.push(this.chessArray[row][col]);
                }
            }
        }
        return ret;
    }

    clear() {
        for (let row = 0; row < CHESSBOARD_ROW_NUM; row++) {
            for (let col = 0; col < CHESSBOARD_COL_NUM; col++) {
                if (!this.isEmpty(row, col)) {
                    this.removeChess(this.chessArray[row][col]);
                }
            }
        }
    }

    calcDisplayPos(pos: ChessPos) {
        const x = 2 + pos.col * 57;
        const y = 5 + pos.row * 57;
        return {x, y};
    }

    private setChessDisplayPos(chess: DisplayChess) {
        const {x, y} = this.calcDisplayPos(chess.getPos());
        chess.x = x;
        chess.y = y;
    }
}