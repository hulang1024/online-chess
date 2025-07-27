<template>
  <div
    class="ready-status"
    :style="{color: isReady ? '#8bc34a' : 'orange'}"
  >
    <span>
      <span>{{ isReady ? '已准备' : '未准备' }}</span>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    isReady: Boolean,
  },
});
</script>

<style lang="sass" scoped>
.ready-status
  user-select: none
</style>
