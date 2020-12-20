<template>
  <div
    v-show="visible"
    class="ready-start row justify-evenly text-white q-py-lg"
  >
    <q-btn
      :label="label"
      :color="color"
      style="width: 100px"
      @click="onReadyStart"
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
    readied: Boolean,
    otherReadied: Boolean,
    isRoomOwner: Boolean,
    gameState: Number as PropType<GameState>,
  },
  setup(props, { emit }) {
    const visible = ref<boolean>(false);
    const label = ref<string>('');
    const color = ref<string>('');

    let onPropsChange;
    watch(props, onPropsChange = () => {
      const {
        readied, otherReadied, isRoomOwner, gameState,
      } = props;
      if (gameState == GameState.READY) {
        if (isRoomOwner) {
          if (otherReadied) {
            label.value = '开始!';
            color.value = 'deep-orange';
            visible.value = true;
          } else {
            visible.value = false;
          }
        } else {
          label.value = readied ? '取消准备' : '准备!';
          color.value = readied ? 'negative' : 'positive';
          visible.value = true;
        }
      } else {
        visible.value = false;
      }
    });

    onPropsChange();

    return {
      visible,
      label,
      color,
      onReadyStart: () => {
        emit('ready-start');
      },
    };
  },
});
</script>

<style lang="sass" scoped>
.ready-start
  width: 100%
  background-color: rgba(0, 0, 0, 0.2)
</style>
