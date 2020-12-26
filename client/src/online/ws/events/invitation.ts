import User from "src/user/User";
import Signal from "src/utils/signals/Signal";
import ServerMsg from "../ServerMsg";

export const invitation = new Signal();
export const reply = new Signal();

export interface InvitationServerMsg extends ServerMsg {
  invitation: {
    id: number;
    inviter: User;
    subject: string;
  }
}

export interface InvitationReplyServerMsg extends ServerMsg {
  reply: {
    invitee: User;
    accept: boolean;
  }
}
