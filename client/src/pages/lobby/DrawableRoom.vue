<template>
  <q-card
    v-ripple
    :style="{
      borderColor: statusStates.color,
      backgroundColor: statusStates.backgroundColor,
      cursor: 'pointer',
    }"
    class="room"
    @click="onClick"
  >
    <q-card-section class="header row justify-between items-center">
      <div class="text-body1 row items-center q-gutter-x-xs">
        <span :class="{number: !name}">{{ name || id }}</span>
        <chinese-chess-icon
          v-if="gameType == 1 || gameType == 3"
          :isDarkRule="gameType == 3"
        />
        <gobang-icon v-else-if="gameType == 2" />
        <span class="game-type-name text-body1">({{ gameTypeName }})</span>
      </div>
      <div class="text-caption">
        <span>{{ statusStates.text }}</span>
        <q-icon
          v-if="locked"
          name="lock"
        />
      </div>
    </q-card-section>
    <div class="row justify-center items-center q-pb-xs q-px-xs no-wrap">
      <room-user-place :reverse="false">
        <drawable-room-user
          v-if="gameUsers[0]"
          :game-user="gameUsers[0]"
          :game-type="gameType"
        />
      </room-user-place>
      <vs-icon />
      <room-user-place :reverse="!!gameUsers[1]">
        <drawable-room-user
          v-if="gameUsers[1]"
          :game-user="gameUsers[1]"
          :game-type="gameType"
          :reverse="!!gameUsers[1]"
        />
      </room-user-place>
    </div>
  </q-card>
</template>

<script lang="ts">
import device from "current-device";
import {
  defineComponent, PropType, getCurrentInstance, watch, reactive, toRefs, computed,
} from '@vue/composition-api';
import JoinRoomRequest from 'src/online/room/JoinRoomRequest';
import SpectateRoomRequest from 'src/online/spectator/SpectateRoomRequest';
import { api } from 'src/boot/main';
import SpectateResponse from 'src/online/spectator/APISpectateResponse';
import { GameType } from 'src/rulesets/GameType';
import GobangIcon from 'src/rulesets/gobang/ui/GobangIcon.vue';
import ChineseChessIcon from 'src/rulesets/chinesechess/ui/ChineseChessIcon.vue';
import VsIcon from 'src/rulesets/ui/VsIcon.vue';
import DrawableRoomUser from './DrawableRoomUser.vue';
import Room from '../../online/room/Room';
import RoomUserPlace from './RoomUserPlace.vue';

export default defineComponent({
  components: {
    DrawableRoomUser,
    RoomUserPlace,
    VsIcon,
    GobangIcon,
    ChineseChessIcon,
  },
  props: {
    room: {
      type: (Object as unknown) as PropType<Room>,
      required: true,
    },
  },
  setup(props) {
    const context = getCurrentInstance() as Vue;
    const { $q, $router } = context;

    const room = reactive({
      ...props.room,
    });

    const ROOM_STATUS_MAP: {
      [n: number]: {text: string, color: string, backgroundColor: string}
    } = {
      1: {
        text: '可加入',
        color: '#22dd00',
        backgroundColor: 'rgba(34, 221, 0, 0.08)',
      },
      2: {
        text: '即将开始(可观战)',
        color: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.08)',
      },
      3: {
        text: '进行中(可观战)',
        color: '#fdd835',
        backgroundColor: 'rgba(253, 216, 53, 0.08)',
      },
    };

    const GAME_TYPE_MAP: {
      [n: number]: {text: string}
    } = {
      [GameType.chinesechess]: {
        text: '象棋',
      },
      [GameType.chinesechessDark]: {
        text: '揭棋',
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

    const joinRoom = (password?: string) => {
      $q.loading.show();
      room.password = password;
      const req = new JoinRoomRequest(room);
      req.success = async (result) => {
        await $router.push({
          name: 'play',
          replace: true,
          query: { room_id: result.room.id as unknown as string },
          params: { room: result.room as unknown as string },
        });
        $q.loading.hide();
      };
      req.failure = (result) => {
        const codeMsgMap: { [code: number]: string } = {
          2: '未连接到服务器',
          3: '房间已满',
          4: '你已加入本房间',
          5: '你已加入其它房间',
          6: '密码错误',
          7: '该房间已不存在',
        };
        $q.notify({ type: 'warning', message: `加入房间失败：${codeMsgMap[result.code]}` });
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
          query: { room_id: spectateResponse.room.id as unknown as string },
          params: { spectateResponse: spectateResponse as unknown as string },
        });
        $q.loading.hide();
      };
      req.failure = () => {
        $q.notify({ type: 'error', message: '观战请求失败' });
        $q.loading.hide();
      };
      api.perform(req);
    };

    const onClick = () => {
      if (!api.isLoggedIn) {
        $q.notify({ type: 'warning', message: '请先登录' });
        return;
      }

      const joinOrSpectateRoom = (password?: string) => {
        if (room.gameUsers.length == 1) {
          joinRoom(password);
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
            joinRoom(password);
          } else {
            spectateRoom();
          }
        }
      };

      if (room.locked) {
        context.$q.dialog({
          title: '该房间需要密码',
          message: '请输入房间密码',
          prompt: {
            model: '',
            type: 'text',
          },
          ok: {
            label: '加入',
            color: 'primary',
          },
          cancel: {
            label: '取消',
            color: 'orange',
          },
        }).onOk((passowrd: string) => {
          setTimeout(() => {
            joinOrSpectateRoom(passowrd);
            // fix:安卓手机软键盘占用空间
            // eslint-disable-next-line
          }, device.android() ? 500 : 0);
        });
      } else {
        joinOrSpectateRoom();
      }
    };

    return {
      ...toRefs(room),
      statusStates,
      gameTypeName,
      gameType: gameSettings.gameType,
      onClick,
    };
  },
});
</script>

<style lang="sass" scoped>
.q-card
  width: calc(100% - 2px)
  border-radius: 6px
  box-shadow: 0px 2px 4px 2px rgb(0, 0, 0, 0.15)
  border: 1px solid
  transition: all 0.1s ease
  user-select: none

  &:hover,
  &:active
    opacity: 0.8
  &:active
    box-shadow: none

  .header
    padding-top: 4px
    padding-bottom: 6px
    padding-left: 8px
    padding-right: 4px

    .game-type-name
      font-size: 14px
      color: #333
</style>
