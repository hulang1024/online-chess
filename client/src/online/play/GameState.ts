enum GameState {
  // 准备开始
  READY = 1,

  // 对局进行中
  PLAYING = 2,

  // 暂停中，用户已离线会是此状态,
  PAUSE = 3,

  // 结束，一局结束
  END = 4
}

export default GameState;
