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
        @click="onQuickJoinClick"
      />
    </div>
    <!-- 房间筛选选项卡 -->
    <q-tabs
      v-model="roomStatusActiveTab"
      dense
      indicator-color="yellow"
      class="row bg-grey-4 text-black"
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

    <confirm-dialog ref="confirmDialog" />
  </q-page>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, onMounted, ref, watch,
} from '@vue/composition-api';
import CreateRoomRequest from 'src/online/room/CreateRoomRequest';
import QuickStartRequest from 'src/online/room/QuickStartRequest';
import Room from 'src/online/room/Room';
import RoomManager from 'src/online/room/RoomManager.ts';
import * as GameEvents from 'src/online/ws/events/play';
import { api, socketService } from 'src/boot/main';
import { RoomSettings } from 'src/online/room/RoomSettings';
import CreateRoomDialog from './CreateRoomDialog.vue';
import RoomsPanel from './RoomsPanel.vue';
import ConfirmDialog from '../play/ConfirmDialog.vue';

export default defineComponent({
  components: { CreateRoomDialog, RoomsPanel, ConfirmDialog },
  setup() {
    const { $refs, $router, $q } = getCurrentInstance() as Vue;
    const roomManager = new RoomManager();

    socketService.queue((send) => send('activity.enter', { code: 1 }));

    GameEvents.gameContinue.add(() => {
      // eslint-disable-next-line
      (<any>$refs.confirmDialog).open({
        yesText: '继续游戏',
        noText: '不继续',
        text: '你还有进行中的对局，是否回到游戏？',
        action: (isOk: boolean) => {
          socketService.queue((send) => {
            send('play.game_continue', { ok: isOk });
          });
          GameEvents.gameStates.addOnce((msg: GameEvents.GameStatesMsg) => {
            // eslint-disable-next-line
            $router.push({ name: 'play', params: { initialGameStates: msg.states as unknown as string } });
          });
        },
      });
    });

    const roomStatusActiveTab = ref(0);

    const checkNotLoggedIn = (): boolean => {
      if (!api.isLoggedIn.value) {
        $q.notify({ type: 'warning', message: '你现在是游客，请先登录' });
        return true;
      }

      return false;
    };

    const onQuickJoinClick = () => {
      if (checkNotLoggedIn()) {
        return;
      }

      const req = new QuickStartRequest();
      req.success = (room) => {
        // eslint-disable-next-line
        $router.push({name: 'play', params: { room: room as unknown as string }});
      };
      req.failure = () => {
        const room = new Room();
        room.name = '';
        room.roomSettings = new RoomSettings();
        const createReq = new CreateRoomRequest(room);
        createReq.success = (createdRoom) => {
          // eslint-disable-next-line
          $router.push({name: 'play', params: { room: createdRoom as unknown as string }});
        };
        createReq.failure = () => {
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
          req.success = (createdRoom) => {
            done(true);
            // eslint-disable-next-line
            $router.push({ name: 'play', params: { room: createdRoom as unknown as string } });
          };
          req.failure = () => done(false);
        },
      });
    };

    const queryRooms = () => {
      let status: number | null = roomStatusActiveTab.value;
      status = status == 0 ? null : status;
      roomManager.searchRooms({ status });
    };

    watch(roomStatusActiveTab, () => {
      queryRooms();
    });

    onMounted(() => {
      queryRooms();
    });

    return {
      roomStatusActiveTab,

      rooms: roomManager.rooms,
      roomsLoading: roomManager.roomsLoading,

      onQuickJoinClick,
      onCreateRoomClick,
    };
  },
});
</script>
