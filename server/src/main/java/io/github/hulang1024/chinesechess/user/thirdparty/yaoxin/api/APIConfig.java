package io.github.hulang1024.chinesechess.user.thirdparty.yaoxin.api;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component("yaoxin-api-config")
@ConfigurationProperties(prefix = "yao-xin")
public class APIConfig {
    private String endpoint;

    private String appId;
}
