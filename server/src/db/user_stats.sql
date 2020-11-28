
DROP TABLE IF EXISTS `user_stats`;
CREATE TABLE `user_stats` (
  `user_id` int(11) NOT NULL,
  `play_count` int(11) DEFAULT '0',
  `win_count` int(11) DEFAULT '0',
  `lose_count` int(11) DEFAULT '0',
  `draw_count` int(11) DEFAULT '0',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
