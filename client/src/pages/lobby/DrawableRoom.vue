<template>
  <q-card
    v-ripple
    :style="{
      borderLeft: `5px solid ${statusColor}`,
      cursor: 'pointer',
    }"
    @click="onClick"
  >
    <q-card-section class="row justify-between items-center q-py-xs">
      <div class="text-body1">
        {{ name }}
      </div>
      <div class="text-caption">{{ statusText }}</div>
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
        :reverse="redChessUser && blackChessUser"
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

    const ROOM_STATUS_MAP: {
      [n: number]: {text: string, color: string}
    } = {
      1: {
        text: '可加入',
        color: '#22dd00',
      },
      2: {
        text: '即将开始(可旁观)',
        color: '#af52c6',
      },
      3: {
        text: '进行中(可旁观)',
        color: '#ff9800',
      },
    };
    const statusColor = computed(() => ROOM_STATUS_MAP[roomStates.status].color);
    const statusText = computed(() => ROOM_STATUS_MAP[roomStates.status].text);

    watch(props, () => {
      roomStates.name = props.room.name;
      roomStates.status = props.room.status;
      roomStates.redChessUser = props.room.redChessUser;
      roomStates.blackChessUser = props.room.blackChessUser;
    });

    const onClick = () => {
      if (!api.isLoggedIn) {
        $q.notify({ type: 'warning', message: '请先登录' });
        return;
      }

      $q.loading.show();

      if (room.userCount == 1) {
        const paramRoom = new Room();
        paramRoom.id = room.id;
        if (room.locked) {
          // todo
        }
        const req = new JoinRoomRequest(room);
        req.success = async (result) => {
          await $router.push({
            name: 'play',
            query: { id: result.room.id as unknown as string },
            params: { room: result.room as unknown as string },
          });
          $q.loading.hide();
        };
        req.failure = (result) => {
          const codeMsgMap: { [code: number]: string } = {
            2: '未连接到服务器',
            3: '棋桌已满',
            4: '你已加入本棋桌',
            5: '你已加入其它棋桌',
            6: '密码错误',
            7: '该棋桌已不存在',
          };
          $q.notify({ type: 'warning', message: `加入棋桌失败：${codeMsgMap[result.code]}` });
          $q.loading.hide();
        };
        api.perform(req);
      } else {
        const req = new SpectateRoomRequest(room);
        req.success = async (spectateResponse: SpectateResponse) => {
          await $router.push({
            name: 'spectate',
            query: { id: spectateResponse.room.id as unknown as string },
            params: { spectateResponse: spectateResponse as unknown as string },
          });
          $q.loading.hide();
        };
        req.failure = () => {
          $q.notify({ type: 'error', message: '观看请求失败' });
          $q.loading.hide();
        };
        api.perform(req);
      }
    };

    return {
      ...toRefs(roomStates),
      statusColor,
      statusText,
      onClick,
    };
  },
});
</script>

<style lang="sass" scoped>
.q-card
  width: 320px
</style>
