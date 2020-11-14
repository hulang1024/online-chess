import DisplayChess from "./DisplayChess";
import Chess from "./rule/Chess";
import ChessPos from "./rule/ChessPos";
import ChessHost from "./rule/chess_host";

export default class ChessAction {
    chessHost: ChessHost;
    chessType: Function;
    fromPos: ChessPos;
    toPos: ChessPos;
    eatenChess: DisplayChess | Chess;
}