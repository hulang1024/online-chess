<template>
  <div
    class="room-user-place"
    :class="[`justify-${reverse ? 'start' : 'end'}`, $q.dark.isActive && 'dark']"
  >
    <slot />
  </div>
</template>
<script>
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  props: {
    reverse: Boolean,
  },
});
</script>

<style lang="sass" scoped>
.room-user-place
  flex-grow: 1
  display: flex
  flex-wrap: nowrap
  padding: 2px
  height: 36px
  width: 100%
  background: rgba(50, 50, 50, 0.05)
  border-radius: 4px !important
  box-shadow: inset 0px 0px 4px 2px rgba(10, 10, 10, 0.1)

  &.dark
    background: rgba(150, 150, 150, 0.2)
</style>
