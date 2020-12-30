<template>
  <q-page class="column">
    <!-- 头部 -->
    <div class="row justify-evenly q-gutter-x-sm q-px-sm q-mb-sm">
      <q-btn
        color="primary"
        label="创建房间"
        class="col float-right q-mt-sm"
        @click="onCreateRoomClick"
      />
      <q-btn
        color="green"
        label="快速加入"
        class="col float-right q-mt-sm"
        :loading="joining"
        @click="onQuickJoinClick"
      />
    </div>
    <!-- 房间筛选选项卡 -->
    <q-tabs
      v-model="roomStatusActiveTab"
      dense
      indicator-color="yellow"
      :class="['row', 'bg-grey-4', $q.dark.isActive && 'text-black']"
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

    <create-room-dialog ref="createRoomDialog" />
    <rooms-panel
      :loading="roomsLoading"
      :rooms="rooms"
    />
  </q-page>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, onMounted, onUnmounted, ref, watch,
} from '@vue/composition-api';
import CreateRoomRequest from 'src/online/room/CreateRoomRequest';
import QuickStartRequest from 'src/online/room/QuickStartRequest';
import ReplyInvitationRequest from 'src/online/invitation/ReplyInvitationRequest';
import Room from 'src/online/room/Room';
import RoomManager from 'src/online/room/RoomManager.ts';
import * as GameEvents from 'src/online/ws/events/play';
import * as InvitationEvents from "src/online/ws/events/invitation";
import { api, channelManager, socketService } from 'src/boot/main';
import { RoomSettings } from 'src/online/room/RoomSettings';
import { InvitationReplyServerMsg, InvitationServerMsg } from 'src/online/ws/events/invitation';
import ResponseGameStates from 'src/online/play/game_states_response';
import CreateRoomDialog from './CreateRoomDialog.vue';
import RoomsPanel from './RoomsPanel.vue';

export default defineComponent({
  components: { CreateRoomDialog, RoomsPanel },
  setup() {
    const ctx = getCurrentInstance() as Vue;
    const { $refs, $router, $q } = ctx;
    const roomManager = new RoomManager();
    const joining = ref(false);

    const roomStatusActiveTab = ref(0);

    const queryRooms = () => {
      let status: number | null = roomStatusActiveTab.value;
      status = status == 0 ? null : status;
      roomManager.searchRooms({ status });
    };

    const pushPlayPage = async (room: Room | null, states?: ResponseGameStates) => {
      $q.loading.show();
      await $router.push({
        name: 'play',
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
      socketService.send('user_activity.enter', { code: 1 });
    };

    socketService.reconnected.add(onReconnected);

    const onLoggedIn = () => {
      if (!api.isLoggedIn) {
        return;
      }
      socketService.send('user_activity.enter', { code: 1 });
    };
    api.state.changed.add(onLoggedIn);

    const onGameContinue = () => {
      const onAction = (isOk: boolean) => {
        socketService.queue((send) => {
          send('play.game_continue', { ok: isOk });
        });
        GameEvents.gameStates.addOnce(async (msg: GameEvents.GameStatesMsg) => {
          await pushPlayPage(msg.states.room, msg.states);
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
    GameEvents.gameContinue.add(onGameContinue);

    const onNewInvitation = (msg: InvitationServerMsg) => {
      const { invitation } = msg;

      // eslint-disable-next-line
      (ctx.$vnode.context?.$refs.toolbar as any).exitActive();
      const onAction = (isAccept: boolean) => {
        const req = new ReplyInvitationRequest(invitation.id, isAccept);
        req.success = async (res) => {
          if (res.playRoom) {
            await pushPlayPage(res.playRoom);
          }
          if (res.spectateResponse) {
            await $router.push({
              name: 'spectate',
              query: { id: res.spectateResponse.room.id as unknown as string },
              params: { spectateResponse: res.spectateResponse as unknown as string },
            });
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
        message: `${invitation.inviter.nickname}邀请你${invitation.subject == 'PLAY' ? '加入' : '观看'}游戏`,
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

    watch(roomStatusActiveTab, () => {
      queryRooms();
    });

    onMounted(() => {
      socketService.queue((send) => send('user_activity.enter', { code: 1 }));
      queryRooms();

      // eslint-disable-next-line
      (ctx.$vnode.context?.$refs.toolbar as any).toggle('chat');
      channelManager.openChannel(1);
    });

    onUnmounted(() => {
      socketService.reconnected.remove(onReconnected);
      api.state.changed.remove(onLoggedIn);
      roomManager.removeListeners();
      GameEvents.gameContinue.remove(onGameContinue);
      // eslint-disable-next-line
      (ctx.$vnode.context?.$refs.toolbar as any).exitActive();
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
        room.roomSettings = new RoomSettings();
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
      roomStatusActiveTab,

      rooms: roomManager.rooms,
      roomsLoading: roomManager.roomsLoading,
      joining,

      onQuickJoinClick,
      onCreateRoomClick,
    };
  },
});
</script>
