package io.github.hulang1024.chinesechess.database;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;


@Configuration
@MapperScan({
    "io.github.hulang1024.chinesechess.user",
    "io.github.hulang1024.chinesechess.friend"
})
@EnableTransactionManagement(proxyTargetClass = true)
public class MyBatisPlusConfig {


}
