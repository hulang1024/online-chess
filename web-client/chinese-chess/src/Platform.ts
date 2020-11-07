import socketClient from "./online/socket";
import RoomPlayer from "./scene/lobby/RoomPlayer";

/** 
 * 平台数据接口。
 * 由于每款游戏通常需要发布到多个平台上，所以提取出一个统一的接口用于开发者获取平台数据信息
 * 推荐开发者通过这种方式封装平台逻辑，以保证整体结构的稳定
 * 由于不同平台的接口形式各有不同，白鹭推荐开发者将所有接口封装为基于 Promise 的异步形式
 */
interface Platform {

    getUserInfo(): any;

    setUserInfo(any): Promise<void>

}

class DebugPlatform implements Platform {
    user: RoomPlayer;
    getUserInfo() {
        return this.user;
    }
    async setUserInfo(user: any) {
        this.user = user;
    }
}

let platform: Platform = new DebugPlatform();

export default platform;





