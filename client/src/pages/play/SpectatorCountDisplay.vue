<template>
  <label v-show="count > 0">
    旁观(<span class="count" :class="{gtzero: count}">{{ count }}</span>)
  </label>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  props: {
    count: {
      type: Number,
      default: 0,
    },
  },
})
</script>

<style lang="sass" scoped>
label
  user-select: none
  .count
    &.gtzero
      color: darkorange
</style>
