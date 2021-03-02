<template>
  <q-dialog
    v-model="isOpen"
  >
    <q-card
      class="q-px-lg q-py-lg"
      style="max-width: 400px"
    >
      <q-form
        ref="form"
        class="q-gutter-md q-gutter-y-lg"
      >
        <q-btn-toggle
          v-model="gameType"
          toggle-color="primary"
          :options="[
            {label: '五子棋', value: 2},
            {label: '象棋', value: 1},
            {label: '随机', value: 0},
          ]"
        />
        <q-input
          v-model="name"
          standout
          dense
          label="房间名称"
          hint="可不填"
          class="q-mt-md"
        />

        <div
          class="row q-gutter-x-xs justify-between no-wrap"
          style="margin-left: 12px"
        >
          <q-input
            v-model.number="gameDuration"
            type="number"
            standout
            dense
            label="局时"
            suffix="分钟"
            hint="棋局可用总时间"
            lazy-rules
            :rules="[ val => val || '' ]"
          />
          <q-input
            v-model.number="stepDuration"
            type="number"
            standout
            dense
            label="步时"
            suffix="秒"
            hint="局时用完前每步可用时间"
            lazy-rules
            :rules="[ val => val || '' ]"
          />
          <q-input
            v-model.number="secondsCountdown"
            type="number"
            standout
            dense
            label="读秒"
            suffix="秒"
            hint="局时用完后每步可用时间"
            lazy-rules
            :rules="[ val => val || '' ]"
          />
        </div>
        <q-input
          v-if="gameType == 2"
          v-model.number="chessboardSize"
          type="number"
          standout
          dense
          label="棋盘大小"
          lazy-rules
          :rules="[ val => (val && val >= 15 && val % 2 != 0) || '最小15*15且奇数' ]"
        />

        <div class="row no-wrap">
          <q-input
            ref="passwordInput"
            :disable="!requirePassword"
            v-model="password"
            type="password"
            standout
            dense
            label="房间密码"
            class="q-mr-sm"
            style="flex-grow: 1;"
          />
          <q-toggle
            v-model="requirePassword"
            class="q-ml-none"
          />
        </div>

        <div class="q-gutter-y-md">
          <u-button
            label="创建"
            color="primary"
            class="full-width"
            :loading="createLoading"
            @click="onSubmit"
          />
          <u-button
            label="取消"
            outline
            class="full-width"
            @click="isOpen = false"
          />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, reactive, ref, watch, toRefs,
} from '@vue/composition-api';
import Room from 'src/online/room/Room';
import RoomSettings from 'src/online/room/RoomSettings';
import GameSettings from 'src/rulesets/GameSettings';
import TimerSettings from 'src/rulesets/TimerSettings';
import { GameType } from 'src/rulesets/GameType';
import GobangGameSettings from 'src/rulesets/gobang/GobangGameSettings';
import ChineseChessGameSettings from 'src/rulesets/chinesechess/ChineseChessGameSettings';
import { api } from 'src/boot/main';

export default defineComponent({
  setup() {
    const ctx = getCurrentInstance() as Vue;
    const { $refs } = ctx;

    const INIT_VALUES = {
      name: '',
      requirePassword: false,
      password: '',
      ...new GameSettings(),
      ...new TimerSettings(),
      // for gobang
      chessboardSize: 15,
      gameType: 0,
    };

    const form = reactive({ ...INIT_VALUES });
    const isOpen = ref(false);
    const createLoading = ref(false);

    watch(() => form.requirePassword, () => {
      // eslint-disable-next-line
      (ctx.$refs.passwordInput as any).focus();
    });

    let action: (room: Room, success: (success: boolean) => void) => void;
    const show = (options: {
      action: (room: Room, success: (success: boolean) => void) => void
    }) => {
      action = options.action;
      Object.assign(form, INIT_VALUES);
      form.gameType = api.localUser.playGameType || 0;
      createLoading.value = false;
      isOpen.value = true;
    };

    const onSubmit = () => {
      // eslint-disable-next-line
      (<any>$refs.form).validate().then((valid: boolean) => {
        if (!valid) return;
        if (!form.requirePassword) {
          form.password = '';
        }
        createLoading.value = true;

        const room = new Room();
        room.name = form.name;
        room.password = form.password;

        const roomSettings = new RoomSettings();

        let gameSettings: GameSettings;
        let { gameType } = form;
        if (gameType == 0) {
          gameType = Math.random() > 0.5 ? GameType.chinesechess : GameType.gobang;
        }
        switch (gameType) {
          case GameType.chinesechess:
            gameSettings = new ChineseChessGameSettings();
            break;
          case GameType.gobang:
            gameSettings = new GobangGameSettings(form.chessboardSize);
            break;
          default:
            return;
        }
        gameSettings.gameType = gameType;

        const timer = new TimerSettings();
        timer.gameDuration = form.gameDuration;
        timer.stepDuration = form.stepDuration;
        timer.secondsCountdown = form.secondsCountdown;

        gameSettings.timer = timer;

        roomSettings.gameSettings = gameSettings;

        room.roomSettings = roomSettings;
        action(room, (success: boolean) => {
          createLoading.value = false;
          if (success) {
            isOpen.value = false;
          }
        });
      });
    };

    return {
      isOpen,
      show,

      ...toRefs(form),
      createLoading,
      onSubmit,
    };
  },
});
</script>

<style scoped>
>>> .q-field__bottom {
  padding-left: 1px;
}
</style>
