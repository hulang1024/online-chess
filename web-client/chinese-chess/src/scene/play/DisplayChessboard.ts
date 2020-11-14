import ChessboardClickEvent from "./ChessboardClickEvent";
import DisplayChess from "./DisplayChess";
import Chessboard, { CHESSBOARD_COL_NUM, CHESSBOARD_ROW_NUM } from "./rule/chessboard";
import ChessPos from "./rule/ChessPos";

export default class DisplayChessboard extends eui.Group implements Chessboard {
    private chessArray: Array<Array<DisplayChess>> = new Array(CHESSBOARD_ROW_NUM);

    constructor() {
        super();

        this.width = 530;
        this.height = 580;

        for (let row = 0; row < CHESSBOARD_ROW_NUM; row++) {
            this.chessArray[row] = new Array(CHESSBOARD_COL_NUM);
            for (let col = 0; col < CHESSBOARD_COL_NUM; col++) {
                this.chessArray[row][col] = null;
            }
        }

        let bitmap = new egret.Bitmap();
        bitmap.width = this.width;
        bitmap.height = this.height;
        bitmap.texture = RES.getRes('chessboard');
        

        let mask = new egret.Shape();
        mask.graphics.beginFill(0xffffff, 1);
        mask.graphics.drawRoundRect(0, 0, this.width, this.height, 8, 8);
        mask.graphics.endFill();
        this.addChild(mask);
        bitmap.mask = mask;

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
        event.chess = this.chessAt(pos);

        if (event.chess != null) {
            if (!event.chess.touchEnabled) {
                return;
            }
        }

        this.dispatchEvent(event);
    }

    isEmpty(row: number, col: number) {
        return this.chessArray[row][col] == null;
    }

    chessAt(pos: ChessPos) {
        return this.chessArray[pos.row][pos.col];
    }

    removeChild(child: egret.DisplayObject): egret.DisplayObject {
        if (child instanceof DisplayChess) {
            let chess = <DisplayChess>child;
            this.chessArray[chess.getPos().row][chess.getPos().col] = null;
        }
        return super.removeChild(child);
    }

    getChessArray() {
        return this.chessArray;
    }

    getChessList(): Array<DisplayChess> {
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

    calcChessDisplayPos(pos: ChessPos) {
        const x = 2 + pos.col * 57.5;
        const y = 5 + pos.row * 57.5;
        return {x, y};
    }
}