package io.github.hulang1024.chinesechess.user.thirdparty.yaoxin.api.requests;

import io.github.hulang1024.chinesechess.user.thirdparty.yaoxin.api.APIRequest;
import io.github.hulang1024.chinesechess.user.thirdparty.yaoxin.api.AccessToken;

public class GetAccessTokenRequest extends APIRequest<AccessToken> {
    public GetAccessTokenRequest(String code) {
        super("getAccessToken");
        this.addParam("code", code);
    }
}
