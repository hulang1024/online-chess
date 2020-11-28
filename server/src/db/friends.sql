
DROP TABLE IF EXISTS `friends`;
CREATE TABLE `friends` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '用户id',
  `friend_user_id` int(11) NOT NULL COMMENT '朋友用户id',
  `is_mutual` tinyint(4) NOT NULL DEFAULT '0' COMMENT '是否互为好友',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique` (`user_id`,`friend_user_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
