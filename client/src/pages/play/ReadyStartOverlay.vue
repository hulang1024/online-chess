<template>
  <q-card
    v-show="visible"
    class="row text-white justify-evenly q-py-lg"
    style="width: 300px"
  >
    <q-btn
      :label="label"
      @click="onReadyStart"
      :color="color"
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
          color.value = 'orange';
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
