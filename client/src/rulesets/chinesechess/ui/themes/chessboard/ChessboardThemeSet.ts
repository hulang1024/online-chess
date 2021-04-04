export default interface ChessboardThemeSet {
  [theme: string]: {
    name: string,
    lineColor: string,
    centerTextColor?: string,
  }
}
