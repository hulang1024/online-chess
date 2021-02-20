<template>
  <q-card
    v-ripple
    :style="{
      borderLeft: `5px solid ${statusStates.color}`,
      cursor: 'pointer',
    }"
    @click="onClick"
  >
    <q-card-section class="row justify-between items-center q-py-xs">
      <div class="text-body1">
        {{ name }} <span class="text-caption">({{ gameTypeName }})</span>
      </div>
      <div class="text-caption">{{ statusStates.text }}</div>
    </q-card-section>
    <q-card-section
      horizontal
      class="row justify-between q-pb-sm q-px-md"
    >
      <drawable-room-user
        v-if="gameUsers[0]"
        :game-user="gameUsers[0]"
      />
      <drawable-room-user
        v-if="gameUsers[1]"
        :game-user="gameUsers[1]"
        :reverse="!!(gameUsers.length == 2)"
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
import { GameType } from 'src/rulesets/GameType';
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

    const room = reactive({
      ...props.room,
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
        color: '#ff9800',
      },
      3: {
        text: '进行中(可旁观)',
        color: '#fdd835',
      },
    };

    const GAME_TYPE_MAP: {
      [n: number]: {text: string}
    } = {
      [GameType.chinesechess]: {
        text: '象棋',
      },
      [GameType.gobang]: {
        text: '五子棋',
      },
    };

    const { gameSettings } = room.roomSettings;
    const statusStates = computed(() => ROOM_STATUS_MAP[room.status]);
    const gameTypeName = computed(() => GAME_TYPE_MAP[gameSettings.gameType].text);

    watch(props, () => {
      Object.assign(room, props.room);
    });

    const joinRoom = () => {
      $q.loading.show();
      const req = new JoinRoomRequest(room);
      req.success = async (result) => {
        await $router.push({
          name: 'play',
          replace: true,
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
    };

    const spectateRoom = () => {
      $q.loading.show();
      const req = new SpectateRoomRequest(room);
      req.success = async (spectateResponse: SpectateResponse) => {
        await $router.push({
          name: 'spectate',
          replace: true,
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
    };

    const onClick = () => {
      if (!api.isLoggedIn) {
        $q.notify({ type: 'warning', message: '请先登录' });
        return;
      }

      if (room.gameUsers.length == 1) {
        if (room.locked) {
          // todo
        }
        joinRoom();
      } else {
        let updated = false;
        for (let i = 0; i < room.gameUsers.length; i++) {
          const gameUser = room.gameUsers[i];
          if (gameUser.user?.id == api.localUser.id) {
            gameUser.user = null;
            updated = true;
          }
        }
        if (updated) {
          joinRoom();
        } else {
          spectateRoom();
        }
      }
    };

    return {
      ...toRefs(room),
      statusStates,
      gameTypeName,
      onClick,
    };
  },
});
</script>

<style lang="sass" scoped>
.q-card
  width: 320px

  &:active
    box-shadow: none
</style>
