package io.github.hulang1024.chess.user.thirdparty.github.api;

import com.alibaba.fastjson.JSONObject;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component("github-api-access")
public class APIAccess {
    @Autowired
    @Qualifier("github-api-config")
    private APIConfig config;

    public final String ENDPOINT = "https://api.github.com";
    public String accessToken;

    public void perform(APIRequest request) {
        request.perform(this);
    }
    public void performAsync(APIRequest request) {
        request.performAsync(this);
    }

    public void requestAccessTokenAsync(String code) {
        Request request = new Request.Builder()
            .url("https://github.com/login/oauth/access_token?" +
                "client_id=" + config.getClientId() +
                "&client_secret=" + config.getClientSecret() +
                "&code=" + code)
            .post(RequestBody.create("", MediaType.parse("application/x-www-form-urlencoded")))
            .header("accept", "application/json")
            .build();
        Response response = null;
        try {
            response = new OkHttpClient().newCall(request).execute();
        } catch (IOException e) {
            e.printStackTrace();
            return;
        }

        JSONObject jsonObject = null;
        try {
            String text = response.body().string();
            jsonObject = JSONObject.parseObject(text);
        } catch (IOException e) {
            return;
        }

        accessToken = jsonObject.getString("access_token");
    }
}