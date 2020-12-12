export default interface APIPageResponse<T> {
  total: number;
  records: T[];
}
