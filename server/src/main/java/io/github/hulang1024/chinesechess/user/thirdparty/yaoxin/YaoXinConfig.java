package io.github.hulang1024.chinesechess.user.thirdparty.yaoxin;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "yao-xin")
public class YaoXinConfig {
    private String endpoint;

    private String appId;
}
