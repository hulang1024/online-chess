package io.github.hulang1024.chess.ws;

import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.serializer.SerializerFeature;
import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.user.UserSessionManager;
import io.netty.channel.ChannelFuture;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.yeauty.pojo.Session;

@Component
public class WSMessageService {
    @Autowired
    private UserSessionManager userSessionManager;

    public ChannelFuture send(ServerMessage message, User user) {
        if (user == null) {
            return null;
        }
        return send(message, userSessionManager.getSession(user));
    }

    /**
     * 给session发送消息，尽量使用另一个方法，给用户发送
     * @param message
     * @param session
     */
    public ChannelFuture send(ServerMessage message, Session session) {
        if (message == null || session == null) {
            return null;
        }
        String messageJson = JSONObject.toJSONString(message,
            SerializerFeature.WriteMapNullValue,
            SerializerFeature.DisableCircularReferenceDetect);
        return session.sendText(messageJson);
    }
}