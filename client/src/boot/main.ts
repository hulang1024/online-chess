
import { boot } from 'quasar/wrappers';
import ConfigManager from '../config/ConfigManager';
import APIAccess from '../online/api/APIAccess';
import SocketService from 'src/online/ws/SocketService';
import ChannelManager from 'src/online/chat/ChannelManager';

let configManager = new ConfigManager();
let api = new APIAccess(configManager);
let socketService = new SocketService(api);

let channelManager =  new ChannelManager(api, socketService);
socketService.channelManager = channelManager;

export default boot(({ Vue }) => {
  Vue.prototype.configManager = configManager;
  Vue.prototype.api = api;
  Vue.prototype.socketService = socketService;
  Vue.prototype.channelManager = channelManager;
});