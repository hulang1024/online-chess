import { ref } from "@vue/composition-api";
import { api, socketService } from "src/boot/main";
import APIAccess from "../api/APIAccess";
import CreateRoomRequest from "./CreateRoomRequest";
import GetRoomsRequest from "./GetRoomsRequest";
import Room from "./Room";
import {
  RoomCreatedMsg, RoomRemovedMsg, RoomUpdatedMsg,
} from "./room_server_messages";
import SearchRoomParams from "./SearchRoomParams";

export default class RoomManager {
  // 搜索到的房间
  public rooms = ref<Room[]>([]);

  // 是否正在搜索房间
  public roomsLoading = ref(true);

  private api: APIAccess;

  private lastSearchParams: SearchRoomParams | undefined;

  constructor() {
    this.api = api;

    this.initSocketListeners();
  }

  public searchRooms(searchParams?: SearchRoomParams): void {
    const req = new GetRoomsRequest(searchParams || this.lastSearchParams);
    req.loading = this.roomsLoading;
    req.success = (resRooms) => {
      this.rooms.value = [];
      (resRooms as unknown as Room[]).forEach((resRoom: Room) => {
        this.rooms.value.push(resRoom);
      });
    };
    this.api.queue(req);
    this.lastSearchParams = searchParams;
  }

  public createRoom(room: Room): CreateRoomRequest {
    const req = new CreateRoomRequest(room);
    this.api.queue(req);
    return req;
  }

  private initSocketListeners() {
    socketService.on('lobby.room_create', (msg: RoomCreatedMsg) => {
      this.rooms.value.push(msg.room);
      this.rooms.value = this.rooms.value.filter((room) => {
        let ret = true;
        if (this.lastSearchParams?.gameType) {
          ret = ret && this.lastSearchParams.gameType == room.gameType;
        }
        if (this.lastSearchParams?.status) {
          ret = ret && this.lastSearchParams.status == room.status;
        }
        return ret;
      });
    });

    socketService.on('lobby.room_update', (msg: RoomUpdatedMsg) => {
      if (msg.code != 0) {
        return;
      }

      const i = this.rooms.value.findIndex((room: Room) => room.id == msg.room.id);
      Object.assign(this.rooms.value[i], msg.room);
    });

    socketService.on('lobby.room_remove', (msg: RoomRemovedMsg) => {
      if (msg.code != 0) {
        return;
      }
      this.rooms.value = this.rooms.value.filter((room: Room) => room.id != msg.roomId);
    });

    socketService.disconnect.add(this.onDisconnect, this);
  }

  public removeListeners() {
    ['lobby.room_create', 'lobby.room_update', 'lobby.room_remove'].forEach((event) => {
      socketService.off(event);
    });
    socketService.disconnect.remove(this.onDisconnect, this);
    this.rooms.value = [];
  }

  private onDisconnect() {
    this.roomsLoading.value = true;
  }
}
