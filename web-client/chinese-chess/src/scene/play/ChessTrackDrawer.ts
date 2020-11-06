import DisplayChessboard from "./DisplayChessboard";
import ChessPos from "./rule/ChessPos";

export default class ChessTrackDrawer {
    private chessboard: DisplayChessboard;
    private target1: egret.DisplayObject;
    private target2: egret.DisplayObject;

    constructor(chessboard: DisplayChessboard) {
        this.chessboard = chessboard;
    }

    draw(pos1: ChessPos, pos2: ChessPos) {
        const newTarget1 = this.makeTarget(pos1);
        const newTarget2 = this.makeTarget(pos2);

        this.clear();
        this.chessboard.addChild(newTarget1);
        this.chessboard.addChild(newTarget2);

        this.target1 = newTarget1;
        this.target2 = newTarget2;
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