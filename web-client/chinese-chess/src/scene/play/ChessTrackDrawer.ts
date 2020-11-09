import DisplayChessboard from "./DisplayChessboard";
import ChessPos from "./rule/ChessPos";

export default class ChessTrackDrawer {
    private chessboard: DisplayChessboard;
    private target1: egret.DisplayObject;
    private target2: egret.DisplayObject;
    private pos1: ChessPos;
    private pos2: ChessPos;

    constructor(chessboard: DisplayChessboard) {
        this.chessboard = chessboard;
    }

    draw(pos1: ChessPos, pos2: ChessPos) {
        this.pos1 = pos1;
        this.pos2 = pos2;
        const target1 = this.makeTarget(pos1);
        const target2 = this.makeTarget(pos2);

        this.clear();
        this.chessboard.addChild(target1);
        this.chessboard.addChild(target2);

        this.target1 = target1;
        this.target2 = target2;
    }

    getSavePos() {
        return {pos1: this.pos1, pos2: this.pos2};
    }

    clear() {
        if (this.target1 && this.target2) {
            this.chessboard.removeChild(this.target1);
            this.chessboard.removeChild(this.target2);
            this.target1 = null;
            this.target2 = null;
        }
    }

    private makeTarget(pos: ChessPos) {
        let bitmap = new egret.Bitmap();
        bitmap.width = 70;
        bitmap.height = 70;
        bitmap.texture = RES.getRes("chess_target");
        const {x, y} = this.chessboard.calcDisplayPos(pos);
        bitmap.x = x;
        bitmap.y = y;
        return bitmap;
    }
}