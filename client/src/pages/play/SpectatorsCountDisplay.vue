<template>
  <q-card
    v-show="showAlways || count > 0"
    flat
    class="q-px-sm q-py-sm"
  >
    <label>旁观(<span class="text-subtitle1">{{ count }}</span>)</label>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  props: {
    count: Number,
    showAlways: {
      type: Boolean,
      default: false
    }
  },
})
</script>
