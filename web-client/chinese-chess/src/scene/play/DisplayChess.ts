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
    // 是否选中状态
    private selected: boolean = false;

    constructor(chessState: Chess) {
        super();

        this.chessState = chessState;

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
        this.selected = selected;
        if (selected) {
            this.alpha = 0.70;
        } else {
            this.alpha = 1;
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