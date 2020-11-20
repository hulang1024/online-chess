package io.github.hulang1024.chinesechess.message;

import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.serializer.SerializerFeature;
import org.yeauty.pojo.Session;

public class MessageUtils {
    public static void send(ServerMessage message, Session session) {
        String messageJson = JSONObject.toJSONString(message, SerializerFeature.DisableCircularReferenceDetect);
        session.sendText(messageJson);
    }
}
