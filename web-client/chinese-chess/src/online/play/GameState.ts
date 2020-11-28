enum GameState {
    READY = 1,   // 准备开始
    PLAYING = 2, // 对局进行中
    PAUSE = 3,   // 暂停中，用户已离线会是此状态
}

export default GameState;