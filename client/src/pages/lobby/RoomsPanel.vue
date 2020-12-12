<template>
  <div class="rooms q-px-sm q-py-sm">
    <q-inner-loading
      :showing="spinnerShow"
      class="bg-transparent"
      color="primary"
      size="3em"
    />
    <drawable-room
      v-for="room in rooms"
      :key="room.id"
      :room="room"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent, PropType, Ref, ref, watch,
} from '@vue/composition-api';
import Room from 'src/online/room/Room';
import DrawableRoom from './DrawableRoom.vue';

export default defineComponent({
  components: { DrawableRoom },
  props: {
    loading: Boolean,
    rooms: (Array as unknown) as PropType<Ref<Room[]>>,
  },
  setup(props) {
    const spinnerShow = ref<boolean | undefined>(props.loading);
    watch(props, () => {
      spinnerShow.value = props.loading;
    });

    return {
      spinnerShow,
    };
  },
});
</script>

<style scoped>
.rooms {
  position: relative;
  flex-grow: 1;
}
</style>
