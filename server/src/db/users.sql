
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nickname` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '昵称',
  `gender` tinyint(4) DEFAULT NULL COMMENT '0=女,1=男',
  `avatar_url` varchar(256) DEFAULT NULL COMMENT '头像',
  `password` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码',
  `is_admin` tinyint(1) DEFAULT '0',
  `register_time` datetime NOT NULL COMMENT '注册时间',
  `source` tinyint(4) NOT NULL DEFAULT '0' COMMENT '用户来源，0=本平台，1=爻信',
  `open_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'OpenID',
  `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nickname` (`nickname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

