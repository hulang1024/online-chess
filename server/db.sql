SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for friends
-- ----------------------------
DROP TABLE IF EXISTS `friends`;
CREATE TABLE `friends` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT 'id',
  `friend_user_id` int NOT NULL COMMENT 'id',
  `is_mutual` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique` (`user_id`,`friend_user_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ip_ban
-- ----------------------------
DROP TABLE IF EXISTS `ip_ban`;
CREATE TABLE `ip_ban` (
  `ip` varchar(15) NOT NULL,
  `user_id` bigint NOT NULL,
  `create_at` datetime NOT NULL,
  PRIMARY KEY (`ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for user_stats
-- ----------------------------
DROP TABLE IF EXISTS `user_stats`;
CREATE TABLE `user_stats` (
  `user_id` int NOT NULL,
  `game_type` tinyint NOT NULL,
  `play_count` int DEFAULT '0',
  `win_count` int DEFAULT '0',
  `lose_count` int DEFAULT '0',
  `draw_count` int DEFAULT '0',
  PRIMARY KEY (`user_id`,`game_type`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nickname` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `gender` tinyint DEFAULT NULL COMMENT '0=,1=',
  `avatar_url` varchar(256) DEFAULT NULL,
  `email` varchar(127) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `password` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  `register_time` datetime NOT NULL,
  `source` tinyint NOT NULL DEFAULT '0' COMMENT '0=1=GitHub2=',
  `open_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'OpenID',
  `last_active_time` datetime DEFAULT NULL,
  `last_login_time` datetime DEFAULT NULL,
  `play_game_type` tinyint DEFAULT NULL,
  `user_ip` varchar(15) DEFAULT NULL COMMENT 'IP',
  `user_type` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nickname` (`nickname`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
