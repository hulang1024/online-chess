package io.github.hulang1024.chinesechessserver.user;

import java.math.BigInteger;
import java.security.MessageDigest;

public class PasswordUtils {
    public static boolean isRight(String userInput, String ciphertext) {
        return ciphertext.equals(ciphertext(userInput));
    }

    public static String ciphertext(String str) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA");
            md.update(str.getBytes());
            return new BigInteger(1, md.digest()).toString(16);
        } catch (Exception e) {
            return null;
        }
    }
}
