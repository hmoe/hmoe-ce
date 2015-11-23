/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50709
Source Host           : localhost:3306
Source Database       : hmoe_ce

Target Server Type    : MYSQL
Target Server Version : 50709
File Encoding         : 65001

Date: 2015-11-23 01:26:29
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for up
-- ----------------------------
DROP TABLE IF EXISTS `up`;
CREATE TABLE `up` (
  `mid` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `face` varchar(255) NOT NULL,
  `birthday` date DEFAULT NULL,
  `regtime` bigint(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `sign` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`mid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for up_history
-- ----------------------------
DROP TABLE IF EXISTS `up_history`;
CREATE TABLE `up_history` (
  `mid` int(11) NOT NULL,
  `ts` datetime NOT NULL,
  `coins` int(11) DEFAULT NULL,
  `rank` int(11) DEFAULT NULL,
  `fans` int(11) DEFAULT NULL,
  `friends` int(11) DEFAULT NULL,
  PRIMARY KEY (`mid`,`ts`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for video
-- ----------------------------
DROP TABLE IF EXISTS `video`;
CREATE TABLE `video` (
  `aid` int(11) NOT NULL,
  `mid` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `pic` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`aid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for video_history
-- ----------------------------
DROP TABLE IF EXISTS `video_history`;
CREATE TABLE `video_history` (
  `aid` int(11) NOT NULL,
  `ts` datetime NOT NULL,
  `play` int(11) DEFAULT NULL COMMENT '总站内外播放量',
  `review` int(11) DEFAULT NULL COMMENT '评论',
  `video_review` int(11) DEFAULT NULL COMMENT '弹幕',
  `favorites` int(11) DEFAULT NULL,
  `coins` int(11) DEFAULT NULL,
  `credit` int(11) DEFAULT NULL,
  PRIMARY KEY (`aid`,`ts`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for watch
-- ----------------------------
DROP TABLE IF EXISTS `watch`;
CREATE TABLE `watch` (
  `mid` int(11) NOT NULL,
  PRIMARY KEY (`mid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
