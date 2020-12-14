<template>
  <q-card
    v-ripple
    :style="{
      borderLeft: `5px solid ${color}`,
      cursor: 'pointer',
    }"
    @click="onClick"
  >
    <q-card-section class="q-py-xs">
      <div class="text-body1">
        {{ name }}
      </div>
    </q-card-section>
    <q-card-section
      horizontal
      class="row justify-between q-pb-sm q-px-md"
    >
      <drawable-room-user
        v-if="redChessUser"
        :user="redChessUser"
      />
      <drawable-room-user
        v-if="blackChessUser"
        :user="blackChessUser"
      />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import {
  defineComponent, PropType, getCurrentInstance, watch, reactive, toRefs, computed,
} from '@vue/composition-api';
import JoinRoomRequest from 'src/online/room/JoinRoomRequest';
import SpectateRoomRequest from 'src/online/spectator/SpectateRoomRequest';
import { api } from 'src/boot/main';
import SpectateResponse from 'src/online/spectator/APISpectateResponse';
import DrawableRoomUser from './DrawableRoomUser.vue';
import Room from '../../online/room/Room';

export default defineComponent({
  components: { DrawableRoomUser },
  props: {
    room: {
      type: (Object as unknown) as PropType<Room>,
      required: true,
    },
  },
  setup(props) {
    const { $q, $router } = getCurrentInstance() as Vue;
    const { room } = props;

    const roomStates = reactive({
      name: room.name,
      status: room.status,
      redChessUser: room.redChessUser,
      blackChessUser: room.blackChessUser,
    });

    const STATUS_COLOR_MAP: { [i: number]: string } = { 1: '#22dd00', 2: '#af52c6', 3: '#ff9800' };
    const color = computed(() => STATUS_COLOR_MAP[roomStates.status]);

    watch(props, () => {
      roomStates.name = props.room.name;
      roomStates.status = props.room.status;
      roomStates.redChessUser = props.room.redChessUser;
      roomStates.blackChessUser = props.room.blackChessUser;
    });

    const onClick = () => {
      if (!api.isLoggedIn.value) {
        $q.notify({ type: 'warning', message: '你现在是游客，请先登录' });
        return;
      }
      if (room.userCount == 1) {
        const paramRoom = new Room();
        paramRoom.id = room.id;
        if (room.locked) {
          // todo
        }

        const req = new JoinRoomRequest(room);
        req.success = (result) => {
          // eslint-disable-next-line
          $router.push({name: 'play', params: { room: result.room }});
        };
        req.failure = (result) => {
          switch (result.code) {
            case 2:
              $q.notify({ type: 'warning', message: '加入棋桌失败：该棋桌已不存在' });
              break;
            case 3:
              $q.notify({ type: 'warning', message: '加入棋桌失败：棋桌已满' });
              break;
            case 4:
              $q.notify({ type: 'warning', message: '加入棋桌失败：你已加入本棋桌' });
              break;
            case 5:
              $q.notify({ type: 'warning', message: '加入棋桌失败：你已加入其它棋桌' });
              break;
            case 6:
              $q.notify({ type: 'warning', message: '加入棋桌失败：密码错误' });
              break;
            default:
              break;
          }
        };
        api.perform(req);
      } else {
        const req = new SpectateRoomRequest(room);
        req.success = (spectateResponse: SpectateResponse) => {
          $router.push({name: 'spectate', params: { spectateResponse }});
        };
        req.failure = () => {
          $q.notify({ type: 'error', message: '观看请求失败' });
        };
        api.perform(req);
      }
    };

    return {
      ...toRefs(roomStates),
      color,
      onClick,
    };
  },
});
</script>
