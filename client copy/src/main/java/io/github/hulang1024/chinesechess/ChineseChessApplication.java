package io.github.hulang1024.chinesechess;

import io.github.hulang1024.chinesechess.scene.SceneContext;
import io.github.hulang1024.chinesechess.scene.SceneManager;
import io.github.hulang1024.chinesechess.scene.home.HomeScene;
import javafx.application.Application;
import javafx.stage.Stage;

/**
 * 应用入口
 * @author hulang
 */
public class ChineseChessApplication extends Application {
    @Override
    public void start(Stage primaryStage) {
        // 设置窗口尺寸
        primaryStage.setWidth(800);
        primaryStage.setHeight(630);
        primaryStage.setResizable(false);
        primaryStage.setOnCloseRequest((event) -> {
            try {
                stop();
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        // 设置标题
        primaryStage.setTitle("中国象棋");
        // 创建场景上下文
        SceneContext sceneContext = new SceneContext(primaryStage);
        // 进入home场景
        SceneManager.of(sceneContext).pushScene((context) -> new HomeScene(context));
        // 显示窗口
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }

}
