export default interface ChessboardThemeSet {
  [theme: string]: {
    name: string,
    centerTextColor?: string,
    lineColor?: string,
  }
}
