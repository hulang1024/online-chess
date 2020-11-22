//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

import SOUND from "./audio/SOUND";
import messager from "./component/messager";
import APIAccess from "./online/api/APIAccess";
import RegisterRequest from "./online/api/RegisterRequest";
import ChannelManager from "./online/chat/ChannelManager";
import SocketClient from "./online/socket";
import socketClient from "./online/socket";
import ChatOverlay from "./overlay/chat/ChatOverlay";
import LobbyScene from "./scene/lobby/LobbyScene";
import SceneContext from "./scene/SceneContext";
import SceneManager from "./scene/scene_manger";
import WelcomeScene from "./scene/welcome/WelcomeScene";
import User from "./user/User";

class Main extends eui.UILayer  {
    public constructor() {
        super();
    }

    protected createChildren() {
        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin
            context.onUpdate = () => {

            }
        })

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        this.runGame().catch(e => {
            console.log(e);
        })
        //注入自定义的素材解析器
        let assetAdapter = new AssetAdapter();
        egret.registerImplementation("eui.IAssetAdapter", assetAdapter);
        egret.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());
    }

    private async runGame() {
        switch (egret.Capabilities.os) {
            case 'iOS':
            case 'Android':
            case 'Windows Phone':
                this.stage.scaleMode = egret.StageScaleMode.FIXED_WIDTH;
                break;
            default:
                this.stage.scaleMode = egret.StageScaleMode.FIXED_HEIGHT;
        }

        await this.loadResource()
        await RES.getResAsync("description_json");
        this.createGameScene();
    }

    private async loadResource() {
        try {
            let loadingDiv = document.getElementById('loading');
            loadingDiv.parentElement.removeChild(loadingDiv);
            const loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            await RES.loadConfig("resource/default.res.json", "resource/");
            await RES.loadGroup("preload", 0, loadingView);
            await this.loadTheme();
            await SOUND.loadAll();
            this.stage.removeChild(loadingView);
        }
        catch (e) {
            console.error(e);
        }
    }

    private loadTheme() {
        return new Promise((resolve, reject) => {
            // load skin theme configuration file, you can manually modify the file. And replace the default skin.
            //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
            let theme = new eui.Theme("resource/default.thm.json", this.stage);
            theme.addEventListener(eui.UIEvent.COMPLETE, () => {
                resolve();
            }, this);

        })
    }

    private createGameScene() {
        if (window['yaochat']) {
            alert('yaochat');
            let yaochat = window['yaochat'];
            yaochat.getCode('yx4b11c08aa09d44ed', 'http://180.76.185.34/api/oauth_callback/yao_xin/code', 'snsapi_userinfo', "ok");
            return;
        }

        let api = new APIAccess();
        let socketClient = new SocketClient(api, this.stage);
        let channelManager = new ChannelManager(api, socketClient);
        socketClient.channelManager = channelManager;

        // 布局
        let layout = new eui.VerticalLayout();
        let group = new eui.Group();
        group.layout = layout;
        this.stage.addChild(group);

        // 场景容器
        let sceneContainer = new eui.UILayer();
        group.addChild(sceneContainer);

        let chatOverlay = new ChatOverlay(channelManager);
        this.stage.addChild(chatOverlay);

        let context = new SceneContext(this.stage, sceneContainer);
        context.chatOverlay = chatOverlay;
        context.channelManager = channelManager;
        context.api = api;
        context.socketClient = socketClient;
        SceneManager.of(context).pushScene(context => new WelcomeScene(context));
    }
}