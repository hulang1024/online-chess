<template>
  <div
    class="playfield column items-center relative-position"
  >
    <slot />
  </div>
</template>

<script lang="ts">
export default {};
</script>

<style lang="sass" scoped>
.playfield
  flex-grow: 1
</style>
