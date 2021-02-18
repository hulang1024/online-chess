import { socketService } from "src/boot/main";
import User from "src/user/User";
import Signal from "src/utils/signals/Signal";
import ServerMsg from "./ws/ServerMsg";

export const invitation = new Signal();
export const reply = new Signal();

socketService.addSignal('invitation.new', invitation);
socketService.addSignal('invitation.reply', reply);

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
