<template>
  <div :class="['vs-icon', {animated}]">VS</div>
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  props: {
    animated: Boolean,
  },
});
</script>
<style lang="sass" scoped>
.vs-icon
  display: flex
  align-items: center
  padding: 4px 18px
  color: #ffe033
  font-weight: bold
  text-shadow: 0px 0px 4px rgba(0, 0, 0, 0.6)

  &.animated
    animation: animation-vs-icon-light 1s linear infinite
</style>
<style>
@keyframes animation-vs-icon-light {
  0% {
    color: #ffe033;
  }
  50% {
    color: #fafad2;
  }
  100% {
    color: #ffe033;
  }
}
</style>
