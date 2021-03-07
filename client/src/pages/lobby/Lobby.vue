<template>
  <q-page class="column items-center">
    <div
      class="main-content"
    >
      <!-- 房间筛选选项卡 -->
      <div class="filter-container q-mt-sm">
        <q-tabs
          v-model="gameTypeActiveTab"
          dense
          narrow-indicator
          indicator-color="primary"
          active-color="primary"
          align="justify"
          :class="[
            'row',
            $q.dark.isActive && 'text-white',
            $q.dark.isActive ? 'bg-grey-6' : 'bg-grey-4'
          ]"
        >
          <q-tab
            :name="0"
            label="全部"
          />
          <q-tab
            :name="2"
            label="五子棋"
          />
          <q-tab
            :name="1"
            label="象棋"
          />
        </q-tabs>
        <q-tabs
          v-model="roomStatusActiveTab"
          dense
          narrow-indicator
          :indicator-color="roomStatusActiveColor"
          :active-color="roomStatusActiveColor"
          class="q-mt-xs"
          :class="[
            'row',
            $q.dark.isActive && 'text-white',
            $q.dark.isActive ? 'bg-grey-6' : 'bg-grey-4'
          ]"
        >
          <q-tab
            :name="0"
            label="全部"
          />
          <q-tab
            :name="1"
            label="可加入"
          />
          <q-tab
            :name="2"
            label="即将开始"
          />
          <q-tab
            :name="3"
            label="进行中"
          />
        </q-tabs>
      </div>
      <rooms-panel
        ref="roomsPanel"
        :loading="roomsLoading"
        :rooms="rooms"
      />
      <div
        class="row justify-evenly q-gutter-x-sm"
        :class="$q.screen.xs && 'q-px-sm'"
      >
        <u-button
          color="primary"
          label="创建房间"
          class="col float-right q-mt-sm"
          @click="onCreateRoomClick"
        />
        <u-button
          color="light-green"
          label="快速加入"
          class="col float-right q-mt-sm"
          :loading="joining"
          @click="onQuickJoinClick"
        />
      </div>
    </div>

    <create-room-dialog ref="createRoomDialog" />
  </q-page>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, onMounted, onBeforeUnmount, ref, watch, computed,
} from '@vue/composition-api';
import CreateRoomRequest from 'src/online/room/CreateRoomRequest';
import QuickStartRequest from 'src/online/room/QuickStartRequest';
import ReplyInvitationRequest from 'src/online/invitation/ReplyInvitationRequest';
import Room from 'src/online/room/Room';
import RoomManager from 'src/online/room/RoomManager';
import * as InvitationEvents from "src/online/invitation";
import * as GameplayMsgs from 'src/online/play/gameplay_server_messages';
import {
  api, audioManager, channelManager, socketService,
} from 'src/boot/main';
import { InvitationReplyServerMsg, InvitationServerMsg } from 'src/online/invitation';
import ResponseGameStates from 'src/rulesets/online/game_states_response';
import * as playPageSignals from 'src/pages/play/signals';
import { GameType } from 'src/rulesets/GameType';
import GameSettings from 'src/rulesets/GameSettings';
import TimerSettings from 'src/rulesets/TimerSettings';
import RoomSettings from 'src/online/room/RoomSettings';
import CreateRoomDialog from './CreateRoomDialog.vue';
import RoomsPanel from './RoomsPanel.vue';
import { userActivityClient } from '../../boot/main';

export default defineComponent({
  components: { CreateRoomDialog, RoomsPanel },
  setup() {
    const ctx = getCurrentInstance() as Vue;
    const { $refs, $router, $q } = ctx;
    const roomManager = new RoomManager();
    const joining = ref(false);
    const gameTypeActiveTab = ref(0);
    const roomStatusActiveTab = ref(0);

    const roomStatusActiveColor = computed(() => {
      const colorMap: { [k: number]: string } = {
        0: 'primary',
        1: 'green',
        2: 'orange',
        3: 'amber',
      };
      return colorMap[roomStatusActiveTab.value];
    });

    const resize = (isChatActive: boolean) => {
      const pageEl = ctx.$el as HTMLElement;
      const height = (pageEl?.parentElement?.offsetHeight || 0) - (178 + (isChatActive ? 284 : 0));
      // eslint-disable-next-line
      (ctx.$refs.roomsPanel as any).$el.style.height = `${height}px`;
    };
    onMounted(resize);

    const onChatOverlayActive = (isActive: boolean) => {
      setTimeout(() => {
        resize(isActive);
      }, 0);
    };
    // eslint-disable-next-line
    ((ctx.$vnode.context as Vue).$refs.chatOverlay as Vue).$on('active', onChatOverlayActive);

    const queryRooms = () => {
      let status: number | null = roomStatusActiveTab.value;
      status = status == 0 ? null : status;
      let gameType: number | null = gameTypeActiveTab.value;
      gameType = gameType == 0 ? null : gameType;
      roomManager.searchRooms({ status, gameType });
    };

    const pushPlayPage = async (room: Room | null, states?: ResponseGameStates) => {
      $q.loading.show();
      await $router.push({
        name: 'play',
        replace: true,
        query: { id: room?.id as unknown as string },
        params: {
          room: room as unknown as string,
          initialGameStates: states as unknown as string,
        },
      });
      $q.loading.hide();
    };

    const onReconnected = () => {
      queryRooms();
      userActivityClient.enter(1);
    };

    socketService.reconnected.add(onReconnected);

    const onLoggedIn = () => {
      if (!api.isLoggedIn) {
        return;
      }
      userActivityClient.enter(1);
    };
    api.state.changed.add(onLoggedIn);

    const onGameContinue = () => {
      const onAction = (isOk: boolean) => {
        socketService.queue((send) => {
          send('play.game_continue', { ok: isOk });
        });
      };
      $q.dialog({
        title: '继续游戏',
        message: '是否返回到中途退出的游戏中？',
        persistent: true,
        ok: {
          label: '是',
          color: 'primary',
        },
        cancel: {
          label: '否',
          color: 'negative',
        },
      }).onOk(() => onAction(true))
        .onCancel(() => onAction(false));
    };
    const onGameStates = async (msg: GameplayMsgs.GameStatesMsg) => {
      await pushPlayPage(msg.states.room, msg.states);
    };
    socketService.on('play.game_continue', onGameContinue);
    socketService.on('play.game_states', onGameStates);
    const onNewInvitation = (msg: InvitationServerMsg) => {
      const { invitation } = msg;
      // eslint-disable-next-line
      (ctx.$vnode.context?.$refs.toolbar as any).exitActive();
      // eslint-disable-next-line
      audioManager.samples.get('new_invitation').play();
      const onAction = (isAccept: boolean) => {
        const req = new ReplyInvitationRequest(invitation.id, isAccept);
        req.success = (res) => {
          if (!isAccept) {
            return;
          }
          const toPage = async () => {
            if (res.playRoom) {
              // eslint-disable-next-line
              pushPlayPage(res.playRoom);
            } else if (res.spectateResponse) {
              $q.loading.show();
              // eslint-disable-next-line
              await $router.push({
                name: 'spectate',
                replace: true,
                query: { id: res.spectateResponse.room.id as unknown as string },
                params: { spectateResponse: res.spectateResponse as unknown as string },
              });
              $q.loading.hide();
            }
          };

          if (['play', 'spectate'].includes(ctx.$router.currentRoute.name as string)) {
            playPageSignals.reload.dispatch();
            playPageSignals.exited.addOnce(toPage);
          } else {
            // eslint-disable-next-line
            toPage();
          }
        };
        req.failure = (res) => {
          const codeMsgMap: {[code: number]: string} = {
            1: '操作失败',
            2: '邀请者现在不在线',
            3: '邀请者当前不在游戏中',
            4: '加入房间失败',
            5: '被邀请者正在游戏中',
          };
          $q.notify({ type: 'warning', message: codeMsgMap[res.code] });
        };
        api.perform(req);
      };
      $q.dialog({
        title: '邀请',
        message: `${invitation.inviter.nickname}邀请你${invitation.subject == 'PLAY' ? '加入' : '观战'}游戏`,
        persistent: true,
        ok: {
          label: '接受',
          color: 'primary',
        },
        cancel: {
          label: '拒绝',
          color: 'negative',
        },
      }).onOk(() => onAction(true))
        .onCancel(() => onAction(false));
    };
    if (InvitationEvents.invitation.getNumListeners() == 0) {
      InvitationEvents.invitation.add(onNewInvitation);
    }

    const onInvitationReply = (msg: InvitationReplyServerMsg) => {
      const { reply } = msg;
      $q.notify(`${reply.invitee.nickname}${reply.accept ? '接受' : '拒绝'}了你的邀请`);
    };
    if (InvitationEvents.reply.getNumListeners() == 0) {
      InvitationEvents.reply.add(onInvitationReply);
    }

    watch([roomStatusActiveTab, gameTypeActiveTab], () => {
      queryRooms();
    });

    onMounted(() => {
      onLoggedIn();
      queryRooms();

      // eslint-disable-next-line
      (ctx.$vnode.context?.$refs.toolbar as any).excludeToggle('chat', true);
      channelManager.openChannel(1);
    });

    onBeforeUnmount(() => {
      socketService.reconnected.remove(onReconnected);
      api.state.changed.remove(onLoggedIn);
      roomManager.removeListeners();
      socketService.off('play.game_continue', onGameContinue);
      socketService.off('play.game_states', onGameStates);
      // eslint-disable-next-line
      (ctx.$vnode.context?.$refs.toolbar as any).exitActive();
      ((ctx.$vnode.context as Vue).$refs.chatOverlay as Vue).$off('active', onChatOverlayActive);
    });

    const checkNotLoggedIn = (): boolean => {
      if (!api.isLoggedIn) {
        $q.notify({ type: 'warning', message: '请先登录' });
        return true;
      }

      return false;
    };

    const onQuickJoinClick = () => {
      if (checkNotLoggedIn()) {
        return;
      }
      joining.value = true;
      const req = new QuickStartRequest();
      req.success = async (room) => {
        await pushPlayPage(room);
        joining.value = false;
      };
      req.failure = () => {
        const room = new Room();
        room.name = '';
        const gameSettings = new GameSettings();
        gameSettings.gameType = api.localUser.playGameType
          || (Math.random() > 0.5 ? GameType.chinesechess : GameType.gobang);
        gameSettings.timer = new TimerSettings();
        room.roomSettings = new RoomSettings();
        room.roomSettings.gameSettings = gameSettings;
        const createReq = new CreateRoomRequest(room);
        createReq.success = async (createdRoom) => {
          await pushPlayPage(createdRoom);
          joining.value = false;
        };
        createReq.failure = () => {
          joining.value = false;
          $q.notify({ type: 'warning', message: '快速加入失败' });
        };
        api.perform(createReq);
      };
      api.perform(req);
    };

    const onCreateRoomClick = () => {
      if (checkNotLoggedIn()) {
        return;
      }
      // eslint-disable-next-line
      (<any>$refs.createRoomDialog).show({
        action: (room: Room, done: (success: boolean) => void) => {
          const req = roomManager.createRoom(room);
          req.success = async (createdRoom) => {
            await pushPlayPage(createdRoom);
            done(true);
          };
          req.failure = () => done(false);
        },
      });
    };

    return {
      gameTypeActiveTab,
      roomStatusActiveTab,
      roomStatusActiveColor,

      rooms: roomManager.rooms,
      roomsLoading: roomManager.roomsLoading,
      joining,

      onQuickJoinClick,
      onCreateRoomClick,
    };
  },
});
</script>

<style lang="sass" scoped>
.main-content
  padding: 0 4px
  width: 100%
  max-width: 400px

  .filter-container
    .q-tabs
      border-radius: 8px
</style>
