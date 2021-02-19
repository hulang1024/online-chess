<template>
  <div
    v-show="visible"
    class="ready-overlay row justify-center"
  >
    <q-btn
      label="邀请"
      color="light-green"
      @click.stop="onInviteClick"
    />
    <q-btn
      :label="label"
      color="primary"
      :disable="disable"
      @click="onReadyStart"
    />
    <q-btn
      label="离开"
      color="orange"
      @click="onQuitClick"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent, PropType, ref, watch,
} from '@vue/composition-api';
import GameState from 'src/online/play/GameState';

export default defineComponent({
  props: {
    ready: Boolean,
    otherReady: Boolean,
    isRoomOwner: Boolean,
    gameState: Number as PropType<GameState>,
  },
  setup(props, { emit }) {
    const visible = ref<boolean>(true);
    const label = ref<string>('');
    const disable = ref(true);

    let onPropsChange;
    watch(props, onPropsChange = () => {
      const {
        ready, otherReady, isRoomOwner, gameState,
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
    });

    onPropsChange();

    return {
      visible,
      label,
      disable,
      onReadyStart: () => {
        emit('ready-start');
      },
      onInviteClick() {
        emit('invite');
      },
      onQuitClick() {
        emit('quit');
      },
    };
  },
});
</script>

<style lang="sass" scoped>
.ready-overlay
  width: 100%

  .q-btn
    margin: 0px 4px
    width: 96px
    font-weight: bold
    letter-spacing: 1px

</style>
