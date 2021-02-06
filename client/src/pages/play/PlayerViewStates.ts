import {
  computed, reactive, ref, Ref, watchEffect, watch, getCurrentInstance,
} from "@vue/composition-api";
import { api, channelManager } from "src/boot/main";
import Channel from "src/online/chat/Channel";
import ChannelType from "src/online/chat/ChannelType";
import Message from "src/online/chat/Message";
import GameState from "src/online/play/GameState";
import ChessHost from "src/rulesets/chinesechess/chess_host";
import { createBoundRef } from "src/utils/vue/vue_ref_utils";
import GameUser from "./GameUser";
import Player from "./Player";

export function usePlayerStates(player: Player) {
  const context = getCurrentInstance() as Vue;

  // 有些元素随窗口尺寸变化无法实现，因此在初始时就确定屏幕大小
  const isXSScreen = context.$q.screen.xs;

  const gameState: Ref<GameState> = createBoundRef(player.gameState);

  const toReactive = (user: GameUser) => reactive({
    user: createBoundRef(user.bindable),
    online: createBoundRef(user.online),
    status: createBoundRef(user.status),
    readied: createBoundRef(user.readied),
    showReadyStatus: true,
    chessHost: createBoundRef(user.chessHostBindable),
    isRoomOwner: createBoundRef(user.isRoomOwner),
    active: false,
    reverse: false,
  });

  const viewUser = toReactive(player.localUser);
  viewUser.reverse = isXSScreen;

  const otherUser = toReactive(player.otherUser);

  const reverse: Ref<boolean> = createBoundRef(player.reverse);

  watch(reverse, (val) => {
    if (isXSScreen) {
      viewUser.reverse = !val;
      otherUser.reverse = val;
    }
  });

  const gameStatus = computed(() => {
    let readyStatusText: string;
    if (player.isWatchingMode) {
      readyStatusText = '准备开始';
    } else {
      readyStatusText = viewUser.isRoomOwner
        ? (otherUser.readied ? '可以开始' : '等待对方准备')
        : (viewUser.readied ? '等待房主开始' : '请准备');
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
    return otherUser.user?.id
      ? statusMap[gameState.value]
      : { color: '#8bc34a', text: '等待玩家加入' };
  });

  const isPlaying = computed(() => gameState.value == GameState.PLAYING);

  const activeChessHost: Ref<ChessHost | null> = createBoundRef(player.gameRule.activeChessHost);

  watchEffect(() => {
    // activeChessHost.value可能为空
    viewUser.active = activeChessHost.value == viewUser.chessHost;
    otherUser.active = activeChessHost.value == otherUser.chessHost;

    viewUser.showReadyStatus = gameState.value == GameState.READY && !viewUser.isRoomOwner;
    otherUser.showReadyStatus = gameState.value == GameState.READY && !otherUser.isRoomOwner;
  });

  const canWithdraw: Ref<boolean> = createBoundRef(player.gameRule.canWithdraw);

  const spectatorCount: Ref<number> = createBoundRef(player.spectatorCount);

  const unreadMessageCount = ref(0);
  channelManager.currentChannel.addAndRunOnce((channel: Channel) => {
    if (channel.type == ChannelType.ROOM) {
      channel.newMessagesArrived.add((messages: Message[]) => {
        if (messages[0].sender.id == api.localUser.id) {
          return;
        }
        unreadMessageCount.value = channel.getUnreadMessages().length;
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

    viewUser,
    otherUser,
    spectatorCount,
    unreadMessageCount,

    onChatClick,
    onInviteClick,
    onQuitClick: player.onQuitClick.bind(player),
  };
}
