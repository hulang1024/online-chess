<template>
  <main-buttons-overlay :visible="visible">
    <div class="row justify-center items-center">
      <q-btn
        push
        label="邀请"
        color="orange"
        @click.stop="$emit('invite')"
      />
      <q-btn
        push
        :label="label"
        color="primary"
        :disable="disable"
        @click="$emit('ready-start')"
      />
      <q-btn
        push
        label="退出房间"
        color="light-green"
        @click="$emit('quit')"
      />
    </div>
    <div class="q-mt-md">
      <q-btn
        :disable="!canToSpectate"
        push
        label="转为观战"
        color="white"
        text-color="black"
        @click="$emit('to-spectate')"
      />
    </div>
  </main-buttons-overlay>
</template>

<script lang="ts">
import {
  defineComponent, PropType, ref, watch,
} from '@vue/composition-api';
import GameState from 'src/online/play/GameState';
import MainButtonsOverlay from './MainButtonsOverlay.vue';

export default defineComponent({
  props: {
    ready: Boolean,
    otherReady: Boolean,
    isRoomOwner: Boolean,
    isRoomOpen: Boolean,
    gameState: Number as PropType<GameState>,
  },
  components: {
    MainButtonsOverlay,
  },
  setup(props) {
    const visible = ref<boolean>(true);
    const label = ref<string>('');
    const disable = ref(true);
    const canToSpectate = ref(false);

    let onPropsChange;
    watch(props, onPropsChange = () => {
      const {
        ready, otherReady, isRoomOwner, isRoomOpen, gameState,
      } = props;
      if (gameState == GameState.READY) {
        if (isRoomOwner) {
          label.value = '开始!';
          disable.value = !otherReady;
        } else {
          label.value = ready ? '取消准备' : '准备!';
          disable.value = false;
        }
        visible.value = true;
      } else {
        visible.value = false;
      }
      canToSpectate.value = !isRoomOpen
        && (isRoomOwner || (!isRoomOwner && !ready))
        && gameState == GameState.READY;
    });

    onPropsChange();

    return {
      visible,
      label,
      disable,
      canToSpectate,
    };
  },
});
</script>
