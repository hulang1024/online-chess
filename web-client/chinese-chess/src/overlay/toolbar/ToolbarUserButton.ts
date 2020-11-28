import APIAccess from "../../online/api/APIAccess";
import SceneContext from "../../scene/SceneContext";

export default class ToolbarUserButton extends eui.Button {
    api: APIAccess;

    constructor(context: SceneContext) {
        super();
        this.width = 100;
        this.label = "登录";

        this.api = context.api;

        this.api.isLoggedIn.changed.add((isLoggedIn: boolean) => {
            this.label = isLoggedIn ? '已登录' : '登录';
        });
    }
}