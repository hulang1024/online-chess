package io.github.hulang1024.chinesechessserver;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.hulang1024.chinesechessserver.listener.MessageListener;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;

@SpringBootApplication
public class ChineseChessServerApplication implements ApplicationListener<ContextRefreshedEvent> {

    public static void main(String[] args) {
        SpringApplication.run(ChineseChessServerApplication.class, args);
    }

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        // 扫描消息监听器并初始化
        event.getApplicationContext().getBeansOfType(MessageListener.class).values().forEach(listener -> {
            try {
                listener.init();
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }
}
