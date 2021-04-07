<template>
  <div>
    <p class="text-h6">棋子状态提示</p>
    <p>棋子状态提示只做两层简单的判断：</p>
    <ul class="chess-status-tip">
      <li>
        <div class="status-circle danger"></div>
        表示<b>本方</b>危险棋子，存在有可以吃掉它的<b>对方</b>棋子，且吃掉后<b>本方</b>无棋子去兑子。
      </li>
      <li>
        <div class="status-circle eatable"></div>
        表示<b>对方</b>危险棋子，存在有可以吃掉它的<b>本方</b>棋子，且吃掉后<b>对方</b>无棋子去兑子。
      </li>
    </ul>
    <p class="text-h6">可走位置提示</p>
    <p>提示哪些位置走法规则上允许，并且如果走到该位置：</p>
    <ul class="go-point-tip">
      <li><div class="go-point allow"></div>不存在可以安全吃掉该位置棋子的对方棋子。</li>
      <li><div class="go-point danger"></div>表示是危险的，与上面一种情况相反。</li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
p {
  margin-bottom: 8px;
}
ul {
  margin-top: -4px;
  padding: 0px 16px;
  list-style-type: none;
}

.chess-status-tip {
  .status-circle {
    display: inline-block;
    margin-right: 4px;
    width: 20px;
    height: 20px;
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
    width: 20px;
    height: 20px;
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
