import Chess from '../rule/Chess';
import DrawableChess from './DrawableChess';
import { ChessboardBounds } from './ChineseChessDrawableChessboard';
import OutsideChessPlace from './OutsideChessPlace';
import './outside_chess_panel.scss';
import { chessClassToKey } from '../rule/chess_map';

export enum OutsideChessPanelType {
  local,
  other
}

export default class OutsideChessPanel {
  public readonly el = document.createElement('div');

  public type: OutsideChessPanelType;

  public chessPlaces: OutsideChessPlace[] = [];

  private flexDir: string;

  private chessboardBounds: ChessboardBounds;

  private radius: number;

  constructor(type: OutsideChessPanelType, chessboardBounds: ChessboardBounds, screen: any) {
    // eslint-disable-next-line
    this.flexDir = screen.xs ? 'row' : 'column';
    this.el.classList.add(
      'outside-chess-panel',
      type == OutsideChessPanelType.local ? 'local' : 'other',
      this.flexDir,
    );
    this.type = type;
    this.chessboardBounds = chessboardBounds;
    const radius = Math.round((this.chessboardBounds.chessRadius * 2.9) / 2);
    this.radius = radius;
    this.el.style[this.flexDir == 'row' ? 'height' : 'width'] = `${this.radius * 2}px`;
    const offset = this.flexDir == 'column'
      ? this.type == OutsideChessPanelType.local ? 'bottom' : 'top'
      : this.type == OutsideChessPanelType.local ? 'left' : 'right';
    this.el.style[offset] = `${-(radius / 2 - 4)}px`;
  }

  public addChess(chess: Chess) {
    const existsChessPlace = this.findPlaceByChess(chess);
    if (existsChessPlace) {
      existsChessPlace.incCount(1);
      return;
    }

    const drawableChess = new DrawableChess(chess, this.radius);
    const chessPlace = new OutsideChessPlace(drawableChess);
    this.addChessPlace(chessPlace);

    setTimeout(() => {
      if (!drawableChess.isFront()) {
        drawableChess.drawFront();
      }
      drawableChess.flipToFront();
    }, 300);
  }

  public removeChess(chess: Chess) {
    const existsChessPlace = this.findPlaceByChess(chess);
    if (!existsChessPlace) {
      return;
    }
    if (existsChessPlace.count > 1) {
      existsChessPlace.incCount(-1);
    } else {
      this.el.removeChild(existsChessPlace.el);
      this.chessPlaces = this.chessPlaces.filter((p) => p != existsChessPlace);
    }
  }

  public reset() {
    this.chessPlaces.forEach((p) => {
      this.el.removeChild(p.el);
    });
    this.chessPlaces = [];
  }

  public reloadChessPlaces(chessPlaces: OutsideChessPlace[]) {
    chessPlaces.forEach((p) => {
      const { el } = p;
      const gutter = this.flexDir == 'column'
        ? this.type != OutsideChessPanelType.local ? 'marginBottom' : 'marginTop'
        : this.type != OutsideChessPanelType.local ? 'marginLeft' : 'marginRight';
      el.style[gutter] = '';
      const offset = this.flexDir == 'column'
        ? this.type != OutsideChessPanelType.local ? 'left' : 'right'
        : this.type != OutsideChessPanelType.local ? 'top' : 'bottom';
      el.style[offset] = '';
      this.addChessPlace(p);
    });
  }

  private addChessPlace(chessPlace: OutsideChessPlace) {
    const { radius } = this;
    const gutter = this.flexDir == 'column'
      ? this.type == OutsideChessPanelType.local ? 'marginBottom' : 'marginTop'
      : this.type == OutsideChessPanelType.local ? 'marginLeft' : 'marginRight';
    chessPlace.el.style[gutter] = `${-(radius - this.chessboardBounds.chessGap)}px`;
    const offset = this.flexDir == 'column'
      ? this.type == OutsideChessPanelType.local ? 'left' : 'right'
      : this.type == OutsideChessPanelType.local ? 'top' : 'bottom';
    chessPlace.el.style[offset] = `${-(radius / 2 - 8)}px`;
    const topRight = radius / 2 - 4;
    chessPlace.counterEl.style.top = `${topRight}px`;
    chessPlace.counterEl.style.right = `${topRight}px`;
    this.el.appendChild(chessPlace.el);
    this.chessPlaces.push(chessPlace);
  }

  private findPlaceByChess(chess: Chess) {
    return this.chessPlaces.find(
      (p) => p.drawableChess.getHost() == chess.getHost()
        && chessClassToKey(p.drawableChess.chess) == chessClassToKey(chess),
    );
  }
}
