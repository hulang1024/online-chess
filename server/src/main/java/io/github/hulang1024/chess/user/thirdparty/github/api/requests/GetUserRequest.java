package io.github.hulang1024.chess.user.thirdparty.github.api.requests;


import io.github.hulang1024.chess.user.thirdparty.github.api.APIRequest;
import io.github.hulang1024.chess.user.thirdparty.github.api.responses.GitHubUser;
import okhttp3.Request;

public class GetUserRequest extends APIRequest<GitHubUser> {
    public GetUserRequest() {
        super("user");
    }

    @Override
    protected Request.Builder createRequest() {
        return createJSONRequest().get();
    }
}