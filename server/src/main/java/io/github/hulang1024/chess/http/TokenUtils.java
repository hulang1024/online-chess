package io.github.hulang1024.chess.http;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.utils.TimeUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

public class TokenUtils {
    private static final String TOKEN_SECRET = "T2H0I2S2ISSECRET";

    public static AccessToken generateAccessToken(Long userId, long expiresInSeconds) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(TOKEN_SECRET);
            Map<String, Object> header = new HashMap<>(16);
            header.put("typ", "JWT");
            header.put("alg", "HS256");

            String token = JWT.create()
                .withHeader(header)
                .withAudience()
                .withClaim("userId", userId)
                .withExpiresAt(TimeUtils.toDate(LocalDateTime.now().plusSeconds(expiresInSeconds)))
                .sign(algorithm);
            return new AccessToken(token, expiresInSeconds);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public static User verifyParseUserInfo(String token) {
        DecodedJWT decodedJWT = verifyTokenString(token);
        if (decodedJWT == null) {
            return null;
        }

        Claim userIdClaim = decodedJWT.getClaim("userId");
        if (userIdClaim.isNull()) {
            return null;
        }

        User user = new User();
        Long userId = userIdClaim.as(Long.TYPE);
        user.setId(userId);

        return user;
    }

    private static DecodedJWT verifyTokenString(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(TOKEN_SECRET);
            return JWT.require(algorithm).build().verify(token);
        } catch (Exception e) {
            return null;
        }
    }

}