import Chess from "./rule/Chess";
import ChessHost from "./rule/chess_host";
import ChessPos from "./rule/ChessPos";
import RoundGame from "./rule/RoundGame";
import ChessC from "./rule/chess/ChessC";
import ChessG from "./rule/chess/ChessG";
import ChessK from "./rule/chess/ChessK";
import ChessM from "./rule/chess/ChessM";
import ChessN from "./rule/chess/ChessN";
import ChessR from "./rule/chess/ChessR";
import ChessS from "./rule/chess/ChessS";

export default class DisplayChess extends egret.Sprite implements Chess {
    private chessState: Chess;
    // 起点位置
    public originPos: ChessPos;
    // 是否选中状态
    private selected: boolean = false;
    private lit: boolean = false;

    constructor(chessState: Chess) {
        super();

        this.chessState = chessState;
        this.originPos = chessState.getPos();

        let bitmap = new egret.Bitmap();
        bitmap.width = 69;
        bitmap.height = 69;

        let chessKey = null;
        if (chessState instanceof ChessC) chessKey = 'c';
        if (chessState instanceof ChessG) chessKey = 'g';
        if (chessState instanceof ChessK) chessKey = 'k';
        if (chessState instanceof ChessM) chessKey = 'm';
        if (chessState instanceof ChessN) chessKey = 'n';
        if (chessState instanceof ChessR) chessKey = 'r';
        if (chessState instanceof ChessS) chessKey = 's';
        const chessResKey = `${ChessHost[chessState.getHost()].toLowerCase()}_chess_${chessKey}`;
        bitmap.texture = RES.getRes(chessResKey);
        this.addChild(bitmap);
    }

    canGoTo(destPos: ChessPos, game: RoundGame) {
        return this.chessState.canGoTo(destPos, game);
    }

    isSelected() {
        return this.selected;
    }

    setSelected(selected: boolean) {
        if (this.selected == selected) return;
        this.selected = selected;
        this.alpha = selected ? 0.7 : 1;
    }

    isLit() {
        return this.lit;
    }

    setLit(lit: boolean) {
        if (this.lit == lit) return;
        this.lit = lit;
        if (lit) {
            this.parent.setChildIndex(this, 100);
            this.filters = [
                new egret.GlowFilter(
                    0xffffff, 0.7, 24, 24, 2,
                    egret.BitmapFilterQuality.LOW, false, false),
            ];
        } else {
            this.parent.setChildIndex(this, 10);
            this.filters = [];
        }
    }

    setPos(pos: ChessPos) {
        this.chessState.setPos(pos);
    }

    getPos() {
        return this.chessState.getPos();
    }

    getHost() {
        return this.chessState.getHost();
    }

    getChess() {
        return this.chessState;
    }
}