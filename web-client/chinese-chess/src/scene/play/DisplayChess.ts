import Chess from "../../rule/Chess";
import ChessHost from "../../rule/chess_host";
import ChessPos from "../../rule/ChessPos";
import RoundGame from "../../rule/RoundGame";
import { classClassToKey } from "../../rule/chess_map";

export default class DisplayChess extends egret.Sprite implements Chess {
    private chessState: Chess;
    private bitmap = new egret.Bitmap();
    // 是否选中状态
    private selected: boolean = false;
    private lit: boolean = false;

    constructor(chessState: Chess) {
        super();

        this.chessState = chessState;

        let url = '/resource/assets/themes/default/chess/';
        url += ChessHost[chessState.getHost()].toLowerCase();
        url += `/${classClassToKey(this.chessState).toLowerCase()}.png`;
        RES.getResByUrl(url, (texture: egret.Texture) => {
            this.bitmap.texture = texture;
        });

        this.addChild(this.bitmap);
    }

    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
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
                    0xffffff, 0.9, 20, 20, 2,
                    egret.BitmapFilterQuality.MEDIUM, false, false),
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