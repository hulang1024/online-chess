package io.github.hulang1024.chinesechess.user.thirdparty.yaoxin.api;

import io.github.hulang1024.chinesechess.user.thirdparty.yaoxin.YaoXinConfig;
import io.github.hulang1024.chinesechess.user.thirdparty.yaoxin.api.requests.GetAccessTokenRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class APIAccess {
    private YaoXinConfig config;
    public final String ENDPOINT;
    public AccessToken accessToken;

    public APIAccess(@Autowired YaoXinConfig config) {
        this.config = config;
        ENDPOINT = config.getEndpoint();
    }

    public void perform(APIRequest request) {
        request.perform(this);
    }

    public void queue() {}

    public void requestAccessToken(String code) {
        GetAccessTokenRequest req = new GetAccessTokenRequest(code);
        req.onSuccess = (AccessToken accessToken) -> {
            this.accessToken = accessToken;
            System.out.printf("accessToken=%s", accessToken.getAccessToken());
        };
        req.perform(this);
    }
}
