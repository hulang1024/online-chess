package io.github.hulang1024.chess.http;

import lombok.Data;

@Data
public class AccessToken {
    private final String accessToken;
    /**
     * 有效期时长，单位秒
     */
    private final long expiresIn;

    public AccessToken(String value, long expiresIn) {
        this.accessToken = value;
        this.expiresIn = expiresIn;
    }
}