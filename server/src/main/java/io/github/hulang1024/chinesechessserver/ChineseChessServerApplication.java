package io.github.hulang1024.chinesechessserver;

import java.util.Arrays;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.hulang1024.chinesechessserver.listener.ChessPlayMessageListener;
import io.github.hulang1024.chinesechessserver.listener.LobbyMessqgeListener;
import io.github.hulang1024.chinesechessserver.listener.PlayerMessageListener;
import io.github.hulang1024.chinesechessserver.listener.RoomMessageListener;

/**
 * @author Hu Lang
 */
@SpringBootApplication
public class ChineseChessServerApplication {

    public static void main(String[] args) {
        Arrays.asList(
            new LobbyMessqgeListener(),
            new RoomMessageListener(),
            new ChessPlayMessageListener(),
            new PlayerMessageListener()
        ).forEach(listener -> {
            listener.init();
        });

        SpringApplication.run(ChineseChessServerApplication.class, args);
        
    }

}
