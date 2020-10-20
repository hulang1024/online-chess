package io.github.hulang1024.chinesechess.scene.chessplay.rule;

import io.github.hulang1024.chinesechess.scene.chessplay.Chessboard;
import io.github.hulang1024.chinesechess.scene.chessplay.rule.chess.AbstractChess;

/**
 * 象棋的一些全局规则
 * @author Hu Lang
 */
public class GlobalRule {
    /**
     * 判断指定位置是否可走，指定位置可以已存在棋子。
     * @param chessboard
     * @param chess
     * @param destPos
     * @return
     */
    public static boolean canGoTo(Chessboard chessboard, AbstractChess chess, ChessPosition destPos) {
        AbstractChess chessAtDestPos = chessboard.chessAt(destPos);
        // 目标位置上已有自己人
        if (chessAtDestPos != null && chessAtDestPos.host == chess.host) {
            return false;
        }

        return true;
    }

    /**
     * 判断 chessA 是否可以吃掉 chessB，已假设chessA
     * @param chessboard
     * @param chessA
     * @param chessB
     * @return
     */
    public static boolean canEat(Chessboard chessboard, AbstractChess chessA, AbstractChess chessB) {
        // 自己人
        if (chessA.host == chessB.host) {
            return false;
        }

        //TODO:考虑其它
        return true;
    }
}
