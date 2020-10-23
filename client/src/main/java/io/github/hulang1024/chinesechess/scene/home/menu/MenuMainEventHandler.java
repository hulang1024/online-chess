package io.github.hulang1024.chinesechess.scene.home.menu;

/**
 * @author Hu Lang
 */
public interface MenuMainEventHandler {
    /**
     * 本地二人对局
     */
    void onP2();

    /**
     * 在线游戏
     */
    void onOnline();

    /**
     * 退出
     */
    void onExit();
}
