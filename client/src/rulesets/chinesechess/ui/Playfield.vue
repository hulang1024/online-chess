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
<style scoped>
.playfield >>> .chessboard.elements-hide > .chess,
.playfield >>> .chessboard.elements-hide > .chess-target {
  transition: opacity .2s ease;
  opacity: 0 !important;
}

.playfield >>> .judgement {
  display: none;
  padding: 8px 40px;
  color: white;
  background: rgba(0,0,0,0.2);
  border-radius: 4px;
  text-align: center;
  opacity: 0;
  transition: all .2s ease;
  pointer-events: none;
  min-width: fit-content;
}

.playfield >>> .eat-judgement {
  text-shadow: 0px 1px 1px black;
}

.playfield >>> .eat-judgement > .title {
  font-size: 3rem;
  line-height: 3rem;
  font-weight: 500;
}

.playfield >>> .eat-judgement .chess-name {
  text-shadow: 0px 0px 1px white;
  font-weight: bold;
}

.playfield >>> .eat-judgement.show {
  opacity: 1;
}

.playfield >>> .checkmate-judgement {
  font-size: 2rem;
  font-weight: 300;
  text-shadow: 1px 1px 1px white;
}

.playfield >>> .checkmate-judgement.red {
  color: #dd1100;
}

.playfield >>> .checkmate-judgement.black {
  color: #443322;
}

.playfield >>> .checkmate-judgement.show {
  opacity: 1;
  font-size: 3rem;
  font-weight: 500;
}
</style>
