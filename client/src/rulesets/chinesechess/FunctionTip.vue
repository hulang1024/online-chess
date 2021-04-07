<template>
  <div>
    <p class="text-h6">棋子状态提示</p>
    <p>不判断棋子价值，只做简单的判断提示：</p>
    <ul class="chess-status-tip">
      <li>
        <div class="status-circle danger" />
        表示<b>可能会被吃掉的</b>本方棋子，吃掉后本方无棋子去兑子。
      </li>
      <li>
        <div class="status-circle eatable" />
        表示<b>可以安全吃掉的</b>对方棋子，吃掉后对方无棋子来兑子。
      </li>
    </ul>
    <p class="text-h6">可走位置提示</p>
    <p>提示哪些位置走法规则上允许，并且如果走到该位置：</p>
    <ul class="go-point-tip">
      <li><div class="go-point allow" />表示是<b>安全的</b>：无对方棋子可以吃掉该位置棋子。</li>
      <li><div class="go-point danger" />表示是<b>危险的</b>：有对方棋子可以吃掉该位置棋子。</li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
p {
  margin-bottom: 8px;
}
ul {
  margin-top: -4px;
  padding: 0px 12px;
  list-style-type: none;
}

.chess-status-tip {
  .status-circle {
    display: inline-block;
    margin-right: 4px;
    width: 16px;
    height: 16px;
    border-radius: 100%;
    border: 2px solid;
    &.danger {
      border-color: rgb(248, 0, 0, 1);
    }

    &.eatable {
      border-color: rgb(0, 190, 0, 1);
    }
  }
}

.go-point-tip {
  .go-point {
    display: inline-block;
    margin-right: 4px;
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.4);

    &.allow {
      background: rgba(0, 210, 0, 0.3);
    }

    &.danger {
      background: rgba(255, 0, 0, 0.3);
    }
  }
}
</style>
