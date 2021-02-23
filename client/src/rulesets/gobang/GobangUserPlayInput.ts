import device from "current-device";
import GameState from "src/online/play/GameState";
import ChessPos from "src/rulesets/gobang/ChessPos";
import ChessHost from "src/rulesets/chess_host";
import Bindable from "src/utils/bindables/Bindable";
import { configManager } from "src/boot/main";
import { ConfigItem } from "src/config/ConfigManager";
import UserPlayInput from "../UserPlayInput";
import GameRule from "../GameRule";
import GobangGameplayServer from "./online/GobangGameplayServer";
import GobangDrawableChessboard from "./ui/GobangDrawableChessboard";
import GobangGameRule from "./GobangGameRule";
import ChessAction from "./ChessAction";
import MouseChessTarget from "./ui/MouseChessTarget";

export enum InputMode {
  /** 普通模式，只需点击一次  */
  NORMAL = 1,
  /** 此模式特别针对手机端可能屏幕太小可能会误触。用户需要点击两次相同位置才确定落子位置 */
  CONFIRM = 2
}

export default class GobangUserPlayInput extends UserPlayInput {
  public _mode: InputMode;

  public mouseChessTarget: MouseChessTarget;

  private chessboard: GobangDrawableChessboard;

  private gameplayServer = new GobangGameplayServer();

  private lastClickChessPos: ChessPos | null = null;

  constructor(
    gameRule: GameRule,
    gameState: Bindable<GameState>,
    localChessHost: Bindable<ChessHost | null>,
    isWatchingMode: boolean,
  ) {
    super(gameRule, gameState, localChessHost, isWatchingMode);

    this.chessboard = (gameRule as GobangGameRule).getChessboard();

    this.mouseChessTarget = new MouseChessTarget(this.chessboard);
    this.chessboard.canvas.addEventListener('mousemove', (event: MouseEvent) => {
      if (!this.enabled) {
        return;
      }
      const { offsetX, offsetY } = event;
      const { cellSize } = this.chessboard.sizes;
      const row = Math.round(offsetY / cellSize);
      const col = Math.round(offsetX / cellSize);
      this.mouseChessTarget.show(row, col);
      if (this.localChessHost.value) {
        this.gameplayServer.pushChessTargetPos(new ChessPos(row, col), this.localChessHost.value);
      }
    });

    if (isWatchingMode) {
      return;
    }

    this._mode = configManager.get(ConfigItem.gobangInputMode) as InputMode
      // eslint-disable-next-line
      || (device.mobile() ? InputMode.CONFIRM : InputMode.NORMAL);

    this.gameRule.activeChessHost.addAndRunOnce((activeChessHost) => {
      if (activeChessHost == this.localChessHost.value) {
        this.mouseChessTarget.setChess(this.localChessHost.value as ChessHost);
      }
    });

    this.chessboard.clicked.add(this.checkReject.bind(this));

    this.chessboard.onChessPosClick = this.onChessPosClick.bind(this);
  }

  public onChessPosClick(pos: ChessPos) {
    if (!this.enabled) {
      this.checkReject();
      return;
    }

    if (!(this.gameRule as GobangGameRule).chessboardState.isEmpty(pos)) {
      return;
    }

    if (this.mode == InputMode.CONFIRM) {
      if (!this.lastClickChessPos || !this.lastClickChessPos.equals(pos)) {
        this.lastClickChessPos = pos;
        this.mouseChessTarget.show(pos.row, pos.col);
        return;
      }
    }

    const action = new ChessAction();
    action.pos = pos;
    action.chess = this.localChessHost.value as ChessHost;
    (this.gameRule as GobangGameRule).onChessAction(action);
    this.gameplayServer.putChess(action.pos, action.chess);
    this.lastClickChessPos = null;
  }

  public get mode() {
    return this._mode;
  }

  public set mode(val: InputMode) {
    this._mode = val;
    configManager.set(ConfigItem.gobangInputMode, val);
    configManager.save();
    if (this._mode == InputMode.NORMAL) {
      this.mouseChessTarget.hide();
    }
  }

  public enable() {
    super.enable();
  }

  public disable() {
    super.disable();
    this.mouseChessTarget.hide();
  }
}
