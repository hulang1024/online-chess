import {
  computed, reactive, ref, Ref, watchEffect, watch, getCurrentInstance, onBeforeUnmount,
} from "vue";
import { channelManager, socketService } from "src/boot/main";
import Channel from "src/online/chat/Channel";
import ChannelType from "src/online/chat/ChannelType";
import { ConfirmRequestType } from "src/online/play/confirm_request";
import { ChatStatusInGameMsg } from "src/online/play/gameplay_server_messages";
import GameState from "src/online/play/GameState";
import ChessHost from "src/rulesets/chess_host";
import { createBoundRef } from "src/utils/vue/vue_ref_utils";
import GameUser from "../../online/play/GameUser";
import Player from "./Player";

export function usePlayerStates(player: Player) {
  const context = getCurrentInstance()!.proxy as unknown as Vue;

  // 有些元素随窗口尺寸变化无法实现，因此在初始时就确定屏幕大小
  // eslint-disable-next-line
  const isXSScreen = context.$q.platform.is.mobile as boolean;

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
    typing: false,
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

  const activeChessHost: Ref<ChessHost | null> = createBoundRef(player.game.activeChessHost);

  const confirmRequestLoadings = reactive(
    Object.keys(player.confirmRequestLoadings).reduce((o, key) => {
      o[key] = createBoundRef(
        player.confirmRequestLoadings[key as unknown as ConfirmRequestType],
      );
      return o;
    }, {} as { [k: string]: Ref<boolean> }),
  );

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
  const updateUnreadMessageCount = () => {
    let count = 0;
    channelManager.joinedChannels.value.forEach((ch: Channel) => {
      if ([ChannelType.ROOM, ChannelType.PM].includes(ch.type)) {
        count += ch.countUnreadMessage();
      }
    });
    unreadMessageCount.value = count;
  };

  channelManager.currentChannel.addAndRunOnce((channel: Channel) => {
    channel.newMessagesArrived.add(updateUnreadMessageCount);
  });

  const chatOverlay = ((context.$vnode.context as Vue).$refs.chatOverlay as Vue);
  chatOverlay.$on('active', updateUnreadMessageCount);
  socketService.on('play.chat_status', (msg: ChatStatusInGameMsg) => {
    if (msg.uid == viewUser.user?.id) {
      viewUser.typing = msg.typing;
    }
    if (msg.uid == otherUser.user?.id) {
      otherUser.typing = msg.typing;
    }
  });

  onBeforeUnmount(() => {
    chatOverlay.$off('active', updateUnreadMessageCount);
    socketService.off('play.chat_status');
  });

  const onChatClick = () => {
    // eslint-disable-next-line
    (context.$vnode.context?.$refs.toolbar as any).toggle('chat');
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
    activeChessHost,
    confirmRequestLoadings,
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
    onSettingsClick: player.onSettingsClick.bind(player),
  };
}
