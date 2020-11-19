package io.github.hulang1024.chinesechessserver.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;


@Configuration
@MapperScan("io.github.hulang1024.chinesechessserver.database.dao")
@EnableTransactionManagement(proxyTargetClass = true)
public class MyBatisPlusConfig {


}
