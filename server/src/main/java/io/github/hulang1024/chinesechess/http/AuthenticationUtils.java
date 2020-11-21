package io.github.hulang1024.chinesechess.http;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.utils.TimeUtils;
import org.apache.commons.lang3.StringUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

public class AuthenticationUtils {
    private static final long EXPIRES_IN_SECONDS = 24 * 60;
    private static final String TOKEN_SECRET = "T2H0I2S2ISSECRET";

    public static AccessToken generateAccessToken(User user) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(TOKEN_SECRET);
            Map<String, Object> header = new HashMap<>(16);
            header.put("typ", "JWT");
            header.put("alg", "HS256");

            String token = JWT.create()
                .withHeader(header)
                .withAudience()
                .withClaim("userId", user.getId())
                .withExpiresAt(TimeUtils.toDate(LocalDateTime.now().plusSeconds(EXPIRES_IN_SECONDS)))
                .sign(algorithm);
            return new AccessToken(token, EXPIRES_IN_SECONDS);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public static User verifyParseUserInfo(String authorization) {
        if (StringUtils.isEmpty(authorization)) {
            return null;
        }
        if (!authorization.startsWith("Bearer")) {
            return null;
        }

        DecodedJWT decodedJWT = verifyTokenString(authorization.substring(7));
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
