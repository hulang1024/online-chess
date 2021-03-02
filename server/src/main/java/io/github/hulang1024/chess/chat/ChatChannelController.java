package io.github.hulang1024.chess.chat;

import io.github.hulang1024.chess.http.GuestAPI;
import io.github.hulang1024.chess.user.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/chat")
@Validated
public class ChatChannelController {
    @Autowired
    private ChannelManager channelManager;

    @PostMapping("/new")
    public ResponseEntity<CreateNewPMRet> createNewPrivateMessage(
        @Validated @RequestBody CreateNewPMParam param) {
        CreateNewPMRet ret = channelManager.createNewPrivateMessage(param);
        return new ResponseEntity(ret, ret.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
    }

    @GetMapping("/channels")
    public ResponseEntity<List<Channel>> getChannels() {
        return ResponseEntity.ok(channelManager.getUserChannels(UserUtils.get()));
    }

    /**
     * 加入频道
     * @param channelId
     * @param userId
     * @return
     */
    @PutMapping("/channels/{channel_id}/users/{user_id}")
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

    @PostMapping("/channels")
    public ResponseEntity<ChannelCreateRet> createChannel(@Validated @RequestBody CreateChannelParam param) {
        if (param.getType() == ChannelType.PM.getCode()) {
            ChannelCreateRet ret = channelManager.createPMChannel(param.getTargetId());
            return new ResponseEntity(ret, ret.getChannelId() != null ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
        } else {
            return new ResponseEntity(HttpStatus.NOT_IMPLEMENTED);
        }
    }

    /**
     * 获取指定频道的所有消息
     * @param channelId
     * @return
     */
    @GuestAPI
    @GetMapping("/channels/{channel_id}/messages")
    public ResponseEntity<Collection<Message>> fetchMessages(
        @NotNull @PathVariable("channel_id") Long channelId,
        Long startMessageId) {
        Channel channel = channelManager.getChannelById(channelId);
        if (channel == null) {
            return ResponseEntity.badRequest().build();
        }
        List<Message> messages = channel.getMessages();
        if (startMessageId != null) {
            messages = messages.stream()
                .filter(m -> m.getId() > startMessageId)
                .collect(Collectors.toList());
        }
        return ResponseEntity.ok(messages);
    }

    /**
     * 发送一个消息
     * @param channelId
     * @param param
     * @return
     */
    @PostMapping("/channels/{channel_id}/messages")
    public ResponseEntity<Message> postMessage(
        @NotNull @PathVariable("channel_id") Long channelId,
        @Validated @RequestBody PostMessageParam param) {

        Message message = channelManager.postMessage(channelId, param);
        return new ResponseEntity(message, message != null ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
    }
}