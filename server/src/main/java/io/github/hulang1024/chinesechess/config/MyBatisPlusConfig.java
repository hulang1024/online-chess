package io.github.hulang1024.chinesechess.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;


@Configuration
@MapperScan({
    "io.github.hulang1024.chinesechess.user"
})
@EnableTransactionManagement(proxyTargetClass = true)
public class MyBatisPlusConfig {


}
