import ChessPosition from './ChessPosition';

interface Chess {
  pos: () => ChessPosition;
  host: () => number
}