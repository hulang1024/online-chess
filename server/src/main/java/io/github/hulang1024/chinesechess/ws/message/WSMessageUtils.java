package io.github.hulang1024.chinesechess.ws.message;

import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.serializer.SerializerFeature;
import org.yeauty.pojo.Session;

public class WSMessageUtils {
    public static void send(ServerMessage message, Session session) {
        if (message == null || session == null) {
            return;
        }
        String messageJson = JSONObject.toJSONString(message,
            SerializerFeature.WriteMapNullValue,
            SerializerFeature.DisableCircularReferenceDetect);
        session.sendText(messageJson);
    }
}
