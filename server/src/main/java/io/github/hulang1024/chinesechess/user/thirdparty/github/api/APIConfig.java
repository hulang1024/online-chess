package io.github.hulang1024.chinesechess.user.thirdparty.github.api;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component("github-api-config")
@ConfigurationProperties(prefix = "github")
public class APIConfig {
    private String clientId;
    private String clientSecret;
}
