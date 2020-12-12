import { ref } from "@vue/composition-api";
import { api, socketService } from "src/boot/main";
import APIAccess from "../api/APIAccess";
import SocketService from '../../online/ws/SocketService';
import CreateRoomRequest from "./CreateRoomRequest";
import GetRoomsRequest from "./GetRoomsRequest";
import Room from "./Room";
import {
  roomCreated, RoomCreatedMsg, roomRemoved, RoomRemovedMsg, roomUpdated, RoomUpdatedMsg,
} from "../ws/events/lobby";
import SearchRoomParams from "./SearchRoomParams";

export default class RoomManager {
  // 搜索到的房间
  public rooms = ref<Room[]>([]);

  // 是否正在搜索房间
  public roomsLoading = ref(true);

  private api: APIAccess;

  private socketService: SocketService;

  private lastSearchParams: SearchRoomParams | undefined;

  constructor() {
    this.api = api;
    this.socketService = socketService;

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
    roomCreated.add((msg: RoomCreatedMsg) => {
      this.rooms.value.push(msg.room);
    });

    roomUpdated.add((msg: RoomUpdatedMsg) => {
      if (msg.code != 0) {
        return;
      }
      Object.assign(this.getRoom(msg.room.id), msg.room);
    });

    roomRemoved.add((msg: RoomRemovedMsg) => {
      if (msg.code != 0) {
        return;
      }
      this.rooms.value = this.rooms.value.filter((room: Room) => room.id != msg.roomId);
    });

    this.socketService.reconnected.add(() => {
      this.searchRooms();
    });
  }

  private getRoom(id: number): Room {
    return this.rooms.value.filter((room: Room) => room.id == id)[0];
  }
}
