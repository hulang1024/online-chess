<template>
  <q-dialog
    v-model="isOpen"
    persistent
  >
    <q-card style="width: 200px">
      <q-card-section class="row items-center">
        <span class="q-ml-sm">{{ displayText }}</span>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          label="再来"
          @click="() => onAction('again')"
          color="positive"
          v-close-popup
        />
        <q-btn
          label="退出"
          @click="() => onAction('quit')"
          color="negative"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';

export default defineComponent({
  setup() {
    const isOpen = ref<boolean>(false);
    const displayText = ref<string>('');

    let actionCallback: (action: string) => void;

    const open = ({ result, isTimeout, action }:
      {result: number, isTimeout: boolean, action: (action: string) => void}) => {
      const textMap: { [t: number]: string } = {
        0: '平局',
        1: `${isTimeout ? '因为对方超时，' : ''}你赢了!`,
        2: `${isTimeout ? '因为超时，' : ''}你输了`,
      };
      displayText.value = textMap[result];
      actionCallback = action;
      isOpen.value = true;
    };

    const onAction = (act: string) => {
      actionCallback(act);
      isOpen.value = false;
    };

    return {
      isOpen,
      displayText,
      open,
      onAction,
    };
  },
});
</script>
