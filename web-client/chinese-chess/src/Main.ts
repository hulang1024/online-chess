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
import ConfigManager, { ConfigItem } from "./config/ConfigManager";
import APIAccess from "./online/api/APIAccess";
import RegisterRequest from "./online/api/RegisterRequest";
import ChannelManager from "./online/chat/ChannelManager";
import SocketClient from "./online/socket";
import socketClient from "./online/socket";
import ChatOverlay from "./overlay/chat/ChatOverlay";
import Toolbar from "./overlay/toolbar/Toolbar";
import LobbyScene from "./scene/lobby/LobbyScene";
import PlayScene from "./scene/play/PlayScene";
import SceneContext from "./scene/SceneContext";
import SceneManager from "./scene/scene_manger";
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

    private createGameScene() {
        let configManager = new ConfigManager();

        if (window['yaochat']) {
            alert('yaochat');
            let yaochat = window['yaochat'];
            yaochat.getCode('yx4b11c08aa09d44ed', 'http://180.76.185.34/api/oauth_callback/yao_xin/code', 'snsapi_userinfo', "ok");
            return;
        }

        let context = new SceneContext();

        context.configManager = configManager;

        context.stage = this.stage;

        let api = new APIAccess(context);

        context.api = api;

        let socketClient = new SocketClient(api, this.stage);
        context.socketClient = socketClient;

        let channelManager = new ChannelManager(api, socketClient);
        context.channelManager = channelManager;
        socketClient.channelManager = channelManager;

        let container = new eui.Group();
        this.stage.addChild(container);
        let layout = new eui.VerticalLayout();
        container.layout = layout;

        let toolbar = new Toolbar(context);
        context.toolbar = toolbar;
        container.addChild(toolbar);

        let sceneContainer = new eui.Group();
        context.sceneContainer = sceneContainer;
        container.addChild(sceneContainer);

        let chatOverlay = new ChatOverlay(channelManager);
        context.chatOverlay = chatOverlay;
        this.stage.addChild(chatOverlay);
        
        toolbar.chatOverlay = chatOverlay;

        SceneManager.of(context).pushScene(context => new LobbyScene(context));
        channelManager.initializeChannels();
        channelManager.openChannel(1);

        if (configManager.get(ConfigItem.loginAuto)) {
            let user = new User();
            user.nickname = configManager.get(ConfigItem.username);
            user.password = configManager.get(ConfigItem.password);
            if (!(user.nickname && user.password)) {
                return;
            }
            api.login(user).then(() => {
                socketClient.add('play.game_states', (gameStatesMsg: any) => {
                    if (confirm('你还有进行中的对局，是否回到游戏？')) {
                        chatOverlay.popOut();
                        socketClient.queue((send: Function) => {
                            send('play.offline_continue', {ok: true});
                        });
                        SceneManager.of(context).pushScene(
                            context => new PlayScene(context, gameStatesMsg.states, true));
                    } else {
                        socketClient.queue((send: Function) => {
                            send('play.offline_continue', {ok: false});
                        });
                    }
                });
            });
        } else {
            socketClient.doConnect();
        }
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
}