package io.github.hulang1024.chinesechess.user.thirdparty.yaoxin.api;

import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.annotation.JSONField;
import okhttp3.*;
import org.jetbrains.annotations.NotNull;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Consumer;

public abstract class APIRequest<R> {
    protected static final String GET = "GET";
    protected static final String POST = "POST";

    private String id = UUID.randomUUID().toString();

    private String action;

    private Map<String, Object> payload = new HashMap<>();

    private String method = POST;

    private APIAccess api;

    public Consumer<APIRet<R>> onResponse;

    public Consumer<R> onSuccess;

    public Consumer<APIRet<R>> onFailure;

    @JSONField(serialize = false)
    private OkHttpClient client = new OkHttpClient();

    protected APIRequest(String action) {
        this.action = action;
    }

    protected APIRequest(String method, String action) {
        this.method = method;
        this.action = action;
    }

    protected void addParam(String key, Object value) {
        this.payload.put(key, value);
    }

    public <T> void perform(APIAccess api) {
        this.api = api;
        client.newCall(createRequest()).enqueue(new Callback() {
            @Override
            public void onFailure(@NotNull Call call, @NotNull IOException e) {
                triggerFailure(null);
            }

            @Override
            public void onResponse(@NotNull Call call, @NotNull Response response) throws IOException {
                String text = response.body().string();
                JSONObject jsonObject = JSONObject.parseObject(text);
                JSONObject payloadJsonObject = (JSONObject)jsonObject.get("payload");
                APIRet apiRet = jsonObject.toJavaObject(APIRet.class);
                R payload = (R)payloadJsonObject.toJavaObject(APIRequest.this.payload.getClass());
                apiRet.setPayload(payload);

                if (APIRequest.this.onResponse != null) {
                    APIRequest.this.onResponse.accept(apiRet);
                }
                if (apiRet.isOk()) {
                    triggerSuccess(apiRet);
                } else {
                    triggerFailure(apiRet);
                }
            }
        });
    }

    protected void triggerSuccess(APIRet apiRet) {
        if (onSuccess != null) {
            onSuccess.accept((R)apiRet.getPayload());
        }
    }

    protected void triggerFailure(APIRet apiRet) {
        if (onFailure != null) {
            onFailure.accept(apiRet);
        }
    }

    protected Request createRequest() {
        return createJSONRequest();
    }

    protected Request createJSONRequest() {
        payload.put("type", "2");
        JSONObject jsonObject = (JSONObject)JSONObject.toJSON(payload);
        if (api.accessToken != null) {
            jsonObject.put("access_token", api.accessToken.getValue());
        }
        RequestBody body = RequestBody
            .create(jsonObject.toJSONString(), MediaType.parse("application/json"));
        return new Request.Builder()
            .url(api.config.getEndpoint() + "/" + action)
            .method(method, body)
            .header("accept", "application/json")
            .build();
    }
}
