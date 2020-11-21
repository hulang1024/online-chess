package io.github.hulang1024.chinesechess.chat;

import io.github.hulang1024.chinesechess.http.GuestAPI;
import io.github.hulang1024.chinesechess.user.*;
import io.github.hulang1024.chinesechess.utils.TimeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.util.Collection;

@RestController
@RequestMapping("/chat/channels")
@Validated
public class ChannelController {
    @Autowired
    private ChannelManager channelManager;

    /**
     * 加入频道
     * @param channelId
     * @param userId
     * @return
     */
    @PutMapping("/{channel_id}/users/{user_id}")
    public ResponseEntity<Void> joinChannel(
        @NotNull @PathVariable("channel_id") Long channelId,
        @NotNull @PathVariable("user_id") Long userId) {
        Channel channel = channelManager.getChannelById(channelId);
        if (channel == null) {
            return ResponseEntity.badRequest().build();
        }
        boolean ok = channelManager.joinChannel(channel, userId);
        return new ResponseEntity(ok ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
    }

    /**
     * 获取指定频道的所有消息
     * @param channelId
     * @return
     */
    @GuestAPI
    @GetMapping("/{channel_id}/messages")
    public ResponseEntity<Collection<Message>> fetchMessages(
        @NotNull @PathVariable("channel_id") Long channelId) {
        Channel channel = channelManager.getChannelById(channelId);
        if (channel == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(channel.getMessages());
    }

    /**
     * 发送一个消息
     * @param channelId
     * @param param
     * @return
     */
    @PostMapping("/{channel_id}/messages")
    public ResponseEntity<Long> postMessage(
        @NotNull @PathVariable("channel_id") Long channelId,
        @Validated @RequestBody PostMessageParam param) {
        User sender = UserUtils.get();
        Channel channel = channelManager.getChannelById(channelId);
        Message message = new Message();
        message.setChannelId(channel.getId());
        message.setTimestamp(TimeUtils.nowTimestamp());
        message.setSender(sender);
        message.setContent(param.getContent());
        channelManager.broadcast(channel, message);

        return ResponseEntity.ok(message.getId());
    }
}
