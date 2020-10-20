package io.github.hulang1024.chinesechess;

import io.github.hulang1024.chinesechess.scene.chessplay.ChessPlayScene;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.BorderPane;
import javafx.stage.Stage;

/**
 * 应用入口
 * @author hulang
 */
public class ChineseChessApplication extends Application {
    @Override
    public void start(Stage primaryStage) throws Exception {
        BorderPane root = new BorderPane();
        primaryStage.setWidth(800);
        primaryStage.setHeight(600);
        primaryStage.setTitle("中国象棋");
        primaryStage.setScene(new Scene(new ChessPlayScene()));
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }

}
