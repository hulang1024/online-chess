import DisplayChess from "./DisplayChess";
import ChessPos from "../../rule/ChessPos";

export default class ChessboardClickEvent extends egret.Event {
    static TYPE: string = "chessboard.click";

    /**
     * 点击位置
     */
    pos: ChessPos;

    /**
     * 棋子（如果点击位置上有棋子）
     */
    chess: DisplayChess;

    constructor() {
        super(ChessboardClickEvent.TYPE, false, false);
    }
}