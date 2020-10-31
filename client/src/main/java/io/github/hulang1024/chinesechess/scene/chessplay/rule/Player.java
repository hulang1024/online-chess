package io.github.hulang1024.chinesechess.scene.chessplay.rule;

/**
 * 玩家
 * @author Hu Lang
 */
public interface Player {

    void onMoveOrEatChess();

    void onWantToDraw();
}
