<template>
  <q-card
    v-show="count > 0"
    flat
    class="q-px-sm q-py-sm"
  >
    <label>旁观({{ count }})</label>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  props: {
    count: Number,
  },
})
</script>
