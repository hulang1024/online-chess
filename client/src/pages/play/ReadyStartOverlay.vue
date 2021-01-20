<template>
  <q-card
    v-show="visible"
    transition-show="fade"
    transition-hide="fade"
    class="ready-start row justify-evenly text-white q-py-lg"
  >
    <u-button
      :label="label"
      :color="color"
      @click="onReadyStart"
    />
  </q-card>
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
  width: 200px

  .q-btn
    width: 100px
    font-weight: bold
    letter-spacing: 1px

</style>
