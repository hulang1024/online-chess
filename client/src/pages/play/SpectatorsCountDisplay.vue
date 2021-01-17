<template>
  <q-card
    v-show="showAlways || count > 0"
    flat
    class="q-px-sm q-py-sm"
  >
    <label>旁观(<span class="count" :class="{gtzero: count}">{{ count }}</span>)</label>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  props: {
    count: {
      type: Number,
      default: 0,
    },
    showAlways: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<style lang="sass" scoped>
.count
  &.gtzero
    color: darkorange
</style>
