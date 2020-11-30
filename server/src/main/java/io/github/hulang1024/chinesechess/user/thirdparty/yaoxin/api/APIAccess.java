package io.github.hulang1024.chinesechess.user.thirdparty.yaoxin.api;

import io.github.hulang1024.chinesechess.user.thirdparty.yaoxin.api.requests.GetAccessTokenRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component("yaoxin-api-access")
public class APIAccess {
    @Autowired
    @Qualifier("yaoxin-api-config")
    public APIConfig config;
    public AccessToken accessToken;

    public void perform(APIRequest request) {
        request.perform(this);
    }

    public void queue() {}

    public void requestAccessToken(String code) {
        GetAccessTokenRequest req = new GetAccessTokenRequest(code);
        req.onSuccess = (AccessToken accessToken) -> {
            this.accessToken = accessToken;
            System.out.printf("accessToken=%s", accessToken.getValue());
        };
        req.perform(this);
    }
}
