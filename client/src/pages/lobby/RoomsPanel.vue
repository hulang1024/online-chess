<template>
  <q-scroll-area
    class="rooms q-py-sm"
    :delay="200"
    :thumb-style="{
      right: '0px',
      borderRadius: '6px',
      opacity: 0.8
    }"
  >
    <q-inner-loading
      :showing="spinnerShow"
      class="bg-transparent"
      color="primary"
      size="3em"
    />

    <transition
      v-for="room in rooms"
      :key="room.id"
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
      :duration="200"
    >
      <drawable-room
        :room="room"
      />
    </transition>
  </q-scroll-area>
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
.rooms >>> .full-width {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: flex-start;
  align-items: flex-start;
  position: relative;
  flex-grow: 1;
  padding: 4px;
  height: 100%;
}

.room {
  margin-bottom: 8px;
}
</style>
