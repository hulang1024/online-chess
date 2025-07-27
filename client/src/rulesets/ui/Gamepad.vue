<template>
  <transition
    appear
    enter-active-class="animated fadeInUp"
    leave-active-class="animated fadeOutDown"
    :duration="200"
  >
    <q-btn-group
      v-show="visible"
      transition-show="slide-up"
      transition-hide="slide-down"
      spread
      class="gamepad full-width"
    >
      <q-btn
        icon="arrow_back"
        @click="onDirClick('left')"
      />
      <q-btn
        icon="arrow_upward"
        @click="onDirClick('up')"
      />
      <q-btn
        icon="check"
        text-color="lime-14"
        class="ok"
        @click="onOkClick()"
      />
      <q-btn
        icon="arrow_downward"
        @click="onDirClick('down')"
      />
      <q-btn
        icon="arrow_forward"
        @click="onDirClick('right')"
      />
    </q-btn-group>
  </transition>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup(props, { emit }) {
    const visible = ref(false);

    const onDirClick = (dir: string) => {
      emit(dir);
    };

    const onOkClick = () => {
      emit('ok');
    };

    return {
      visible,
      onDirClick,
      onOkClick,
    };
  },
});
</script>
<style scoped>
.gamepad {
  user-select: none;
}

.gamepad >>> button {
  padding: 2px;
  background: rgb(29, 29, 29, 0.6) !important;
}

.gamepad >>> button:not(.ok) {
  color: #fff;
}

.gamepad >>> i {
  font-weight: bolder;
  font-size: 2.4em;
  text-shadow: 0px 0px 4px rgb(29, 29, 29, 0.7);
}

.gamepad >>> button.ok i:active {
  color: greenyellow;
}

.gamepad >>> button:not(.ok) i:active {
  color: orange;
}
</style>
