<template>
  <q-card
    v-ripple
    style="
      border-left: 5px solid #8bc34a;
      cursor:pointer;"
    @click="onClick"
  >
    <q-card-section class="q-py-xs">
      <div class="text-body1">{{name}}</div>
    </q-card-section>
    <q-card-section horizontal class="row justify-between q-pb-sm q-px-md">
      <drawable-room-user v-if="redChessUser" :user="redChessUser" />
      <drawable-room-user v-if="blackChessUser" :user="blackChessUser" reverse />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import {
  defineComponent, PropType, ref, toRefs, reactive, getCurrentInstance
} from '@vue/composition-api';
import DrawableRoomUser from './DrawableRoomUser.vue';
import Room from '../../online/room/Room';
import JoinRoomRequest from 'src/online/room/JoinRoomRequest';
import SpectateRoomRequest from 'src/online/spectator/SpectateRoomRequest';

export default defineComponent({
  components: { DrawableRoomUser },
  props: {
    room: {
      type: (Object as unknown) as PropType<Room>,
      required: true,
    },
  },
  setup(props) {
    const { $q, $router, api } = getCurrentInstance();

    const { room } = props;
    const onClick = () => {
      if (!api.isLoggedIn.value) {
        $q.notify({type: 'warning', message: '你现在是游客，请先登录'});
        return;
      }
      if (room.userCount == 1) {
        let paramRoom = new Room();
        paramRoom.id = room.id;
        if (room.requirePassword) {
          /*
          this.passwordForJoinRoomDialog.showFor(room);
          this.passwordForJoinRoomDialog.onOkClick = (password: string) => {
            this.passwordForJoinRoomDialog.visible = false;
            paramRoom.password = password;
          }*/
        }

        let req = new JoinRoomRequest(room);
        req.success = (result) => {
          $router.push({name: 'play', params: {room: result.room}});
        };
        req.failure = (result) => {
          switch (result.code) {
            case 2:
              $q.notify({type: 'warning', message: '加入棋桌失败：该棋桌已不存在'});
              return;
            case 3:
              $q.notify({type: 'warning', message: '加入棋桌失败：棋桌已满'});
              return;
            case 4:
              $q.notify({type: 'warning', message: '加入棋桌失败：你已加入本棋桌'});
              return;
            case 5:
              $q.notify({type: 'warning', message: '加入棋桌失败：你已加入其它棋桌'});
              return;
            case 6:
              $q.notify({type: 'warning', message: '加入棋桌失败：密码错误'});
              return;
          }
        }
        api.perform(req);
      } else {
        let req = new SpectateRoomRequest(room);
        req.success = (states) => {
          //todo:
          $router.push({name: 'spectator', params: {states}});
        };
        req.failure = () => {
          $q.notify({type: 'error', message: '观看请求失败'});
        };
        api.perform(req);
      }
    };

    return {
      ...props.room,
      onClick
    }
  },
});
</script>