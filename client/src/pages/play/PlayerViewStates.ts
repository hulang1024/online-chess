import {
  computed, reactive, ref, Ref, watchEffect, watch, getCurrentInstance,
} from "@vue/composition-api";
import { api, channelManager } from "src/boot/main";
import Channel from "src/online/chat/Channel";
import ChannelType from "src/online/chat/ChannelType";
import Message from "src/online/chat/Message";
import GameState from "src/online/play/GameState";
import ChessHost from "src/rulesets/chess_host";
import { createBoundRef } from "src/utils/vue/vue_ref_utils";
import GameUser from "../../online/play/GameUser";
import Player from "./Player";

export function usePlayerStates(player: Player) {
  const context = getCurrentInstance() as Vue;

  // 有些元素随窗口尺寸变化无法实现，因此在初始时就确定屏幕大小
  const isXSScreen = context.$q.screen.xs;

  const gameState: Ref<GameState> = createBoundRef(player.gameState);

  const toReactive = (user: GameUser) => reactive({
    user: createBoundRef(user.user),
    online: createBoundRef(user.online),
    status: createBoundRef(user.status),
    ready: createBoundRef(user.ready),
    showReadyStatus: true,
    chess: createBoundRef(user.chess),
    isRoomOwner: createBoundRef(user.isRoomOwner),
    active: false,
    reverse: false,
  });

  const viewUser = toReactive(player.localUser);
  viewUser.reverse = isXSScreen;

  const otherUser = toReactive(player.otherUser);
  otherUser.reverse = !isXSScreen;

  const reverse: Ref<boolean> = createBoundRef(player.reverse);

  watch(reverse, (val) => {
    if (isXSScreen) {
      viewUser.reverse = !val;
      otherUser.reverse = val;
    } else {
      viewUser.reverse = val;
      otherUser.reverse = !val;
    }
  });

  const gameStatus = computed(() => {
    let readyStatusText: string;
    if (player.isWatchingMode) {
      readyStatusText = '准备开始';
    } else {
      readyStatusText = viewUser.isRoomOwner
        ? (otherUser.ready ? '可以开始' : '等待对方准备')
        : (viewUser.ready ? '等待房主开始' : '请准备');
    }
    const statusMap = {
      [GameState.READY]: {
        color: '#ff9800',
        text: readyStatusText,
      },
      [GameState.PLAYING]: {
        color: '#fdd835',
        text: '对局进行中',
      },
      [GameState.PAUSE]: {
        color: '#757575',
        text: '对局暂停',
      },
      [GameState.END]: {
        color: '#757575',
        text: '对局已结束',
      },
    };
    return (otherUser.user?.id && viewUser.user?.id)
      ? statusMap[gameState.value]
      : { color: '#8bc34a', text: '等待玩家加入' };
  });

  const isPlaying = computed(() => gameState.value == GameState.PLAYING);

  const activeChessHost: Ref<ChessHost | null> = createBoundRef(player.game.activeChessHost);

  watchEffect(() => {
    // activeChessHost.value可能为空
    if (gameState.value == GameState.PLAYING) {
      viewUser.active = activeChessHost.value == viewUser.chess;
      otherUser.active = activeChessHost.value == otherUser.chess;
    } else {
      viewUser.active = false;
      otherUser.active = false;
    }

    viewUser.showReadyStatus = gameState.value == GameState.READY && !viewUser.isRoomOwner;
    otherUser.showReadyStatus = gameState.value == GameState.READY && !otherUser.isRoomOwner;
  });

  const { canWithdraw } = player.room.roomSettings.gameSettings;
  const withdrawEnabled = createBoundRef(player.game.withdrawEnabled);

  const spectatorCount: Ref<number> = createBoundRef(player.spectatorClient.spectatorCount);

  const unreadMessageCount = ref(0);
  channelManager.currentChannel.addAndRunOnce((channel: Channel) => {
    if (channel.type == ChannelType.ROOM) {
      channel.newMessagesArrived.add((messages: Message[]) => {
        const message = messages[messages.length - 1];
        if (message.sender.id == api.localUser.id
          || (new Date().getTime() - message.timestamp) > 4000) {
          return;
        }
        const excludeEmojiUserIds = [];
        if (viewUser.user) {
          excludeEmojiUserIds.push(viewUser.user.id);
        }
        if (otherUser.user) {
          excludeEmojiUserIds.push(otherUser.user.id);
        }
        unreadMessageCount.value = channel.getUnreadMessages(excludeEmojiUserIds).length;
      });
    }
  });

  const onChatClick = () => {
    // eslint-disable-next-line
    (context.$vnode.context?.$refs.toolbar as any).toggle('chat');
    unreadMessageCount.value = 0;
  };

  const onInviteClick = () => {
    // eslint-disable-next-line
    (context.$vnode.context?.$refs.toolbar as any).toggle('socialBrowser');
  };

  return {
    isXSScreen,
    gameState,
    gameStatus,
    reverse,
    isPlaying,
    activeChessHost,
    canWithdraw,
    withdrawEnabled,

    viewUser,
    otherUser,
    spectatorCount,
    unreadMessageCount,

    onChatClick,
    onInviteClick,
    onQuitClick: player.onQuitClick.bind(player),
    onHelpClick: player.onHelpClick.bind(player),
  };
}
