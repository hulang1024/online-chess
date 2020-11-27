package io.github.hulang1024.chinesechess.chat;

import io.github.hulang1024.chinesechess.chat.command.CommandService;
import io.github.hulang1024.chinesechess.http.GuestAPI;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserUtils;
import io.github.hulang1024.chinesechess.utils.TimeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.util.Collection;
import java.util.List;

@RestController
@RequestMapping("/chat")
@Validated
public class ChatChannelController {
    @Autowired
    private ChannelManager channelManager;
    @Autowired
    private CommandService commandService;

    @PostMapping("/new")
    public ResponseEntity<CreateNewPrivateMessageRet> createNewPrivateMessage(
        @Validated @RequestBody CreateNewPrivateMessageParam param) {
        CreateNewPrivateMessageRet ret = channelManager.createNewPrivateMessage(param);
        return ResponseEntity.ok(ret);
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
    @PostMapping("/channels/{channel_id}/messages")
    public ResponseEntity<Long> postMessage(
        @NotNull @PathVariable("channel_id") Long channelId,
        @Validated @RequestBody PostMessageParam param) {

        Channel channel = channelManager.getChannelById(channelId);
        if (channel == null) {
            return ResponseEntity.badRequest().build();
        }

        User sender = UserUtils.get();

        Message message = new Message();
        message.setChannelId(channel.getId());
        message.setTimestamp(TimeUtils.nowTimestamp());
        message.setSender(sender);
        message.setContent(param.getContent());

        if (param.isAction()) {
            commandService.execute(message, channel);
            return ResponseEntity.ok().build();
        } else {
            boolean ok = channelManager.broadcast(channel, message);
            return new ResponseEntity(message.getId(), ok ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
        }
    }
}
