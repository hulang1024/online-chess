import Chess from "./rule/Chess";
import ChessHost from "./rule/chess_host";
import ChessPos from "./rule/ChessPos";
import RoundGame from "./rule/RoundGame";
import { classClassToKey } from "./rule/chess_map";

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
        bitmap.width = 67;
        bitmap.height = 67;

        const chessResKey = ''
            + ChessHost[chessState.getHost()].toLowerCase()
            + '_chess_' + classClassToKey(this.chessState).toLowerCase();
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

    is(chessClass: Function) {
        return this.chessState.is(chessClass);
    }
}