package io.github.hulang1024.chess.user.thirdparty.github.api;

import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.annotation.JSONField;
import okhttp3.*;
import org.jetbrains.annotations.NotNull;

import java.io.IOException;
import java.lang.reflect.ParameterizedType;
import java.util.function.Consumer;

public abstract class APIRequest<R> {
    protected static final String GET = "GET";
    protected static final String POST = "POST";

    private String target;
    private APIAccess api;
    public Consumer<R> onSuccess;
    public Consumer<IOException> onExceptionFailure;

    @JSONField(serialize = false)
    private OkHttpClient client = new OkHttpClient();

    protected APIRequest(String target) {
        this.target = target;
    }

    public <T> void perform(APIAccess api) {
        this.api = api;

        Request.Builder reqBuilder = createRequest();
        reqBuilder.header("Authorization", "token " + api.accessToken);
        Request request = reqBuilder.build();

        Class<R> apiResponseClass = (Class<R>)((ParameterizedType)getClass().getGenericSuperclass()).getActualTypeArguments()[0];

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NotNull Call call, @NotNull IOException e) {
                triggerExceptionFailure(e);
            }

            @Override
            public void onResponse(@NotNull Call call, @NotNull Response response) throws IOException {
                APIRequest.this.handleResponse(response, apiResponseClass);
            }
        });
    }

    public <T> void performAsync(APIAccess api) {
        this.api = api;

        Request.Builder reqBuilder = createRequest();
        reqBuilder.header("Authorization", "token " + api.accessToken);
        Request request = reqBuilder.build();

        Class<R> apiResponseClass = (Class<R>)((ParameterizedType)getClass().getGenericSuperclass()).getActualTypeArguments()[0];

        try {
            handleResponse(client.newCall(request).execute(), apiResponseClass);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void handleResponse(Response response, Class<R> apiResponseClass) {
        String text = null;
        try {
            text = response.body().string();
        } catch (IOException e) {
            e.printStackTrace();
            triggerExceptionFailure(e);
        }
        JSONObject jsonObject = JSONObject.parseObject(text);
        R apiResponse = jsonObject.toJavaObject(apiResponseClass);
        if (200 <= response.code() && response.code() <= 299) {
            triggerSuccess(apiResponse);
        }
    }

    protected void triggerSuccess(R apiResponse) {
        if (onSuccess != null) {
            onSuccess.accept(apiResponse);
        }
    }

    protected void triggerExceptionFailure(IOException e) {
        if (onExceptionFailure != null) {
            onExceptionFailure.accept(e);
        }
    }

    protected Request.Builder createRequest() {
        return createJSONRequest();
    }

    protected Request.Builder createJSONRequest() {
        return new Request.Builder()
            .url(api.ENDPOINT + "/" + target)
            .header("accept", "application/json");
    }
}