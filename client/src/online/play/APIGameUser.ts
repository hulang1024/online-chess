import User from "src/user/User";

export default interface APIGameUser {
  user: User | null;

  status: number;

  online: boolean;

  ready: boolean;

  chess: number;

  roomOwner: boolean;
}
