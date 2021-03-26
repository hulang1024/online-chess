package io.github.hulang1024.chess.chat;

import io.github.hulang1024.chess.chat.command.CommandService;
import io.github.hulang1024.chess.chat.command.executors.WordsNotAllowedCommandExecutor;
import io.github.hulang1024.chess.chat.ws.ChannelUserLeftServerMsg;
import io.github.hulang1024.chess.chat.ws.ChatMessageServerMsg;
import io.github.hulang1024.chess.chat.ws.ChatUpdatesServerMsg;
import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.user.UserManager;
import io.github.hulang1024.chess.user.UserUtils;
import io.github.hulang1024.chess.utils.TimeUtils;
import io.github.hulang1024.chess.ws.WSMessageService;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class ChannelManager {
    /** 频道id -> 频道 */
    private static Map<Long, Channel> channelMap = new ConcurrentHashMap<>();

    /**  用户id -> 已加入频道 */
    private static Map<Long, List<UserChannel>> userJoinedChannelsMap = new ConcurrentHashMap<>();

    @Autowired
    private UserManager userManager;
    @Autowired
    private WSMessageService wsMessageService;
    @Autowired
    private CommandService commandService;
    @Autowired
    private WordsNotAllowedCommandExecutor wordsNotAllowedCommandExecutor;

    public static long[] defaultChannelIds = new long[]{
        /** 全局频道 */
        1
    };

    static {
        new ChannelManager().createDefault(1);
    }

    public List<Channel> getUserChannels(User user) {
        List<UserChannel> userChannels = userJoinedChannelsMap.get(user.getId());
        return userChannels != null
            ? userChannels.stream().map(uc -> uc.getChannel()).collect(Collectors.toList())
            : new ArrayList<>();
    }

    /**
     *
     * @param channel
     * @param userId
     * @return
     */
    public boolean joinChannel(Channel channel, long userId) {
        if (channel == null) {
            return false;
        }

        User user = userManager.getLoggedInUser(userId);
        if (user == null) {
            return false;
        }

        return joinChannel(channel, user);
    }

    public boolean joinChannel(Channel channel, User user) {
        if (channel.getType() != ChannelType.PUBLIC && !userManager.isOnline(user)) {
            return false;
        }

        boolean ok = channel.joinUser(user);
        if (!ok) {
            return false;
        }

        if (!userJoinedChannelsMap.containsKey(user.getId())) {
            userJoinedChannelsMap.put(user.getId(), new ArrayList<>());
        }
        userJoinedChannelsMap.get(user.getId()).add(new UserChannel(user, channel));


        return true;
    }

    public boolean leaveChannel(Channel channel, User user) {
        boolean ok = channel.removeUser(user);
        if (ok) {
            userJoinedChannelsMap.get(user.getId()).remove(new UserChannel(user, channel));
            onLeftChannel(channel, user);
        }
        return ok;
    }


    public boolean joinDefaultChannels(User user) {
        for (long channelId : ChannelManager.defaultChannelIds) {
            joinChannel(getChannelById(channelId), user);
        }
        return true;
    }

    public boolean leaveDefaultChannels(User user) {
        for (long channelId : ChannelManager.defaultChannelIds) {
            leaveChannel(getChannelById(channelId), user);
        }
        return true;
    }

    public boolean leaveChannels(User user) {
        List<UserChannel> userChannels = userJoinedChannelsMap.get(user.getId());
        if (userChannels == null || userChannels.isEmpty()) {
            return true;
        }

        userChannels.forEach(userChannel -> {
            Channel channel = userChannel.getChannel();
            channel.removeUser(user);

            onLeftChannel(channel, user);

        });
        userChannels.removeAll(userChannels);

        return true;
    }

    public ChannelCreateRet createPMChannel(long targetUserId) {
        ChannelCreateRet result = new ChannelCreateRet();

        User targetUser = userManager.getLoggedInUser(targetUserId);
        result.setTargetUser(targetUser);

        if (targetUser == null || targetUser.equals(UserUtils.get())) {
            result.setChannelId(0L);
            return result;
        }

        Channel channel = new Channel();
        channel.setType(ChannelType.PM);

        channel.setName(UserUtils.get().getId() + "_" + targetUser.getId());

        joinChannel(channel, targetUser);
        joinChannel(channel, UserUtils.get());

        createChannel(channel);
        result.setChannelId(channel.getId());

        return result;
    }

    public CreateNewPMRet createNewPrivateMessage(@NotNull CreateNewPMParam param) {
        User sender = UserUtils.get();

        if (!wordsNotAllowedCommandExecutor.isCanWords(sender, null)) {
            return CreateNewPMRet.fail();
        }

        if (!userManager.isOnline(param.getTargetId()) ||
            param.getTargetId().equals(UserUtils.get().getId())) {
            return CreateNewPMRet.fail();
        }

        User targetUser = userManager.getLoggedInUser(param.getTargetId());
        Optional<UserChannel> targetUserJoinedUserChannel = userJoinedChannelsMap.get(UserUtils.get().getId()).stream()
             .filter(uc -> uc.getChannel().getType() == ChannelType.PM
                 && uc.getChannel().getUsers().contains(targetUser))
            .findAny();

        Channel channel;
        if (targetUserJoinedUserChannel.isPresent()) {
            channel = targetUserJoinedUserChannel.get().getChannel();
        } else {
            ChannelCreateRet created = createPMChannel(targetUser.getId());
            if (created.getChannelId() == null && created.getChannelId() == 0) {
                return CreateNewPMRet.fail();
            }

            channel = channelMap.get(created.getChannelId());
        }

        Message message = new Message();
        message.setTimestamp(TimeUtils.nowTimestamp());
        message.setSender(sender);
        message.setContent(param.getContent());
        message.setChannelId(channel.getId());
        boolean ok;
        if (param.isAction()) {
            commandService.execute(message, channel);
            ok = true;
        } else {
            ok = broadcast(channelMap.get(channel.getId()), message, sender);
        }
        return ok ? new CreateNewPMRet(true, channel.getId(), message) : CreateNewPMRet.fail();
    }

    public Message postMessage(Long channelId, PostMessageParam param) {
        Channel channel = getChannelById(channelId);
        if (channel == null) {
            return null;
        }

        User sender = UserUtils.get();

        if (!wordsNotAllowedCommandExecutor.isCanWords(sender, channel)) {
            return null;
        }
        Message message = new Message();
        message.setChannelId(channel.getId());
        message.setTimestamp(TimeUtils.nowTimestamp());
        message.setSender(sender);
        message.setContent(param.getContent());

        if (param.isAction()) {
            commandService.execute(message, channel);
            return message;
        } else {
            if (broadcast(channel, message, sender)) {
                return message;
            }
        }
        return null;
    }

    public boolean broadcast(Channel channel, Message message, User... excludes) {
        message.setChannelId(channel.getId());

        if (channel.getType() == ChannelType.PM) {
            // 无论如何都保存私聊消息
            channel.addNewMessage(message);

            Optional<User> targetUserOpt = channel.getUsers().stream()
                .filter(u -> !u.equals(message.getSender())).findFirst();
            if (!targetUserOpt.isPresent()) {
                return false;
            }
            User targetUser = targetUserOpt.get();
            if (!userManager.isOnline(targetUser)) {
                return false;
            }

            UserChannel targetUserChannel = userJoinedChannelsMap.get(targetUser.getId())
                .stream().filter(uc -> uc.getChannel().equals(channel)).findFirst().get();
            // 与之私聊用户是否从未实际打开过该频道？
            if (targetUserChannel.getLastReadId() == null) {
                ChatUpdatesServerMsg chatUpdatesServerMsg = new ChatUpdatesServerMsg();
                chatUpdatesServerMsg.setSender(message.getSender());
                chatUpdatesServerMsg.setChannel(channel);
                targetUserChannel.setLastReadId(0L);
                chatUpdatesServerMsg.setRecentMessages(channel.getMessages().stream()
                    .filter(m -> m.getId() > targetUserChannel.getLastReadId())
                    .collect(Collectors.toList()));
                //todo:暂时在这里标记已读
                targetUserChannel.setLastReadId(message.getId());
                wsMessageService.send(chatUpdatesServerMsg, targetUser);
            }
        }

        channel.addNewMessage(message);

        ChatMessageServerMsg msgMsg = new ChatMessageServerMsg(message);

        User exclude = excludes.length == 1 ? excludes[0] : null;
        channel.getUsers().forEach(user -> {
            if (user.equals(exclude)) {
                return;
            }
            wsMessageService.send(msgMsg, user);
        });

        return true;
    }

    public void sendSystemMessageToUser(SystemMessage message, User user) {
        wsMessageService.send(new ChatMessageServerMsg(message), user);
    }

    public void removeChannel(Channel channel) {
        channelMap.remove(channel.getId());
    }

    public Channel getChannelById(long id) {
        return channelMap.get(id);
    }

    public Channel createChannel(Channel channel) {
        channel.setId(nextChannelId());
        channelMap.put(channel.getId(), channel);
        return channel;
    }

    private void onLeftChannel(Channel channel, User user) {
        if (channel.getType() == ChannelType.PM) {
            if (channel.getUsers().isEmpty()) {
                removeChannel(channel);
            } else {
                wsMessageService.send(
                    new ChannelUserLeftServerMsg(user, channel),
                    channel.getUsers().get(0));
            }
        }
    }

    private Channel createDefault(long id) {
        Channel channel = new Channel();
        channel.setId(id);
        channel.setType(ChannelType.PUBLIC);
        createChannel(channel);
        return channel;
    }

    private static long nextChannelId = 20;
    private static long nextChannelId() {
        return ++nextChannelId;
    }
}