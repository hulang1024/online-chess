package io.github.hulang1024.chinesechess.scene.lobby;

import javafx.scene.control.TextInputDialog;
import javafx.stage.Window;

public class PlayerNameInputDialog extends TextInputDialog {
    public PlayerNameInputDialog(Window owner) {
        initOwner(owner);
        setTitle("设置游戏中的昵称");
        setHeaderText("");
        setContentText("昵称");
    }
}
