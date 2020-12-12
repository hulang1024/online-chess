import SocketService from 'src/online/ws/SocketService';
import ChannelManager from 'src/online/chat/ChannelManager';
import ConfigManager from '../config/ConfigManager';
import APIAccess from '../online/api/APIAccess';

export const configManager = new ConfigManager();
export const api = new APIAccess(configManager);
export const socketService = new SocketService(api);
export const channelManager = new ChannelManager(api, socketService);
socketService.channelManager = channelManager;
