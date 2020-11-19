import ChessboardClickEvent from "./ChessboardClickEvent";
import DisplayChess from "./DisplayChess";
import Chessboard, { CHESSBOARD_COL_NUM, CHESSBOARD_ROW_NUM } from "../../rule/chessboard";
import ChessPos from "../../rule/ChessPos";

export default class DisplayChessboard extends eui.Group implements Chessboard {
    private chessArray: Array<Array<DisplayChess>> = new Array(CHESSBOARD_ROW_NUM);
    private bitmap = new egret.Bitmap();

    constructor(width: number) {
        super();

        this.width = width;
        this.height = 567;

        for (let row = 0; row < CHESSBOARD_ROW_NUM; row++) {
            this.chessArray[row] = new Array(CHESSBOARD_COL_NUM);
            for (let col = 0; col < CHESSBOARD_COL_NUM; col++) {
                this.chessArray[row][col] = null;
            }
        }

        let { bitmap } = this;
        bitmap.width = width;
        bitmap.height = this.height;
        bitmap.touchEnabled = true;
        bitmap.texture = RES.getRes('chessboard');
        bitmap.width = this.width;
        bitmap.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onClick, this);

        let mask = new egret.Shape();
        mask.graphics.beginFill(0xffffff, 1);
        mask.graphics.drawRoundRect(0, 0, this.width, this.height, 8, 8);
        mask.graphics.endFill();
        this.addChild(mask);
        bitmap.mask = mask;
        
        this.addChild(bitmap);
    }

    onClick(touchEvent: egret.TouchEvent) {
        if (!this.touchEnabled) {
            return;
        }
        let { localX, localY } = touchEvent;
        let { paddingH, paddingV, h, v } = this.getGap();
        let row: number;
        let col: number;
        if (localY < paddingV) {
            row = 0;
        } else if (localY > this.height - paddingV) {
            row = 9;
        } else {
            row = Math.round((localY - paddingV) / h);
        }
        if (localX < paddingH) {
            col = 0;
        } else if (localX > this.width - paddingH) {
            col = 8;
        } else {
            col = Math.round((localX - paddingH) / v);
        }
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

    chessAt(pos: ChessPos): DisplayChess {
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

    getGap() {
        // 假设是正方形图片，并且内外边距相同
        const paddingV = 31;
        const paddingH = 35;
        return {
            paddingH,
            paddingV,
            h: Math.round((this.width - paddingH * 2) / 8),
            v: Math.round((this.height - paddingV * 2) / 9)
        };
    }

    calcChessDisplayPos(pos: ChessPos) {
        let { paddingH, paddingV, h, v } = this.getGap();
        const x = paddingH + pos.col * h;
        const y = paddingV + pos.row * v;
        return egret.Point.create(x, y);
    }

    calcChessSize() {
        return (this.width - this.getGap().paddingH * 2) / 8;
    }
}