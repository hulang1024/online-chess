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
      <q-tab name="0" label="全部" />
      <q-tab name="1" label="可加入" />
      <q-tab name="2" label="即将开始" />
      <q-tab name="3" label="进行中" />
    </q-tabs>
    
    <create-room-dialog ref="createRoomDialog" />
    <rooms-panel :loading="roomsLoading" :rooms="rooms" />

    <confirm-dialog ref="confirmDialog" />

  </q-page>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, onMounted, reactive, Ref, ref, watch, computed } from '@vue/composition-api';
import CreateRoomRequest from 'src/online/room/CreateRoomRequest';
import GetRoomsRequest from 'src/online/room/GetRoomsRequest';
import QuickStartRequest from 'src/online/room/QuickStartRequest';
import Room from 'src/online/room/Room';
import RoomManager from 'src/online/room/RoomManager.ts';
import User from 'src/online/user/User';
import * as game_events from 'src/online/ws/events/play';
import { debug } from 'util';
import CreateRoomDialog from './CreateRoomDialog.vue';
import RoomsPanel from './RoomsPanel.vue';
import ConfirmDialog from '../play/ConfirmDialog.vue';

export default defineComponent({
  components: { CreateRoomDialog, RoomsPanel, ConfirmDialog },
  setup() {
    let { api, socketService, $refs, $router, $q } = <any>getCurrentInstance();
    let roomManager = new RoomManager(api, socketService);

    socketService.queue((send: Function) => send('activity.enter', {code: 1}));

    game_events.gameContinue.addOnce(() => {
      $refs.confirmDialog.open({
        yesText: '继续游戏',
        noText: '不继续',
        text: '你还有进行中的对局，是否回到游戏？',
        action: (isOk: boolean) => {
          socketService.queue((send: Function) => {
            send('play.game_continue', {ok: isOk});
          });
          game_events.gameStates.addOnce((msg: game_events.GameStatesMsg) => {
            $router.push({name: 'play', params: {initialGameStates: msg.states}});
          });
        }
      });
    });

    let roomStatusActiveTab = ref('0');

    const checkNotLoggedIn = (): boolean => {
      if (!api.isLoggedIn.value) {
        $q.notify({type: 'warning', message: '你现在是游客，请先登录'});
        return true;
      }

      return false;
    }

    const onQuickJoinClick = () => {
      if (checkNotLoggedIn()) {
        return;
      }

      let req = new QuickStartRequest();
      req.success = (room) => {
        $router.push({name: 'play', params: {room}});
      };
      req.failure = () => {
        let room = new Room();
        room.name = '';
        let req = new CreateRoomRequest(room);
        req.success = (room) => {
          $router.push({name: 'play', params: {room}});
        };
        req.failure = () => {
          $q.notify({type: 'warning', message: '快速加入失败'});
        };
        api.perform(req);
      };
      api.perform(req);
    };

    const onCreateRoomClick = () => {
      if (checkNotLoggedIn()) {
        return;
      }
      $refs.createRoomDialog.show({
        action: (room: Room, done: (success: boolean) => void) => {
          let req = roomManager.createRoom(room);
          req.success = (room: Room) => {
            done(true);
            $router.push({name: 'play', params: {room}});
          };
          req.failure = () => done(false);
        }
      });
    };

    const queryRooms = () => {
      let status = roomStatusActiveTab.value;
      status = status == '0' ? '' : status;
      roomManager.searchRooms({status});
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
      onCreateRoomClick
    };
  },
});
</script>