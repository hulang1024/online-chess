package io.github.hulang1024.chinesechessserver;

import java.util.Arrays;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.hulang1024.chinesechessserver.listener.LobbyMessageListener;

/**
 * @author Hu Lang
 */
@SpringBootApplication
public class ChineseChessServerApplication {

    public static void main(String[] args) {
        Arrays.asList(
            new LobbyMessageListener()
        ).forEach(listener -> {
            listener.init();
        });

        SpringApplication.run(ChineseChessServerApplication.class, args);
        
    }

}
