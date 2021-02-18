package io.github.hulang1024.chess;


import io.github.hulang1024.chess.ws.AbstractMessageListener;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;

@SpringBootApplication
public class ChessServerApplication implements ApplicationListener<ContextRefreshedEvent> {

    public static void main(String[] args) {
        SpringApplication.run(ChessServerApplication.class, args);
    }

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        // 扫描websocket消息监听器并初始化
        event.getApplicationContext().getBeansOfType(AbstractMessageListener.class).values().forEach(listener -> {
            try {
                listener.init();
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }
}