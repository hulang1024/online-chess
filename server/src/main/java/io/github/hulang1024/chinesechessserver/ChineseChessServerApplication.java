package io.github.hulang1024.chinesechessserver;

import org.reflections.Reflections;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.hulang1024.chinesechessserver.listener.MessageListener;

/**
 * @author Hu Lang
 */
@SpringBootApplication
public class ChineseChessServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChineseChessServerApplication.class, args);

        // 扫描消息监听器并初始化
        Reflections reflections = new Reflections("io.github.hulang1024.chinesechessserver.listener");
        reflections.getSubTypesOf(MessageListener.class).forEach(listener -> {
            try {
                ((MessageListener)listener.newInstance()).init();
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }
}
