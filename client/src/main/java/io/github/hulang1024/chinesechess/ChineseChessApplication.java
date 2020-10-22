package io.github.hulang1024.chinesechess;

import io.github.hulang1024.chinesechess.scene.SceneContext;
import io.github.hulang1024.chinesechess.scene.SceneManager;
import io.github.hulang1024.chinesechess.scene.home.HomeScene;
import javafx.application.Application;
import javafx.scene.layout.BorderPane;
import javafx.stage.Stage;

/**
 * 应用入口
 * @author hulang
 */
public class ChineseChessApplication extends Application {
    @Override
    public void start(Stage primaryStage) throws Exception {
        // 设置窗口尺寸
        primaryStage.setWidth(800);
        primaryStage.setHeight(630);
        // 设置标题
        primaryStage.setTitle("中国象棋");
        // 创建场景上下文
        SceneContext sceneContext = new SceneContext(primaryStage);
        // 进入home场景
        SceneManager.of(sceneContext).pushScene(new HomeScene(sceneContext));
        // 显示窗口
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }

}
