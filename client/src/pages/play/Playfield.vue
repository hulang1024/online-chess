<template>
  <div class="playfield row items-center justify-center relative-position">
    <slot />
  </div>
</template>

<script lang="ts">
export default {};
</script>

<style lang="sass" scoped>
.playfield
  width: 100%
  flex-grow: 1
</style>
