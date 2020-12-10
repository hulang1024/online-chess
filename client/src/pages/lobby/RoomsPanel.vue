<template>
  <div class="rooms q-px-sm q-py-sm">
    <q-inner-loading
      :showing="spinnerShow"
      color="primary"
      size="3em"
    />
    <drawable-room v-for="room in rooms" :key="room.id" :room="room" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, Ref, ref, toRef, watch, watchEffect } from '@vue/composition-api';
import Room from 'src/online/room/Room';
import DrawableRoom from './DrawableRoom.vue';

export default defineComponent({
  components: { DrawableRoom },
  props: {
    loading: (Boolean as unknown) as PropType<Ref<boolean>>,
    rooms: (Array as unknown) as PropType<Ref<Room[]>>
  },
  setup(props) {
    const spinnerShow = ref(props.loading);
    watchEffect(() => {
      spinnerShow.value = props.loading?.value;
    });

    return {
      spinnerShow
    };
  }
});
</script>

<style scoped>
.rooms {
  position: relative;
  flex-grow: 1;
}
</style>