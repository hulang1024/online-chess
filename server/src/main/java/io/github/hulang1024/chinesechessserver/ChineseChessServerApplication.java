package io.github.hulang1024.chinesechessserver;

import java.util.Arrays;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.hulang1024.chinesechessserver.listener.ChessPlayMessageListener;
import io.github.hulang1024.chinesechessserver.listener.RoomMessageListener;

/**
 * @author Hu Lang
 */
@SpringBootApplication
public class ChineseChessServerApplication {

    public static void main(String[] args) {
        Arrays.asList(
            new RoomMessageListener(),
            new ChessPlayMessageListener()
        ).forEach(listener -> {
            listener.init();
        });

        SpringApplication.run(ChineseChessServerApplication.class, args);
        
    }

}
