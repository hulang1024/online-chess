import DisplayChessboard from "./DisplayChessboard";
import ChessPos from "../../rule/ChessPos";

export default class ChessTargetDrawer {
    private chessboard: DisplayChessboard;
    private target: egret.DisplayObject;
    private pos: ChessPos;
    private canClear: boolean;

    constructor(chessboard: DisplayChessboard) {
        this.chessboard = chessboard;
    }

    draw(pos: ChessPos) {
        this.pos = pos;
        this.clear();
        const target = this.makeTarget(pos);
        this.target = target;
        this.chessboard.addChild(target);
        this.canClear = true;
    }

    getSavePos() {
        return this.pos;
    }

    clear(posToClear: boolean = false) {
        if (this.canClear) {
            this.chessboard.removeChild(this.target);
            this.target = null;
            this.canClear = false;
            if (posToClear) {
                this.pos = null;
            }
        }
    }

    private makeTarget(pos: ChessPos) {
        const radius = 12;
        const x = 32 + pos.col * 57;
        const y = 32 + pos.row * 57;
        let shape = new egret.Shape();
        shape.graphics.beginFill(0xff0000, 1);
        shape.graphics.drawCircle(x , y, radius);
        shape.graphics.endFill();

        shape.filters = [
            new egret.GlowFilter(
                0xffffff, 0.9, 24, 24, 2,
                egret.BitmapFilterQuality.LOW, true, true),
        ];
        return shape;
    }
}