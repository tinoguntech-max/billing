/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: billing_internet
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `karyawan`
--

DROP TABLE IF EXISTS `karyawan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `karyawan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','bendahara','karyawan') DEFAULT 'karyawan',
  `telepon` varchar(20) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `aktif` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `gaji` decimal(15,0) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `karyawan`
--

LOCK TABLES `karyawan` WRITE;
/*!40000 ALTER TABLE `karyawan` DISABLE KEYS */;
INSERT INTO `karyawan` VALUES
(1,'Tino','admin@tam.net','$2b$10$7wEydIVv.oJocs55iHsqeeJMbDR5YS/qgIroGsVslPqPXeKgsw8C2','admin','08986355829','Serut Tapan Kedungwaru Tulungagung',NULL,1,'2026-03-18 07:49:04',0),
(2,'Tiko','tiko@tam.net','$2b$10$c8NnqipsKImf3ty3TIivV.QjjPYf6J4UgI7bjriSzbQ29NOQ3q4JK','bendahara','082332323345','Serut Tapan Kedungwaru Tulungagung',NULL,1,'2026-03-18 07:49:04',1500000),
(3,'Pardan','pardan@tam.net','$2b$10$2zGUnKQ/dc9e9pWNCFTkKux4vl7XgFO8NjxJX1KWTUYU7hYzLlLMq','karyawan','098989898787878','Plandaan Kedungwaru Tulungagung',NULL,1,'2026-03-18 07:49:04',800000),
(4,'Mas Pras','pras@tam.net','$2b$10$7Aaq5sB4Tw9Xa24olVeCmOcC7ctpcSjlptIOZspJ4AU79.965kSxO','karyawan','0898989787878432','Serut Tapan Kedungwaru Tulungagung',NULL,1,'2026-03-18 14:41:30',800000);
/*!40000 ALTER TABLE `karyawan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paket`
--

DROP TABLE IF EXISTS `paket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `paket` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_paket` varchar(100) NOT NULL,
  `kecepatan` int(11) NOT NULL COMMENT 'Mbps',
  `harga` decimal(12,0) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paket`
--

LOCK TABLES `paket` WRITE;
/*!40000 ALTER TABLE `paket` DISABLE KEYS */;
INSERT INTO `paket` VALUES
(1,'Paket Starter 15M',15,110000,'Cocok untuk 1-2 perangkat rumahan','2026-03-18 00:33:28'),
(2,'Paket Keluarga 25M',25,145000,'Streaming & browsing seluruh keluarga','2026-03-18 00:33:28'),
(3,'Paket Rumahan 35M',35,175000,'Gaming & kerja dari rumah','2026-03-18 00:33:28'),
(4,'Paket Bisnis 65M',65,195000,'Performa maksimal untuk bisnis','2026-03-18 00:33:28');
/*!40000 ALTER TABLE `paket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pelanggan`
--

DROP TABLE IF EXISTS `pelanggan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pelanggan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telepon` varchar(20) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `ip_address` varchar(20) DEFAULT NULL,
  `id_paket` int(11) DEFAULT NULL,
  `status` enum('Aktif','Nonaktif','Trial') DEFAULT 'Aktif',
  `tgl_bergabung` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `pppoe_username` varchar(100) DEFAULT NULL,
  `pppoe_password` varchar(100) DEFAULT NULL,
  `mikrotik_id` varchar(50) DEFAULT NULL,
  `status_online` varchar(20) DEFAULT NULL,
  `last_online_check` datetime DEFAULT NULL,
  `offline_notified` tinyint(1) DEFAULT 0,
  `offline_since` datetime DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pel_status` (`status`),
  KEY `idx_pel_id_paket` (`id_paket`),
  KEY `idx_pel_nama` (`nama`),
  CONSTRAINT `pelanggan_ibfk_1` FOREIGN KEY (`id_paket`) REFERENCES `paket` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pelanggan`
--

LOCK TABLES `pelanggan` WRITE;
/*!40000 ALTER TABLE `pelanggan` DISABLE KEYS */;
INSERT INTO `pelanggan` VALUES
(8,'karjito-donorejo','','085704857720','DS.tapan dsn.donorejo','192.168.14.200',1,'Aktif','2025-12-20','2026-03-19 03:00:41','karjito-donorejo','qwerty','*2','Online','2026-05-16 06:37:52',0,NULL,-8.02907958,111.92142905),
(9,'sumarti-donorejo','','085235224533','DS.tapan dsn.donorejo','192.168.14.241',1,'Aktif','2025-12-19','2026-03-19 03:00:41','sumarti-donorejo','qwerty','*3','Online','2026-05-16 06:37:52',0,NULL,-8.02909673,111.92127751),
(10,'wartini-donorejo','','081233628355','DS.tapan dsn.donorejo','192.168.14.189',1,'Aktif','2025-12-19','2026-03-19 03:00:41','wartini-donorejo','qwerty','*4','Online','2026-05-16 06:37:52',0,NULL,-8.02907281,111.92138254),
(11,'rifky-donorejo','','087859110125','DS.tapan dsn.donorejo','192.168.14.226',1,'Aktif','2025-12-20','2026-03-19 03:00:41','rifky-donorejo','qwerty','*6','Online','2026-05-16 06:37:52',0,NULL,-8.02773710,111.92258920),
(12,'sundari-donorejo','','0895635405624','DS Tapan dsn.donorejo','192.168.14.199',1,'Aktif','2025-12-19','2026-03-19 03:00:41','sundari-donorejo','qwerty','*7','Online','2026-05-16 06:37:52',0,NULL,-8.02804199,111.92210290),
(13,'ikodewanto-donorejo','','085755110810','DS.tapan dsn.donorejo','',1,'Aktif','2026-01-20','2026-03-19 03:00:41','ikodewanto-donorejo','qwerty','*9','Offline','2026-05-16 06:37:52',1,'2026-05-14 18:27:52',-8.02915665,111.92071609),
(14,'adit-donorejo','','085330308103','Donorejo Tapan Kedungwaru Tulungagung','192.168.14.213',1,'Aktif','2026-03-16','2026-03-19 03:00:41','adit-donorejo','qwerty','*A','Online','2026-05-16 06:37:52',0,NULL,-8.02703087,111.92253097),
(15,'roni-donorejo','','081235808018','DS.tapan dsn.donorejo','192.168.14.191',1,'Aktif','2025-12-19','2026-03-19 03:00:41','roni-donorejo','qwerty','*B','Online','2026-05-16 06:37:52',0,NULL,-8.02883967,111.92290395),
(16,'agus-donorejo','','082333245894','DS.tapan dsn.donoreko','192.168.14.221',1,'Aktif','2025-12-06','2026-03-19 03:00:41','agus-donorejo','qwerty','*C','Online','2026-05-16 06:37:52',0,NULL,-8.03196419,111.91830167),
(17,'lucky-donorejo','','081231669238','DS.tapan dsn.donorejo','192.168.14.251',1,'Aktif','2025-12-20','2026-03-19 03:00:41','lucky-donorejo','qwerty','*D','Online','2026-05-16 06:37:52',0,NULL,-8.02848375,111.92303391),
(18,'eka-donorejo','','081615649731','DS.tapan dsn.donorejo','192.168.14.188',1,'Aktif','2025-12-20','2026-03-19 03:00:41','eka-donorejo','qwerty','*E','Online','2026-05-16 06:37:52',0,NULL,-8.02838533,111.92306839),
(19,'oky-donorejo','','082282822012','DS.tapan dsn.donorejo','192.168.14.236',1,'Aktif','2025-12-06','2026-03-19 03:00:41','oky-donorejo','qwerty','*F','Online','2026-05-16 06:37:52',0,NULL,-8.03178128,111.91864717),
(20,'koko-serut','','081335957785','DS.tapan dsn.serut','192.168.14.234',1,'Aktif','2025-12-20','2026-03-19 03:00:41','koko-serut','qwerty','*11','Online','2026-05-16 06:37:52',0,NULL,-8.02578263,111.92325391),
(21,'yitno-serut','','081234722670','DS Tapan dsn.serut','192.168.14.214',1,'Aktif','2026-01-19','2026-03-19 03:00:41','yitno-serut','qwerty','*12','Online','2026-05-16 06:37:52',0,NULL,-8.02571505,111.92308797),
(22,'ayu-serut','','085806531059','DS Tapan dsn.serut','192.168.14.218',1,'Aktif','2026-01-20','2026-03-19 03:00:41','ayu-serut','qwerty','*13','Online','2026-05-16 06:37:52',0,NULL,-8.02579185,111.92305941),
(23,'ririn-donorejo','','081219156768','DS Tapan dsn.donorejo','192.168.14.235',1,'Aktif','2026-01-19','2026-03-19 03:00:41','ririn-donorejo','qwerty','*16','Online','2026-05-16 06:37:52',0,NULL,-8.02667414,111.92142499),
(24,'bima-donorejo','','081775127217','DS Tapan dsn.donorejo','192.168.14.217',1,'Aktif','2026-01-24','2026-03-19 03:00:41','bima-donorejo','qwerty','*17','Online','2026-05-16 06:37:52',0,NULL,-8.02760530,111.92231562),
(25,'heru-serut','','081231503813','DS.tapan dsn.serut081231503813','192.168.14.231',1,'Aktif','2026-01-25','2026-03-19 03:00:41','heru-serut','qwerty','*18','Online','2026-05-16 06:37:52',0,NULL,-8.02609688,111.92275468),
(26,'ulik-serut','','080000','DS.tapan dsn.seru','192.168.14.193',1,'Aktif','2026-01-24','2026-03-19 03:00:41','ulik-serut','qwerty','*19','Online','2026-05-16 06:37:52',0,NULL,-8.02609100,111.92267918),
(27,'marno-donorejo','','-','DS.tapan dsn.donorejo','192.168.14.190',1,'Aktif','2025-12-31','2026-03-19 03:00:41','marno-donorejo','qwerty','*1A','Online','2026-05-16 06:37:52',0,NULL,-8.02674850,111.92290509),
(28,'noko-donorejo','','081233529499','DS.tapan dsn.donorejo','192.168.14.228',1,'Aktif','2026-01-01','2026-03-19 03:00:41','noko-donorejo','qwerty','*1B','Online','2026-05-16 06:37:52',0,NULL,-8.02854040,111.92237166),
(30,'rembo-donorejo','','085706585895','DS.tapan dsn.donorejo','192.168.14.197',1,'Aktif','2025-12-31','2026-03-19 03:00:41','rembo-donorejo','qwerty','*1D','Online','2026-05-16 06:37:52',0,NULL,-8.02910359,111.92194198),
(31,'retno-donorejo','','085790248589','DS.taoan dsn.donorejo','192.168.14.220',1,'Aktif','2026-01-03','2026-03-19 03:00:41','retno-donorejo','qwerty','*1E','Online','2026-05-16 06:37:52',0,NULL,-8.03071484,111.92244956),
(32,'doni-serut','','085829315569','DS.tapan dsn.serut','192.168.14.207',1,'Aktif','2026-02-27','2026-03-19 03:00:41','doni-serut','qwerty','*1F','Online','2026-05-16 06:37:52',0,NULL,-8.02374063,111.92246821),
(33,'halimah-donorejo','','085735588885','DS.tapan dsn.donorejo','192.168.14.216',1,'Aktif','2025-12-31','2026-03-19 03:00:41','halimah-donorejo','qwerty','*20','Online','2026-05-16 06:37:52',0,NULL,-8.03055065,111.92195942),
(34,'sindy-donorejo','','085852800341','DS.Tapan dsn.donorejo','192.168.14.225',1,'Aktif','2025-12-31','2026-03-19 03:00:41','sindy-donorejo','qwerty','*21','Online','2026-05-16 06:37:52',0,NULL,-8.03053154,111.92203813),
(36,'doni-donorejo','','082140023976','DS.tapan dsn.donorejo','192.168.14.224',1,'Aktif','2025-12-31','2026-03-19 03:00:42','doni-donorejo','qwerty','*24','Online','2026-05-16 06:37:52',0,NULL,-8.03076251,111.92234383),
(37,'pakdi-donorejo','','081249143430','Ds.tapan dsn.donorejo','192.168.14.222',1,'Aktif','2026-01-01','2026-03-19 03:00:42','pakdi-donorejo','qwerty','*26','Online','2026-05-16 06:37:52',0,NULL,-8.02906848,111.92381066),
(38,'koirul-donorejo','','085707340557','Ds.tapan dsn serut','192.168.14.187',1,'Aktif','2026-01-02','2026-03-19 03:00:42','koirul-donorejo','qwerty','*27','Online','2026-05-16 06:37:52',0,NULL,-8.03049619,111.92356417),
(39,'fani-serut','','081333370550','Ds.tapan dsn.serut','192.168.14.232',2,'Aktif','2026-01-02','2026-03-19 03:00:42','fani-serut','qwerty','*28','Online','2026-05-16 06:37:52',0,NULL,-8.02338525,111.92628779),
(40,'sunar-donorejo','','0895808065030','Ds.tapan dsn.serut','192.168.14.208',1,'Aktif','2026-01-04','2026-03-19 03:00:42','sunar-donorejo','qwerty','*29','Online','2026-05-16 06:37:52',0,NULL,-8.02816090,111.92249198),
(41,'elsa-donorejo','','085215893150','Da.tapan dsn.serut','192.168.14.211',1,'Aktif','2026-01-06','2026-03-19 03:00:42','elsa-donorejo','qwerty','*2A','Online','2026-05-16 06:37:52',0,NULL,-8.02813723,111.92265237),
(42,'woro-donorejo','','082138336571','DS.tapan dsn.donorejo','192.168.14.237',4,'Aktif','2026-01-06','2026-03-19 03:00:42','woro-donorejo','qwerty','*2B','Online','2026-05-16 06:37:52',0,NULL,-8.02830613,111.92258112),
(43,'angga-donorejo','','085708260649','DS Tapan dsn.donorejo','192.168.14.223',1,'Aktif','2026-01-14','2026-03-19 03:00:42','angga-donorejo','qwerty','*2C','Online','2026-05-16 06:37:52',0,NULL,-8.02858338,111.92210230),
(44,'tino-l2tp','','08986355829','','',NULL,'Aktif','2026-03-18','2026-03-19 03:00:42','tino-l2tp','tinocaem','*2E','Offline','2026-05-16 06:37:52',0,NULL,NULL,NULL),
(45,'suyoto-donorejo','','085649177378','DS Tapan dsn.donorejo','192.168.14.203',1,'Aktif','2026-01-19','2026-03-19 03:00:42','suyoto-donorejo','qwerty','*2F','Online','2026-05-16 06:37:52',0,NULL,-8.02893644,111.92215583),
(46,'jose-donorejo','','085606583465','DS Tapan dsn.donorejo','192.168.14.244',1,'Aktif','2026-01-21','2026-03-19 03:00:42','jose-donorejo','qwerty','*30','Online','2026-05-16 06:37:52',0,NULL,-8.02889824,111.92208531),
(47,'bangkit-donorejo','','081335962651','DS.tapan dsn.donorejo','192.168.14.242',1,'Aktif','2026-01-22','2026-03-19 03:00:42','bangkit-donorejo','qwerty','*31','Online','2026-05-16 06:37:52',0,NULL,-8.02854155,111.92213193),
(48,'rio-donorejo','','0895985316206','DS.tapan dsn.donorejo','192.168.14.230',1,'Aktif','2026-01-22','2026-03-19 03:00:42','rio-donorejo','qwerty','*32','Online','2026-05-16 06:37:52',0,NULL,-8.02849556,111.92212843),
(49,'wira-serut','','081252394492','DS.tapan dsn.serut','',1,'Aktif','2026-02-01','2026-03-19 03:00:42','wira-serut','qwerty','*33','Online','2026-05-16 06:37:52',0,NULL,-8.02652106,111.92448958),
(50,'bayu-donorejo','','088991345286','DS.tapan dsn.donorejo','192.168.14.250',1,'Aktif','2026-02-02','2026-03-19 03:00:42','bayu-donorejo','qwerty','*34','Online','2026-05-16 06:37:52',0,NULL,-8.03221938,111.91829595),
(51,'malik-donorejo','','085274431967','DS.tapan dsn.donorejo','192.168.14.210',1,'Aktif','2026-02-24','2026-03-19 03:00:42','malik-donorejo','qwerty','*35','Online','2026-05-16 06:37:52',0,NULL,-8.02787425,111.92199730),
(52,'silvi-rejoagung',NULL,'-',NULL,'',NULL,'Aktif','2026-03-19','2026-03-19 03:00:42','silvi-rejoagung','qwerty','*37','Offline','2026-05-16 06:37:52',0,NULL,NULL,NULL),
(54,'daat-serut','','082232425411','DS Tapan dsn.serut','192.168.14.201',1,'Aktif','2026-02-12','2026-03-19 03:00:42','daat-serut','qwerty','*39','Online','2026-05-16 06:37:52',0,NULL,-8.02509562,111.92523258),
(56,'anjani-donorejo','','0895627884856','DS Tapan dsn.donorejo','192.168.14.196',1,'Aktif','2026-02-16','2026-03-19 03:00:42','anjani-donorejo','qwerty','*3B','Online','2026-05-16 06:37:52',0,NULL,-8.03214894,111.91815230),
(57,'spensakandat',NULL,'-',NULL,'192.167.100.2',NULL,'Aktif','2026-03-19','2026-03-19 03:00:42','spensakandat','kandat','*3C','Online','2026-05-16 06:37:52',0,NULL,NULL,NULL),
(58,'fardan-remote',NULL,'-',NULL,'10.10.10.2',NULL,'Aktif','2026-03-19','2026-03-19 03:00:42','fardan-remote','123','*41','Offline','2026-05-16 06:37:52',1,'2026-05-05 09:15:46',NULL,NULL),
(59,'erik-donorejo','','081515799232','DS.tapan dsn.donorejo','192.168.14.247',4,'Aktif','2026-02-15','2026-03-19 03:00:42','erik-donorejo','qwerty','*42','Online','2026-05-16 06:37:52',0,NULL,-8.02575438,111.92072619),
(60,'kemenhaj-tulungagung','','085649819752','DS rejoagung','192.168.14.245',4,'Aktif','2026-01-18','2026-03-19 03:00:42','kemenag-tulungagung','qwerty','*43','Online','2026-05-16 06:37:52',0,NULL,-8.04493870,111.91187879),
(61,'sapii-donorejo','','085265641413','DS.tapan dsn.donorejo','192.168.14.204',1,'Aktif','2026-04-27','2026-03-19 03:00:42','sapii-donorejo','qwerty','*44','Online','2026-05-16 06:37:52',0,NULL,-8.03200903,111.91800329),
(62,'devi-serut','','081330388522','DS.tapan dsn.serut','192.168.14.227',1,'Aktif','2026-04-27','2026-03-19 03:00:42','devi-serut','qwerty','*45','Online','2026-05-16 06:37:52',0,NULL,-8.02588532,111.92326155),
(63,'adi-serut','','085732593605','DS.tapan dsn.donorejo','192.168.14.239',1,'Aktif','2026-03-14','2026-03-19 03:00:42','adi-serut','qwerty','*46','Online','2026-05-16 06:37:52',0,NULL,-8.02535540,111.92318470),
(64,'ridwan-donorejo','','085859820481','DS Tapan dsn.donorejo','192.168.14.254',1,'Aktif','2026-04-04','2026-03-19 03:00:42','ridwan-donorejo','qwerty','*47','Online','2026-05-16 06:37:52',0,NULL,-8.02966832,111.92197202),
(66,'afan-donorejo','','081334462306','DS.tapan dsn.donorejo','192.168.14.252',1,'Aktif','2026-03-05','2026-03-19 03:00:42','afan-donorejo','qwerty','*4B','Online','2026-05-16 06:37:52',0,NULL,-8.03174074,111.92275077),
(67,'gito-donorejo','','081335243982','DS Tapan dsn.donorejo','192.168.14.246',1,'Aktif','2026-03-01','2026-03-19 03:00:42','gito-donorejo','qwerty','*4C','Online','2026-05-16 06:37:52',0,NULL,-8.03030648,111.92178669),
(68,'wahyu-donorejo','','085852698628','DS.tapan dsn.donorejo','192.168.14.248',1,'Aktif','2026-04-07','2026-03-19 03:00:42','wahyu-donorejo','qwerty','*4D','Online','2026-05-16 06:37:52',0,NULL,-8.03005781,111.92078763),
(69,'tiko-serut',NULL,'-',NULL,'192.168.14.249',NULL,'Aktif','2026-03-19','2026-03-19 03:00:42','tiko-serut','qwerty','*4E','Online','2026-05-16 06:37:52',0,NULL,NULL,NULL),
(71,'smkn1-grogol',NULL,'-',NULL,'192.167.100.3',NULL,'Aktif','2026-03-19','2026-03-19 03:00:42','smkn1-grogol','grogol','*53','Online','2026-05-16 06:37:52',0,NULL,NULL,NULL),
(72,'yogo-donorejo','','081216121187','DS.tapan dsn.donorejo','192.168.14.253',1,'Aktif','2026-04-18','2026-03-19 03:00:42','yogo-donorejo','qwerty','*54','Online','2026-05-16 06:37:52',0,NULL,-8.02851660,111.92233048),
(73,'fajar-donorejo','','089536726189','DS.tapan dsn.donorejo','192.168.14.185',1,'Aktif','2026-04-18','2026-03-19 03:00:42','fajar-donorejo','qwerty','*55','Online','2026-05-16 06:37:52',0,NULL,-8.02842965,111.92216901),
(75,'bagus-donorejo','',' 085232183511','DS.tapan dsn.donorejo','192.168.14.215',1,'Aktif','2026-03-19','2026-03-24 13:34:12','bagus-donorejo','qwerty','*56','Online','2026-05-16 06:37:52',0,NULL,-8.02945661,111.92171005),
(77,'sella-donorejo','','085607784961','','192.168.14.238',2,'Aktif','2026-03-29','2026-04-02 11:43:08','sella-donorejo','qwerty','*57','Online','2026-05-16 06:37:52',0,NULL,-8.02790496,111.92131690),
(79,'amel-donorejo','','08973416457','ds.tapan dsn.serut','192.168.14.186',1,'Aktif','2026-01-01','2026-04-06 10:14:02','amel-donorejo','qwerty','*23','Online','2026-05-16 06:37:52',0,NULL,-8.03044948,111.92215770),
(81,'smariduta-olt',NULL,'-',NULL,'192.167.100.4',NULL,'Aktif','2026-04-06','2026-04-06 10:14:02','smariduta-olt','smariduta','*58','Online','2026-05-16 06:37:52',0,NULL,NULL,NULL),
(82,'riyanto-donorejo','','085745696697','ds.tapan dsn.serut','192.168.14.240',1,'Aktif','2026-02-27','2026-04-06 10:27:50','riyanto-donorejo','qwerty','*4F','Online','2026-05-16 06:37:52',0,NULL,-8.02975859,111.92187998),
(83,'bojes-donorejo','','085655754855','ds.tapan dsn.serut','192.168.14.229',1,'Aktif','2026-03-28','2026-04-06 10:30:23','bojes-donorejo','qwerty','*4A','Online','2026-05-16 06:37:52',0,NULL,-8.02980343,111.92171292),
(84,'hermin-rejoagung_titipan',NULL,'-',NULL,'',NULL,'Aktif','2026-04-07','2026-04-07 11:08:17','hermin-rejoagung_titipan','qwerty','*38','Offline','2026-05-16 06:37:52',0,NULL,NULL,NULL),
(86,'runa-melikan','','083135373452','ds.tapan dsn.melikan','192.168.14.192',1,'Aktif','2026-04-15','2026-04-14 19:05:20','runa-melikan','qwerty','*5A','Online','2026-05-16 06:37:52',0,NULL,-8.03182570,111.93106610),
(87,'widodo-donorejo','','085784466332','','192.168.14.206',1,'Aktif','2026-04-15','2026-04-15 11:40:55','widodo-donorejo','qwerty','*5B','Online','2026-05-16 06:37:52',0,NULL,-8.02768200,111.92124400),
(88,'batin-donorejo','','085878016884','DS.tapan dsn.donorejo','192.168.14.212',1,'Aktif','2026-04-15','2026-04-16 00:03:06','batin-donorejo','qwerty','*5C','Online','2026-05-16 06:37:52',0,NULL,-8.02793100,111.92096300),
(89,'nia-donorejo','','082235019563','ds.tapan dsn.donorejo','192.168.14.195',1,'Aktif','2026-04-22','2026-04-22 05:10:32','nia-donorejo','qwerty','*5D','Online','2026-05-16 06:37:52',0,NULL,-8.02774140,111.92176520),
(90,'jatmiko-tapan','','085607784961','ds.taoan dsn.tapan','192.168.14.184',1,'Aktif','2026-04-22','2026-04-22 05:10:32','jatmiko-tapan','qwerty','*5E','Online','2026-05-16 06:37:52',0,NULL,-8.03450420,111.93042070),
(91,'budi-donorejo','','085749044612','ds.tapan dsn.donorejo','192.168.14.205',1,'Aktif','2026-04-23','2026-04-23 11:17:22','budi-donorejo','qwerty','*60','Online','2026-05-16 06:37:52',0,NULL,-8.02890680,111.92267790),
(92,'monar-donorejo','','085936568839','ds.tapan dsn.donorejo','192.168.14.198',1,'Aktif','2026-04-23','2026-04-23 11:17:22','monar-donorejo','qwerty','*61','Online','2026-05-16 06:37:52',0,NULL,-8.02890680,111.92267790),
(93,'supani-donorejo','','-','','192.168.14.194',1,'Aktif','2026-04-23','2026-04-23 11:28:21','supani-donorejo','qwerty','*62','Online','2026-05-16 06:37:52',0,NULL,-8.02891150,111.92300780),
(94,'hari-donorejo','','089526537466','ds.tapan dsn.donorejo','192.168.14.202',1,'Aktif','2026-04-27','2026-04-27 11:37:16','hari-donorejo','qwerty','*63','Online','2026-05-16 06:37:52',0,NULL,-8.02786740,111.92191870),
(95,'ali-donorejo','','08973412204','ds.tapan dsn.serut','192.168.14.209',1,'Aktif','2026-04-27','2026-04-27 11:37:16','ali-donorejo','qwerty','*64','Online','2026-05-16 06:37:52',0,NULL,-8.02801710,111.92187920),
(96,'pono-donorejo','','081805758193','DS.tapan dsn.serut','192.168.14.219',1,'Aktif','2026-04-30','2026-04-30 23:54:43','pono-donorejo','qwerty','*65','Online','2026-05-16 06:37:52',0,NULL,-8.02734100,111.92006800);
/*!40000 ALTER TABLE `pelanggan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pemasukan`
--

DROP TABLE IF EXISTS `pemasukan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pemasukan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kategori` varchar(50) NOT NULL,
  `jumlah` decimal(15,2) NOT NULL,
  `tgl_pemasukan` date NOT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pemasukan`
--

LOCK TABLES `pemasukan` WRITE;
/*!40000 ALTER TABLE `pemasukan` DISABLE KEYS */;
INSERT INTO `pemasukan` VALUES
(1,'Langganan',240000.00,'2026-03-26','Pembayaran titipan','2026-03-26 05:18:53'),
(4,'Langganan',85000.00,'2026-04-11','Andik-kras','2026-04-11 14:28:01'),
(5,'Langganan',240000.00,'2026-04-11','Titipan cln','2026-04-11 14:33:47'),
(6,'Langganan',3500000.00,'2026-04-17','Uang dari pak Tino untuk pengembangan','2026-04-17 09:03:49'),
(7,'Langganan',325000.00,'2026-04-18','Dari pak tino','2026-04-18 09:58:15'),
(8,'Langganan',1250000.00,'2026-04-23','Dari pak tino','2026-04-23 13:14:44'),
(9,'Langganan',3000000.00,'2026-05-06','Dari pak tino','2026-05-06 14:39:43'),
(10,'Langganan',240000.00,'2026-05-12','Titipan cln','2026-05-12 01:44:06');
/*!40000 ALTER TABLE `pemasukan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pembayaran`
--

DROP TABLE IF EXISTS `pembayaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pembayaran` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_tagihan` int(11) NOT NULL,
  `jumlah` decimal(12,0) NOT NULL,
  `metode` enum('Transfer Bank','Tunai','QRIS','E-Wallet') DEFAULT 'Tunai',
  `tgl_bayar` datetime DEFAULT current_timestamp(),
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pay_tagihan` (`id_tagihan`),
  KEY `idx_pay_tgl` (`tgl_bayar`),
  CONSTRAINT `pembayaran_ibfk_1` FOREIGN KEY (`id_tagihan`) REFERENCES `tagihan` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=174 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pembayaran`
--

LOCK TABLES `pembayaran` WRITE;
/*!40000 ALTER TABLE `pembayaran` DISABLE KEYS */;
INSERT INTO `pembayaran` VALUES
(28,140,195000,'Tunai','2026-03-21 00:00:00','Pembayaran INV-032026-057','2026-03-21 04:10:10'),
(29,125,110000,'Tunai','2026-03-21 00:00:00','Pembayaran INV-032026-042','2026-03-21 04:10:16'),
(30,124,110000,'Tunai','2026-03-21 00:00:00','Pembayaran INV-032026-041','2026-03-21 04:10:52'),
(31,122,110000,'Tunai','2026-03-21 00:00:00','Pembayaran INV-032026-039','2026-03-21 04:11:00'),
(32,117,110000,'Tunai','2026-03-21 00:00:00','Pembayaran INV-032026-034','2026-03-21 04:11:21'),
(33,116,110000,'Tunai','2026-03-21 00:00:00','Pembayaran INV-032026-033','2026-03-21 04:11:29'),
(34,115,110000,'Tunai','2026-03-21 00:00:00','Pembayaran INV-032026-032','2026-03-21 04:11:33'),
(35,114,110000,'Tunai','2026-03-21 00:00:00','Pembayaran INV-032026-031','2026-03-21 04:11:38'),
(36,139,195000,'Tunai','2026-03-21 00:00:00','Pembayaran INV-032026-056','2026-03-21 04:11:47'),
(37,138,195000,'Tunai','2026-03-21 00:00:00','Pembayaran INV-032026-055','2026-03-21 04:11:55'),
(38,137,145000,'Tunai','2026-03-21 00:00:00','Pembayaran INV-032026-054','2026-03-21 04:12:00'),
(39,128,110000,'Tunai','2026-03-21 00:00:00','Pembayaran INV-032026-045','2026-03-21 04:12:22'),
(40,135,110000,'Tunai','2026-03-21 00:00:00','Pembayaran INV-032026-052','2026-03-21 14:21:37'),
(41,131,110000,'Tunai','2026-03-21 00:00:00','Pembayaran INV-032026-048','2026-03-21 14:21:43'),
(42,133,110000,'Tunai','2026-03-21 00:00:00','Pembayaran INV-032026-050','2026-03-21 14:21:57'),
(44,112,110000,'Tunai','2026-03-22 00:00:00','Pembayaran INV-032026-029','2026-03-22 01:31:34'),
(45,113,110000,'Tunai','2026-03-22 00:00:00','Pembayaran INV-032026-030','2026-03-22 01:32:14'),
(46,111,110000,'Tunai','2026-03-22 00:00:00','Pembayaran INV-032026-028','2026-03-22 01:32:45'),
(47,95,110000,'Tunai','2026-03-22 00:00:00','Pembayaran INV-032026-012','2026-03-22 01:33:05'),
(48,92,110000,'Tunai','2026-03-22 00:00:00','Pembayaran INV-032026-009','2026-03-22 01:33:13'),
(50,109,110000,'Tunai','2026-03-22 00:00:00','Pembayaran INV-032026-026','2026-03-22 01:33:26'),
(51,108,110000,'Tunai','2026-03-22 00:00:00','Pembayaran INV-032026-025','2026-03-22 01:33:36'),
(52,106,110000,'Tunai','2026-03-22 00:00:00','Pembayaran INV-032026-023','2026-03-22 01:33:50'),
(53,104,110000,'Tunai','2026-03-22 00:00:00','Pembayaran INV-032026-021','2026-03-22 01:34:56'),
(54,103,110000,'Tunai','2026-03-22 00:00:00','Pembayaran INV-032026-020','2026-03-22 01:35:05'),
(55,99,110000,'Tunai','2026-03-22 00:00:00','Pembayaran INV-032026-016','2026-03-22 01:36:04'),
(56,84,110000,'Tunai','2026-03-22 00:00:00','Pembayaran INV-032026-001','2026-03-22 01:36:10'),
(57,121,110000,'Tunai','2026-03-25 00:00:00','Pembayaran INV-032026-038','2026-03-25 09:40:51'),
(58,126,110000,'Tunai','2026-03-25 00:00:00','Pembayaran INV-032026-043','2026-03-25 09:41:12'),
(59,127,110000,'Tunai','2026-03-25 00:00:00','Pembayaran INV-032026-044','2026-03-25 09:41:15'),
(60,129,110000,'Tunai','2026-03-25 00:00:00','Pembayaran INV-032026-046','2026-03-25 09:41:30'),
(61,96,110000,'Tunai','2026-03-25 00:00:00','Pembayaran INV-032026-013','2026-03-25 09:41:40'),
(62,94,110000,'Tunai','2026-03-25 00:00:00','Pembayaran INV-032026-011','2026-03-25 09:41:55'),
(63,93,110000,'Tunai','2026-03-25 00:00:00','Pembayaran INV-032026-010','2026-03-25 09:42:09'),
(64,88,110000,'Tunai','2026-03-25 00:00:00','Pembayaran INV-032026-005','2026-03-25 09:42:21'),
(65,87,110000,'Tunai','2026-03-25 00:00:00','Pembayaran INV-032026-004','2026-03-25 09:42:35'),
(66,85,110000,'Tunai','2026-03-25 00:00:00','Pembayaran INV-032026-002','2026-03-25 09:42:51'),
(67,86,110000,'Tunai','2026-03-25 00:00:00','Pembayaran INV-032026-003','2026-03-25 09:42:56'),
(68,91,110000,'Tunai','2026-03-25 00:00:00','Pembayaran INV-032026-008','2026-03-25 09:43:03'),
(69,97,110000,'Tunai','2026-03-25 00:00:00','Pembayaran INV-032026-014','2026-03-25 09:43:09'),
(70,98,110000,'Tunai','2026-03-25 00:00:00','Pembayaran INV-032026-015','2026-03-25 09:43:15'),
(71,89,110000,'Tunai','2026-03-30 00:00:00','Pembayaran INV-032026-006','2026-03-30 06:41:51'),
(72,123,110000,'Tunai','2026-03-30 00:00:00','Pembayaran INV-032026-040','2026-03-30 06:42:12'),
(73,120,110000,'Tunai','2026-03-30 00:00:00','Pembayaran INV-032026-037','2026-03-30 06:42:19'),
(74,119,110000,'Tunai','2026-03-30 00:00:00','Pembayaran INV-032026-036','2026-03-30 06:42:23'),
(75,102,110000,'Tunai','2026-03-30 00:00:00','Pembayaran INV-032026-019','2026-03-30 06:42:34'),
(76,101,110000,'Tunai','2026-03-30 00:00:00','Pembayaran INV-032026-018','2026-03-30 06:42:39'),
(77,100,110000,'Tunai','2026-03-30 00:00:00','Pembayaran INV-032026-017','2026-03-30 06:42:44'),
(78,118,110000,'Tunai','2026-03-30 00:00:00','Pembayaran INV-032026-035','2026-03-30 12:34:22'),
(79,107,110000,'Tunai','2026-03-31 00:00:00','Pembayaran INV-032026-024','2026-03-31 08:03:25'),
(80,165,110000,'Tunai','2026-04-01 17:00:00','Pembayaran INV-042026-025','2026-04-01 07:16:12'),
(81,163,110000,'Tunai','2026-04-01 17:00:00','Pembayaran INV-042026-023','2026-04-01 07:33:06'),
(82,105,110000,'Tunai','2026-04-01 17:00:00','Pembayaran INV-032026-022','2026-04-01 11:32:35'),
(83,168,110000,'Tunai','2026-04-01 17:00:00','Pembayaran INV-042026-028','2026-04-01 11:49:04'),
(85,166,110000,'Tunai','2026-04-01 17:00:00','Pembayaran INV-042026-026','2026-04-01 11:49:58'),
(88,200,145000,'Tunai','2026-04-02 00:00:00','Pembayaran INV-2604-117','2026-04-02 11:48:07'),
(92,90,110000,'Tunai','2026-04-02 00:00:00','Pembayaran INV-032026-007','2026-04-02 11:56:21'),
(95,132,110000,'Tunai','2026-04-02 00:00:00','Pembayaran INV-032026-049','2026-04-02 12:51:38'),
(96,170,110000,'Tunai','2026-04-03 00:00:00','Pembayaran INV-042026-030','2026-04-03 03:21:48'),
(97,195,145000,'Tunai','2026-04-03 00:00:00','Pembayaran INV-042026-055','2026-04-03 03:22:00'),
(98,169,110000,'Tunai','2026-04-03 00:00:00','Pembayaran INV-042026-029','2026-04-03 03:22:17'),
(99,161,110000,'Tunai','2026-04-03 00:00:00','Pembayaran INV-042026-021','2026-04-03 12:26:13'),
(100,160,110000,'Tunai','2026-04-04 00:00:00','Pembayaran INV-042026-020','2026-04-04 06:32:12'),
(101,149,110000,'Tunai','2026-04-04 00:00:00','Pembayaran INV-042026-009','2026-04-04 10:13:32'),
(102,186,110000,'Tunai','2026-04-05 00:00:00','Pembayaran INV-042026-046','2026-04-05 05:45:15'),
(103,201,110000,'Tunai','2026-04-06 00:00:00','Pembayaran INV-042026-059','2026-04-06 10:17:27'),
(105,172,110000,'Tunai','2026-04-06 00:00:00','Pembayaran INV-042026-032','2026-04-06 10:39:50'),
(106,269,110000,'Tunai','2026-04-06 00:00:00','Pembayaran INV-2604-112','2026-04-06 10:51:56'),
(107,270,110000,'Tunai','2026-04-06 00:00:00','Pembayaran INV-2604-113','2026-04-06 10:52:09'),
(108,185,110000,'Tunai','2026-04-07 00:00:00','Pembayaran INV-042026-045','2026-04-07 06:57:44'),
(109,196,195000,'Tunai','2026-04-09 00:00:00','Pembayaran INV-042026-056','2026-04-09 11:07:41'),
(110,152,110000,'Tunai','2026-04-09 00:00:00','Pembayaran INV-042026-012','2026-04-09 11:07:50'),
(111,179,110000,'Tunai','2026-04-09 00:00:00','Pembayaran INV-042026-039','2026-04-09 13:18:57'),
(112,188,110000,'Tunai','2026-04-09 00:00:00','Pembayaran INV-042026-048','2026-04-09 14:13:57'),
(113,190,110000,'Tunai','2026-04-10 00:00:00','Pembayaran INV-042026-050','2026-04-10 13:28:30'),
(114,171,110000,'Tunai','2026-04-10 00:00:00','Pembayaran INV-042026-031','2026-04-10 13:28:45'),
(115,181,110000,'Tunai','2026-04-14 00:00:00','Pembayaran INV-042026-041','2026-04-14 01:15:46'),
(116,178,110000,'Tunai','2026-04-16 00:00:00','Pembayaran INV-042026-038','2026-04-16 10:51:31'),
(117,182,110000,'Tunai','2026-04-17 00:00:00','Pembayaran INV-042026-042','2026-04-17 10:25:54'),
(118,192,110000,'Tunai','2026-04-18 00:00:00','Pembayaran INV-042026-052','2026-04-18 13:09:37'),
(119,193,110000,'Tunai','2026-04-18 00:00:00','Pembayaran INV-042026-053','2026-04-18 13:09:47'),
(120,136,110000,'Tunai','2026-04-18 00:00:00','Pembayaran INV-032026-053','2026-04-18 13:09:51'),
(121,173,110000,'Tunai','2026-04-18 00:00:00','Pembayaran INV-042026-033','2026-04-18 13:10:01'),
(122,194,110000,'Tunai','2026-04-20 00:00:00','Pembayaran INV-042026-054','2026-04-20 10:44:06'),
(123,156,110000,'Tunai','2026-04-20 00:00:00','Pembayaran INV-042026-016','2026-04-20 10:44:14'),
(124,197,195000,'Tunai','2026-04-21 00:00:00','Pembayaran INV-042026-057','2026-04-21 08:23:27'),
(125,153,110000,'Tunai','2026-04-21 00:00:00','Pembayaran INV-042026-013','2026-04-21 08:24:26'),
(126,144,110000,'Tunai','2026-04-21 00:00:00','Pembayaran INV-042026-004','2026-04-21 08:34:36'),
(127,154,110000,'Tunai','2026-04-21 00:00:00','Pembayaran INV-042026-014','2026-04-21 09:45:16'),
(128,155,110000,'Tunai','2026-04-21 00:00:00','Pembayaran INV-042026-015','2026-04-21 09:45:29'),
(129,145,110000,'Tunai','2026-04-21 00:00:00','Pembayaran INV-042026-005','2026-04-21 09:45:37'),
(130,143,110000,'Tunai','2026-04-21 00:00:00','Pembayaran INV-042026-003','2026-04-21 09:45:55'),
(131,141,110000,'Tunai','2026-04-21 00:00:00','Pembayaran INV-042026-001','2026-04-21 09:46:04'),
(132,174,110000,'Tunai','2026-04-21 00:00:00','Pembayaran INV-042026-034','2026-04-21 09:46:11'),
(133,150,110000,'Tunai','2026-04-21 00:00:00','Pembayaran INV-042026-010','2026-04-21 09:46:21'),
(134,151,110000,'Tunai','2026-04-21 00:00:00','Pembayaran INV-042026-011','2026-04-21 09:46:27'),
(135,142,110000,'Tunai','2026-04-22 00:00:00','Pembayaran INV-042026-002','2026-04-22 11:08:23'),
(136,183,110000,'Tunai','2026-04-22 00:00:00','Pembayaran INV-042026-043','2026-04-22 14:53:30'),
(137,198,195000,'Tunai','2026-04-25 00:00:00','Pembayaran INV-042026-058','2026-04-25 02:23:40'),
(138,180,110000,'Tunai','2026-04-27 00:00:00','Pembayaran INV-042026-040','2026-04-27 05:18:03'),
(139,177,110000,'Tunai','2026-04-27 00:00:00','Pembayaran INV-042026-037','2026-04-27 05:18:08'),
(140,176,110000,'Tunai','2026-04-27 00:00:00','Pembayaran INV-042026-036','2026-04-27 05:18:11'),
(141,175,110000,'Tunai','2026-04-27 00:00:00','Pembayaran INV-042026-035','2026-04-27 05:18:14'),
(142,157,110000,'Tunai','2026-04-27 00:00:00','Pembayaran INV-042026-017','2026-04-27 05:18:22'),
(143,148,110000,'Tunai','2026-04-27 00:00:00','Pembayaran INV-042026-008','2026-04-27 05:18:31'),
(144,146,110000,'Tunai','2026-04-27 00:00:00','Pembayaran INV-042026-006','2026-04-27 05:18:44'),
(145,158,110000,'Tunai','2026-04-27 00:00:00','Pembayaran INV-042026-018','2026-04-27 12:03:27'),
(146,159,110000,'Tunai','2026-04-27 00:00:00','Pembayaran INV-042026-019','2026-04-27 12:03:30'),
(147,164,110000,'Tunai','2026-04-30 00:00:00','Pembayaran INV-042026-024','2026-04-30 23:54:21'),
(148,323,110000,'Tunai','2026-05-02 00:00:00','Pembayaran INV-052026-052','2026-05-02 16:25:00'),
(149,324,110000,'Tunai','2026-05-02 00:00:00','Pembayaran INV-052026-053','2026-05-02 16:25:42'),
(150,338,145000,'Tunai','2026-05-02 00:00:00','Pembayaran INV-052026-067','2026-05-02 16:25:53'),
(151,337,145000,'Tunai','2026-05-02 00:00:00','Pembayaran INV-052026-066','2026-05-02 16:26:04'),
(152,298,110000,'Tunai','2026-05-02 00:00:00','Pembayaran INV-052026-027','2026-05-02 16:27:41'),
(153,297,110000,'Tunai','2026-05-02 00:00:00','Pembayaran INV-052026-026','2026-05-02 16:27:56'),
(154,296,110000,'Tunai','2026-05-02 00:00:00','Pembayaran INV-052026-025','2026-05-02 16:29:37'),
(155,292,110000,'Tunai','2026-05-03 00:00:00','Pembayaran INV-052026-021','2026-05-03 02:56:21'),
(156,299,110000,'Tunai','2026-05-03 00:00:00','Pembayaran INV-052026-028','2026-05-03 10:59:00'),
(157,316,110000,'Tunai','2026-05-05 00:00:00','Pembayaran INV-052026-045','2026-05-05 10:43:32'),
(158,300,110000,'Tunai','2026-05-05 00:00:00','Pembayaran INV-052026-029','2026-05-05 10:43:55'),
(159,162,110000,'Tunai','2026-05-05 00:00:00','Pembayaran INV-042026-022','2026-05-05 10:44:05'),
(160,294,110000,'Tunai','2026-05-05 00:00:00','Pembayaran INV-052026-023','2026-05-05 10:45:04'),
(161,280,110000,'Tunai','2026-05-05 00:00:00','Pembayaran INV-052026-009','2026-05-05 10:54:13'),
(162,291,110000,'Tunai','2026-05-06 00:00:00','Pembayaran INV-052026-020','2026-05-06 14:35:57'),
(163,325,110000,'Tunai','2026-05-06 00:00:00','Pembayaran INV-052026-054','2026-05-06 14:36:06'),
(164,339,195000,'Tunai','2026-05-07 00:00:00','Pembayaran INV-052026-068','2026-05-07 13:10:43'),
(165,317,110000,'Tunai','2026-05-07 00:00:00','Pembayaran INV-052026-046','2026-05-07 13:10:53'),
(166,302,110000,'Tunai','2026-05-08 00:00:00','Pembayaran INV-052026-031','2026-05-08 07:35:37'),
(167,283,110000,'Tunai','2026-05-08 00:00:00','Pembayaran INV-052026-012','2026-05-08 07:35:45'),
(168,318,110000,'Tunai','2026-05-09 00:00:00','Pembayaran INV-052026-047','2026-05-09 13:03:10'),
(169,301,110000,'Tunai','2026-05-09 00:00:00','Pembayaran INV-052026-030','2026-05-09 13:03:27'),
(170,315,110000,'Tunai','2026-05-11 00:00:00','Pembayaran INV-052026-044','2026-05-11 07:15:30'),
(171,311,110000,'Tunai','2026-05-14 00:00:00','Pembayaran INV-052026-040','2026-05-14 07:09:37'),
(172,326,110000,'Tunai','2026-05-15 00:00:00','Pembayaran INV-052026-055','2026-05-15 10:09:10'),
(173,319,110000,'Tunai','2026-05-15 00:00:00','Pembayaran INV-052026-048','2026-05-15 10:09:18');
/*!40000 ALTER TABLE `pembayaran` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pengaturan`
--

DROP TABLE IF EXISTS `pengaturan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pengaturan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_isp` varchar(100) DEFAULT NULL,
  `telepon` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `website` varchar(100) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `mikrotik_host` varchar(100) DEFAULT NULL,
  `mikrotik_user` varchar(50) DEFAULT NULL,
  `mikrotik_password` varchar(255) DEFAULT NULL,
  `mikrotik_port` int(11) DEFAULT 8728,
  `wa_api_url` varchar(255) DEFAULT NULL,
  `wa_api_token` varchar(255) DEFAULT NULL,
  `wa_notif_enabled` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pengaturan`
--

LOCK TABLES `pengaturan` WRITE;
/*!40000 ALTER TABLE `pengaturan` DISABLE KEYS */;
INSERT INTO `pengaturan` VALUES
(1,'TAMnet','(0355) 123-4567','info@netbill.id','https://netbill.id','Jl. Mawar No. 12, Tulungagung, Jawa Timur','/uploads/logo-1775992327426.png','2026-03-18 01:18:53','2026-04-12 11:12:07','157.15.67.185','tamnet','tino2025',9125,'','',1),
(6,'NetBill Internet Provider','(0355) 123-4567','info@netbill.id','https://netbill.id','Jl. Mawar No. 12, Tulungagung',NULL,'2026-04-11 13:48:44','2026-04-11 13:48:44',NULL,NULL,NULL,8728,NULL,NULL,0);
/*!40000 ALTER TABLE `pengaturan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pengeluaran`
--

DROP TABLE IF EXISTS `pengeluaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pengeluaran` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kategori` varchar(50) NOT NULL,
  `jumlah` decimal(12,0) NOT NULL,
  `tgl_pengeluaran` date NOT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_karyawan` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pgl_tgl` (`tgl_pengeluaran`),
  KEY `idx_pgl_kategori` (`kategori`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pengeluaran`
--

LOCK TABLES `pengeluaran` WRITE;
/*!40000 ALTER TABLE `pengeluaran` DISABLE KEYS */;
INSERT INTO `pengeluaran` VALUES
(1,'Listrik',350000,'2026-03-05','Tagihan listrik bulan Maret','2026-04-11 13:48:44',NULL),
(2,'Peralatan',700000,'2026-03-20','Kabel 1 core\nSplitter 1/8-1pcs\nIsolasi-1pcs\nTies-1pcs','2026-03-20 16:06:05',NULL),
(3,'Operasional',50000,'2026-03-07','Tarik jalur odp 130mtr','2026-03-20 16:06:48',NULL),
(4,'Operasional',200000,'2026-03-24','THR adit','2026-03-25 09:32:12',NULL),
(5,'Operasional',50000,'2026-03-23','Psb gito-donorejo','2026-03-25 09:46:37',NULL),
(6,'Operasional',50000,'2026-03-25','Psb wahyu-donorejo','2026-03-25 09:46:56',NULL),
(7,'Operasional',50000,'2026-03-25','Psb riyanto-donorejo','2026-03-25 09:47:12',NULL),
(8,'Operasional',50000,'2026-03-23','Psb bojes-donorejo','2026-03-25 09:48:41',NULL),
(9,'Operasional',50000,'2026-03-25','Psb ridwan-donorejo','2026-03-25 09:48:59',NULL),
(10,'Operasional',50000,'2026-03-25','Psb bagus-donorejo','2026-03-25 09:49:17',NULL),
(11,'Operasional',50000,'2026-03-25','Psb afan-donorejo','2026-03-25 09:49:49',NULL),
(12,'Operasional',50000,'2026-03-25','Psb sapii-donorejo','2026-03-25 09:50:04',NULL),
(13,'Operasional',50000,'2026-03-25','Psb devi-serut','2026-03-25 09:50:19',NULL),
(14,'Operasional',50000,'2026-03-25','Psb yogo-donorejo','2026-03-25 09:50:55',NULL),
(15,'Operasional',50000,'2026-03-25','Psb fajar-donorejo','2026-03-25 09:51:11',NULL),
(16,'Pemasaran',550000,'2026-03-25','Fee psb 11','2026-03-25 09:56:28',NULL),
(19,'Peralatan',1500000,'2026-03-31','Ke pak Tino beli modem','2026-03-31 10:21:10',NULL),
(20,'Gaji',1500000,'2026-03-05','Gaji Tiko','2026-04-01 00:32:12',2),
(21,'Gaji',800000,'2026-04-01','Gaji Mas Pras','2026-04-01 00:52:44',4),
(22,'Operasional',50000,'2026-04-02','Psb sella-donorejo','2026-04-02 11:50:56',NULL),
(23,'Pemasaran',50000,'2026-04-02','Fee rembo(sella)','2026-04-02 11:51:23',NULL),
(24,'Peralatan',160000,'2026-04-01','beli klem aki 2 set','2026-04-03 12:40:23',NULL),
(25,'Peralatan',90000,'2026-04-04','Beli avo meter','2026-04-04 07:56:56',NULL),
(26,'Gaji',1500000,'2026-04-04','Gaji Tiko','2026-04-04 07:57:34',2),
(27,'Peralatan',200000,'2026-04-04','Tukar tambah aki','2026-04-04 17:05:33',NULL),
(28,'Listrik',60000,'2026-04-07','Alat sanyo otomatis','2026-04-07 06:58:31',NULL),
(29,'Operasional',200000,'2026-04-08','Pembayaran alat pak tino','2026-04-09 13:21:15',NULL),
(30,'Operasional',120000,'2026-04-09','Solar + minum (maintenance Grogol)','2026-04-09 13:21:40',NULL),
(31,'Operasional',100000,'2026-04-11','Solar','2026-04-11 12:44:05',NULL),
(32,'Peralatan',120000,'2026-04-14','Kurangan belanja easy com','2026-04-14 01:16:32',NULL),
(33,'Operasional',50000,'2026-04-14','Konsumsi ','2026-04-14 01:18:39',NULL),
(34,'Peralatan',65000,'2026-04-15','Splitter 1:8 1','2026-04-15 09:56:12',NULL),
(35,'Operasional',600000,'2026-04-16','Tarik jalur 1,2 + 300','2026-04-16 11:45:58',NULL),
(36,'Peralatan',3500000,'2026-04-17','Beli kabel 4c x 2 1c x 1','2026-04-17 09:05:47',NULL),
(37,'Operasional',325000,'2026-04-18','Blanja ont 2 + slave protc','2026-04-18 09:59:04',NULL),
(38,'Pemasaran',50000,'2026-04-20','Fee psb batin','2026-04-20 10:44:57',NULL),
(39,'Operasional',250000,'2026-04-21','Solar','2026-04-21 08:22:48',NULL),
(40,'Operasional',700000,'2026-04-22','Beli ban','2026-04-22 06:58:27',NULL),
(41,'Operasional',130000,'2026-04-22','Spliter 2 solasi 1','2026-04-22 06:59:16',NULL),
(42,'Operasional',80000,'2026-04-22','Tarik odp Tapan selatan','2026-04-22 10:53:20',NULL),
(44,'Operasional',130000,'2026-04-22','Patcore + kabel tis','2026-04-22 15:04:03',NULL),
(45,'Operasional',100000,'2026-04-23','Spooring','2026-04-23 10:59:59',NULL),
(46,'Operasional',100000,'2026-04-23','Maintenance grogol','2026-04-23 11:00:27',NULL),
(47,'Operasional',1250000,'2026-04-23','Belanja adaptor 5\nModem 3\nKabel 1c 1hasbel','2026-04-23 13:15:52',NULL),
(48,'Operasional',180000,'2026-04-23','Solar','2026-04-23 18:24:01',NULL),
(49,'Operasional',800000,'2026-05-02','Ganti oli+filter solar+ filter oli','2026-05-02 16:30:53',NULL),
(50,'Operasional',800000,'2026-05-02','Beli modem + adaptor 5pcs','2026-05-02 16:31:21',NULL),
(51,'Operasional',150000,'2026-05-02','Maintenance grogol(Pras,Adit,Tiko)','2026-05-02 16:33:40',NULL),
(52,'Lainnya',200000,'2026-05-03','Kasih ke pras','2026-05-03 10:34:53',NULL),
(53,'Operasional',60000,'2026-05-05','Perbaikan kabel arah ririn','2026-05-05 15:58:19',NULL),
(54,'Operasional',80000,'2026-05-06','Untuk urus nib NPWP FC pulsa foto matrei','2026-05-06 14:38:12',NULL),
(55,'Operasional',2000000,'2026-05-06','Setor buat rekening pt','2026-05-06 14:40:00',NULL),
(56,'Peralatan',860000,'2026-05-08','Kabel+petcore+tis','2026-05-08 04:26:40',NULL),
(57,'Gaji',1800000,'2026-05-08','Gaji Tiko','2026-05-08 04:27:01',2),
(58,'Operasional',160000,'2026-05-09','Mas tino','2026-05-09 13:03:44',NULL),
(59,'Lainnya',200000,'2026-05-12','Kembalikan ke pak tino','2026-05-12 01:43:02',NULL),
(60,'Lainnya',125000,'2026-05-12','Bnh jrk dan bng','2026-05-12 01:43:42',NULL);
/*!40000 ALTER TABLE `pengeluaran` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `key` varchar(50) NOT NULL,
  `value` text DEFAULT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES
('alamat','Serut Tapan Kedungwaru Tulungagung'),
('denda','5000'),
('ketua','Bapak Pardan'),
('namaRT','RT 01'),
('namaRW','RW 07'),
('telp','08986355829');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tagihan`
--

DROP TABLE IF EXISTS `tagihan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tagihan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `no_tagihan` varchar(30) NOT NULL,
  `id_pelanggan` int(11) NOT NULL,
  `periode` varchar(30) DEFAULT NULL,
  `jumlah` decimal(12,0) NOT NULL,
  `tgl_jatuh_tempo` date DEFAULT NULL,
  `status` enum('Lunas','Belum Bayar','Terlambat') DEFAULT 'Belum Bayar',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `no_tagihan` (`no_tagihan`),
  KEY `idx_tag_pelanggan` (`id_pelanggan`),
  KEY `idx_tag_status` (`status`),
  KEY `idx_tag_created` (`created_at`),
  CONSTRAINT `tagihan_ibfk_1` FOREIGN KEY (`id_pelanggan`) REFERENCES `pelanggan` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=342 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tagihan`
--

LOCK TABLES `tagihan` WRITE;
/*!40000 ALTER TABLE `tagihan` DISABLE KEYS */;
INSERT INTO `tagihan` VALUES
(84,'INV-032026-001',8,'Maret 2026',110000,'2026-03-21','Lunas','2026-03-21 03:54:21'),
(85,'INV-032026-002',9,'Maret 2026',110000,'2026-03-22','Lunas','2026-03-21 03:54:21'),
(86,'INV-032026-003',10,'Maret 2026',110000,'2026-03-22','Lunas','2026-03-21 03:54:21'),
(87,'INV-032026-004',11,'Maret 2026',110000,'2026-03-22','Lunas','2026-03-21 03:54:21'),
(88,'INV-032026-005',12,'Maret 2026',110000,'2026-03-22','Lunas','2026-03-21 03:54:21'),
(89,'INV-032026-006',13,'Maret 2026',110000,'2026-03-22','Lunas','2026-03-21 03:54:21'),
(90,'INV-032026-007',14,'Maret 2026',110000,'2026-03-20','Lunas','2026-03-21 03:54:21'),
(91,'INV-032026-008',15,'Maret 2026',110000,'2026-03-22','Lunas','2026-03-21 03:54:21'),
(92,'INV-032026-009',16,'Maret 2026',110000,'2026-03-09','Lunas','2026-03-21 03:54:21'),
(93,'INV-032026-010',17,'Maret 2026',110000,'2026-03-22','Lunas','2026-03-21 03:54:21'),
(94,'INV-032026-011',18,'Maret 2026',110000,'2026-03-22','Lunas','2026-03-21 03:54:21'),
(95,'INV-032026-012',19,'Maret 2026',110000,'2026-03-09','Lunas','2026-03-21 03:54:21'),
(96,'INV-032026-013',20,'Maret 2026',110000,'2026-03-22','Lunas','2026-03-21 03:54:21'),
(97,'INV-032026-014',21,'Maret 2026',110000,'2026-03-22','Lunas','2026-03-21 03:54:21'),
(98,'INV-032026-015',22,'Maret 2026',110000,'2026-03-22','Lunas','2026-03-21 03:54:21'),
(99,'INV-032026-016',23,'Maret 2026',110000,'2026-03-22','Lunas','2026-03-21 03:54:21'),
(100,'INV-032026-017',24,'Maret 2026',110000,'2026-03-27','Lunas','2026-03-21 03:54:21'),
(101,'INV-032026-018',25,'Maret 2026',110000,'2026-03-27','Lunas','2026-03-21 03:54:21'),
(102,'INV-032026-019',26,'Maret 2026',110000,'2026-03-27','Lunas','2026-03-21 03:54:21'),
(103,'INV-032026-020',27,'Maret 2026',110000,'2026-03-03','Lunas','2026-03-21 03:54:21'),
(104,'INV-032026-021',28,'Maret 2026',110000,'2026-03-04','Lunas','2026-03-21 03:54:21'),
(105,'INV-032026-022',30,'Maret 2026',110000,'2026-03-03','Lunas','2026-03-21 03:54:21'),
(106,'INV-032026-023',31,'Maret 2026',110000,'2026-03-06','Lunas','2026-03-21 03:54:21'),
(107,'INV-032026-024',32,'Maret 2026',110000,'2026-03-30','Lunas','2026-03-21 03:54:21'),
(108,'INV-032026-025',33,'Maret 2026',110000,'2026-03-03','Lunas','2026-03-21 03:54:21'),
(109,'INV-032026-026',34,'Maret 2026',110000,'2026-03-03','Lunas','2026-03-21 03:54:21'),
(111,'INV-032026-028',36,'Maret 2026',110000,'2026-03-04','Lunas','2026-03-21 03:54:21'),
(112,'INV-032026-029',37,'Maret 2026',110000,'2026-03-04','Lunas','2026-03-21 03:54:21'),
(113,'INV-032026-030',38,'Maret 2026',110000,'2026-03-05','Lunas','2026-03-21 03:54:21'),
(114,'INV-032026-031',40,'Maret 2026',110000,'2026-03-07','Lunas','2026-03-21 03:54:21'),
(115,'INV-032026-032',41,'Maret 2026',110000,'2026-03-08','Lunas','2026-03-21 03:54:21'),
(116,'INV-032026-033',43,'Maret 2026',110000,'2026-03-17','Lunas','2026-03-21 03:54:21'),
(117,'INV-032026-034',45,'Maret 2026',110000,'2026-03-22','Lunas','2026-03-21 03:54:21'),
(118,'INV-032026-035',46,'Maret 2026',110000,'2026-03-24','Lunas','2026-03-21 03:54:21'),
(119,'INV-032026-036',47,'Maret 2026',110000,'2026-03-25','Lunas','2026-03-21 03:54:21'),
(120,'INV-032026-037',48,'Maret 2026',110000,'2026-03-25','Lunas','2026-03-21 03:54:21'),
(121,'INV-032026-038',49,'Maret 2026',110000,'2026-03-04','Lunas','2026-03-21 03:54:21'),
(122,'INV-032026-039',50,'Maret 2026',110000,'2026-03-05','Lunas','2026-03-21 03:54:21'),
(123,'INV-032026-040',51,'Maret 2026',110000,'2026-03-28','Lunas','2026-03-21 03:54:21'),
(124,'INV-032026-041',54,'Maret 2026',110000,'2026-03-15','Lunas','2026-03-21 03:54:21'),
(125,'INV-032026-042',56,'Maret 2026',110000,'2026-03-19','Lunas','2026-03-21 03:54:21'),
(126,'INV-032026-043',61,'Maret 2026',110000,'2026-03-30','Lunas','2026-03-21 03:54:21'),
(127,'INV-032026-044',62,'Maret 2026',110000,'2026-03-30','Lunas','2026-03-21 03:54:21'),
(128,'INV-032026-045',63,'Maret 2026',110000,'2026-03-20','Lunas','2026-03-21 03:54:21'),
(129,'INV-032026-046',64,'Maret 2026',110000,'2026-03-07','Lunas','2026-03-21 03:54:21'),
(131,'INV-032026-048',66,'Maret 2026',110000,'2026-03-09','Lunas','2026-03-21 03:54:21'),
(132,'INV-032026-049',67,'Maret 2026',110000,'2026-03-11','Lunas','2026-03-21 03:54:21'),
(133,'INV-032026-050',68,'Maret 2026',110000,'2026-03-11','Lunas','2026-03-21 03:54:21'),
(135,'INV-032026-052',72,'Maret 2026',110000,'2026-03-21','Lunas','2026-03-21 03:54:21'),
(136,'INV-032026-053',73,'Maret 2026',110000,'2026-03-21','Lunas','2026-03-21 03:54:21'),
(137,'INV-032026-054',39,'Maret 2026',145000,'2026-03-05','Lunas','2026-03-21 03:54:21'),
(138,'INV-032026-055',42,'Maret 2026',195000,'2026-03-09','Lunas','2026-03-21 03:54:21'),
(139,'INV-032026-056',59,'Maret 2026',195000,'2026-03-18','Lunas','2026-03-21 03:54:21'),
(140,'INV-032026-057',60,'Maret 2026',195000,'2026-03-22','Lunas','2026-03-21 03:54:21'),
(141,'INV-042026-001',8,'April 2026',110000,'2026-04-21','Lunas','2026-03-31 23:14:32'),
(142,'INV-042026-002',9,'April 2026',110000,'2026-04-22','Lunas','2026-03-31 23:14:32'),
(143,'INV-042026-003',10,'April 2026',110000,'2026-04-22','Lunas','2026-03-31 23:14:32'),
(144,'INV-042026-004',11,'April 2026',110000,'2026-04-22','Lunas','2026-03-31 23:14:32'),
(145,'INV-042026-005',12,'April 2026',110000,'2026-04-22','Lunas','2026-03-31 23:14:32'),
(146,'INV-042026-006',13,'April 2026',110000,'2026-04-22','Lunas','2026-03-31 23:14:32'),
(147,'INV-042026-007',14,'April 2026',110000,'2026-04-19','Belum Bayar','2026-03-31 23:14:32'),
(148,'INV-042026-008',15,'April 2026',110000,'2026-04-22','Lunas','2026-03-31 23:14:32'),
(149,'INV-042026-009',16,'April 2026',110000,'2026-04-09','Lunas','2026-03-31 23:14:32'),
(150,'INV-042026-010',17,'April 2026',110000,'2026-04-22','Lunas','2026-03-31 23:14:32'),
(151,'INV-042026-011',18,'April 2026',110000,'2026-04-22','Lunas','2026-03-31 23:14:32'),
(152,'INV-042026-012',19,'April 2026',110000,'2026-04-09','Lunas','2026-03-31 23:14:32'),
(153,'INV-042026-013',20,'April 2026',110000,'2026-04-22','Lunas','2026-03-31 23:14:32'),
(154,'INV-042026-014',21,'April 2026',110000,'2026-04-22','Lunas','2026-03-31 23:14:32'),
(155,'INV-042026-015',22,'April 2026',110000,'2026-04-22','Lunas','2026-03-31 23:14:32'),
(156,'INV-042026-016',23,'April 2026',110000,'2026-04-22','Lunas','2026-03-31 23:14:32'),
(157,'INV-042026-017',24,'April 2026',110000,'2026-04-27','Lunas','2026-03-31 23:14:32'),
(158,'INV-042026-018',25,'April 2026',110000,'2026-04-27','Lunas','2026-03-31 23:14:32'),
(159,'INV-042026-019',26,'April 2026',110000,'2026-04-27','Lunas','2026-03-31 23:14:32'),
(160,'INV-042026-020',27,'April 2026',110000,'2026-04-03','Lunas','2026-03-31 23:14:32'),
(161,'INV-042026-021',28,'April 2026',110000,'2026-04-04','Lunas','2026-03-31 23:14:32'),
(162,'INV-042026-022',30,'April 2026',110000,'2026-04-03','Lunas','2026-03-31 23:14:32'),
(163,'INV-042026-023',31,'April 2026',110000,'2026-04-06','Lunas','2026-03-31 23:14:32'),
(164,'INV-042026-024',32,'Mei 2026',110000,'2026-04-30','Lunas','2026-03-31 23:14:32'),
(165,'INV-042026-025',33,'April 2026',110000,'2026-04-03','Lunas','2026-03-31 23:14:32'),
(166,'INV-042026-026',34,'April 2026',110000,'2026-04-03','Lunas','2026-03-31 23:14:32'),
(168,'INV-042026-028',36,'April 2026',110000,'2026-04-03','Lunas','2026-03-31 23:14:32'),
(169,'INV-042026-029',37,'April 2026',110000,'2026-04-04','Lunas','2026-03-31 23:14:32'),
(170,'INV-042026-030',38,'April 2026',110000,'2026-04-05','Lunas','2026-03-31 23:14:32'),
(171,'INV-042026-031',40,'April 2026',110000,'2026-04-07','Lunas','2026-03-31 23:14:32'),
(172,'INV-042026-032',41,'April 2026',110000,'2026-04-08','Lunas','2026-03-31 23:14:32'),
(173,'INV-042026-033',43,'April 2026',110000,'2026-04-17','Lunas','2026-03-31 23:14:32'),
(174,'INV-042026-034',45,'April 2026',110000,'2026-04-22','Lunas','2026-03-31 23:14:32'),
(175,'INV-042026-035',46,'April 2026',110000,'2026-04-24','Lunas','2026-03-31 23:14:32'),
(176,'INV-042026-036',47,'April 2026',110000,'2026-04-25','Lunas','2026-03-31 23:14:32'),
(177,'INV-042026-037',48,'April 2026',110000,'2026-04-25','Lunas','2026-03-31 23:14:32'),
(178,'INV-042026-038',49,'April 2026',110000,'2026-04-04','Lunas','2026-03-31 23:14:32'),
(179,'INV-042026-039',50,'April 2026',110000,'2026-04-05','Lunas','2026-03-31 23:14:32'),
(180,'INV-042026-040',51,'April 2026',110000,'2026-04-28','Lunas','2026-03-31 23:14:32'),
(181,'INV-042026-041',54,'April 2026',110000,'2026-04-15','Lunas','2026-03-31 23:14:32'),
(182,'INV-042026-042',56,'April 2026',110000,'2026-04-19','Lunas','2026-03-31 23:14:32'),
(183,'INV-042026-043',61,'Mei 2026',110000,'2026-05-30','Lunas','2026-03-31 23:14:32'),
(184,'INV-042026-044',62,'Mei 2026',110000,'2026-05-30','Belum Bayar','2026-03-31 23:14:32'),
(185,'INV-042026-045',63,'April 2026',110000,'2026-04-18','Lunas','2026-03-31 23:14:32'),
(186,'INV-042026-046',64,'Mei 2026',110000,'2026-05-07','Lunas','2026-03-31 23:14:32'),
(188,'INV-042026-048',66,'April 2026',110000,'2026-04-08','Lunas','2026-03-31 23:14:32'),
(189,'INV-042026-049',67,'Mei 2026',110000,'2026-05-11','Lunas','2026-03-31 23:14:32'),
(190,'INV-042026-050',68,'Mei 2026',110000,'2026-05-10','Lunas','2026-03-31 23:14:32'),
(192,'INV-042026-052',72,'Mei 2026',110000,'2026-05-21','Lunas','2026-03-31 23:14:32'),
(193,'INV-042026-053',73,'April 2026',110000,'2026-04-21','Lunas','2026-03-31 23:14:32'),
(194,'INV-042026-054',75,'April 2026',110000,'2026-04-23','Lunas','2026-03-31 23:14:32'),
(195,'INV-042026-055',39,'April 2026',145000,'2026-04-05','Lunas','2026-03-31 23:14:32'),
(196,'INV-042026-056',42,'April 2026',195000,'2026-04-09','Lunas','2026-03-31 23:14:32'),
(197,'INV-042026-057',59,'April 2026',195000,'2026-04-18','Lunas','2026-03-31 23:14:32'),
(198,'INV-042026-058',60,'April 2026',195000,'2026-04-21','Lunas','2026-03-31 23:14:32'),
(200,'INV-2604-117',77,'April 2026',145000,'2026-04-19','Lunas','2026-04-02 11:48:03'),
(201,'INV-042026-059',79,'April 2026',110000,'2026-04-03','Lunas','2026-04-06 10:17:06'),
(269,'INV-2604-112',83,'April 2026',110000,'2026-04-01','Lunas','2026-04-06 10:51:49'),
(270,'INV-2604-113',82,'April 2026',110000,'2026-04-01','Lunas','2026-04-06 10:52:06'),
(271,'INV-2604-114',14,'April 2026',110000,'2026-04-19','Belum Bayar','2026-04-18 10:00:20'),
(272,'INV-052026-001',8,'Mei 2026',110000,'2026-05-22','Belum Bayar','2026-05-02 16:24:28'),
(273,'INV-052026-002',9,'Mei 2026',110000,'2026-05-21','Belum Bayar','2026-05-02 16:24:28'),
(274,'INV-052026-003',10,'Mei 2026',110000,'2026-05-21','Belum Bayar','2026-05-02 16:24:28'),
(275,'INV-052026-004',11,'Mei 2026',110000,'2026-05-22','Belum Bayar','2026-05-02 16:24:28'),
(276,'INV-052026-005',12,'Mei 2026',110000,'2026-05-21','Belum Bayar','2026-05-02 16:24:28'),
(277,'INV-052026-006',13,'Mei 2026',110000,'2026-05-22','Belum Bayar','2026-05-02 16:24:28'),
(278,'INV-052026-007',14,'Mei 2026',110000,'2026-05-18','Belum Bayar','2026-05-02 16:24:28'),
(279,'INV-052026-008',15,'Mei 2026',110000,'2026-05-21','Belum Bayar','2026-05-02 16:24:28'),
(280,'INV-052026-009',16,'Mei 2026',110000,'2026-05-08','Lunas','2026-05-02 16:24:28'),
(281,'INV-052026-010',17,'Mei 2026',110000,'2026-05-22','Belum Bayar','2026-05-02 16:24:28'),
(282,'INV-052026-011',18,'Mei 2026',110000,'2026-05-22','Belum Bayar','2026-05-02 16:24:28'),
(283,'INV-052026-012',19,'Mei 2026',110000,'2026-05-08','Lunas','2026-05-02 16:24:28'),
(284,'INV-052026-013',20,'Mei 2026',110000,'2026-05-22','Belum Bayar','2026-05-02 16:24:28'),
(285,'INV-052026-014',21,'Mei 2026',110000,'2026-05-21','Belum Bayar','2026-05-02 16:24:28'),
(286,'INV-052026-015',22,'Mei 2026',110000,'2026-05-22','Belum Bayar','2026-05-02 16:24:28'),
(287,'INV-052026-016',23,'Mei 2026',110000,'2026-05-21','Belum Bayar','2026-05-02 16:24:28'),
(288,'INV-052026-017',24,'Mei 2026',110000,'2026-05-26','Belum Bayar','2026-05-02 16:24:28'),
(289,'INV-052026-018',25,'Mei 2026',110000,'2026-05-27','Belum Bayar','2026-05-02 16:24:28'),
(290,'INV-052026-019',26,'Mei 2026',110000,'2026-05-26','Belum Bayar','2026-05-02 16:24:28'),
(291,'INV-052026-020',27,'Juni 2026',110000,'2026-06-02','Lunas','2026-05-02 16:24:28'),
(292,'INV-052026-021',28,'Mei 2026',110000,'2026-05-03','Lunas','2026-05-02 16:24:28'),
(293,'INV-052026-022',30,'Juni 2026',110000,'2026-06-02','Belum Bayar','2026-05-02 16:24:28'),
(294,'INV-052026-023',31,'Mei 2026',110000,'2026-05-05','Lunas','2026-05-02 16:24:28'),
(295,'INV-052026-024',32,'Mei 2026',110000,'2026-05-29','Belum Bayar','2026-05-02 16:24:28'),
(296,'INV-052026-025',33,'Juni 2026',110000,'2026-06-02','Lunas','2026-05-02 16:24:28'),
(297,'INV-052026-026',34,'Juni 2026',110000,'2026-06-02','Lunas','2026-05-02 16:24:28'),
(298,'INV-052026-027',36,'Juni 2026',110000,'2026-06-02','Lunas','2026-05-02 16:24:28'),
(299,'INV-052026-028',37,'Mei 2026',110000,'2026-05-03','Lunas','2026-05-02 16:24:28'),
(300,'INV-052026-029',38,'Mei 2026',110000,'2026-05-04','Lunas','2026-05-02 16:24:28'),
(301,'INV-052026-030',40,'Mei 2026',110000,'2026-05-06','Lunas','2026-05-02 16:24:28'),
(302,'INV-052026-031',41,'Mei 2026',110000,'2026-05-08','Lunas','2026-05-02 16:24:28'),
(303,'INV-052026-032',43,'Mei 2026',110000,'2026-05-16','Belum Bayar','2026-05-02 16:24:28'),
(304,'INV-052026-033',45,'Mei 2026',110000,'2026-05-21','Belum Bayar','2026-05-02 16:24:28'),
(305,'INV-052026-034',46,'Mei 2026',110000,'2026-05-23','Belum Bayar','2026-05-02 16:24:28'),
(306,'INV-052026-035',47,'Mei 2026',110000,'2026-05-24','Belum Bayar','2026-05-02 16:24:28'),
(307,'INV-052026-036',48,'Mei 2026',110000,'2026-05-24','Belum Bayar','2026-05-02 16:24:28'),
(308,'INV-052026-037',49,'Mei 2026',110000,'2026-05-03','Belum Bayar','2026-05-02 16:24:28'),
(309,'INV-052026-038',50,'Mei 2026',110000,'2026-05-04','Belum Bayar','2026-05-02 16:24:28'),
(310,'INV-052026-039',51,'Mei 2026',110000,'2026-05-26','Belum Bayar','2026-05-02 16:24:28'),
(311,'INV-052026-040',54,'Mei 2026',110000,'2026-05-14','Lunas','2026-05-02 16:24:28'),
(312,'INV-052026-041',56,'Mei 2026',110000,'2026-05-18','Belum Bayar','2026-05-02 16:24:28'),
(313,'INV-052026-042',61,'Mei 2026',110000,'2026-05-29','Belum Bayar','2026-05-02 16:24:28'),
(314,'INV-052026-043',62,'Mei 2026',110000,'2026-05-29','Belum Bayar','2026-05-02 16:24:28'),
(315,'INV-052026-044',63,'Mei 2026',110000,'2026-05-16','Lunas','2026-05-02 16:24:28'),
(316,'INV-052026-045',64,'Mei 2026',110000,'2026-05-06','Lunas','2026-05-02 16:24:28'),
(317,'INV-052026-046',66,'Mei 2026',110000,'2026-05-07','Lunas','2026-05-02 16:24:28'),
(318,'INV-052026-047',67,'Mei 2026',110000,'2026-05-03','Lunas','2026-05-02 16:24:28'),
(319,'INV-052026-048',68,'Mei 2026',110000,'2026-05-09','Lunas','2026-05-02 16:24:28'),
(320,'INV-052026-049',72,'Mei 2026',110000,'2026-05-20','Belum Bayar','2026-05-02 16:24:28'),
(321,'INV-052026-050',73,'Mei 2026',110000,'2026-05-20','Belum Bayar','2026-05-02 16:24:28'),
(322,'INV-052026-051',75,'Mei 2026',110000,'2026-05-21','Belum Bayar','2026-05-02 16:24:28'),
(323,'INV-052026-052',79,'Mei 2026',110000,'2026-05-03','Lunas','2026-05-02 16:24:28'),
(324,'INV-052026-053',82,'Mei 2026',110000,'2026-05-29','Lunas','2026-05-02 16:24:28'),
(325,'INV-052026-054',83,'Mei 2026',110000,'2026-05-30','Lunas','2026-05-02 16:24:28'),
(326,'INV-052026-055',86,'Mei 2026',110000,'2026-05-17','Lunas','2026-05-02 16:24:28'),
(327,'INV-052026-056',87,'Mei 2026',110000,'2026-05-17','Belum Bayar','2026-05-02 16:24:28'),
(328,'INV-052026-057',88,'Mei 2026',110000,'2026-05-17','Belum Bayar','2026-05-02 16:24:28'),
(329,'INV-052026-058',89,'Mei 2026',110000,'2026-05-24','Belum Bayar','2026-05-02 16:24:28'),
(330,'INV-052026-059',90,'Mei 2026',110000,'2026-05-24','Belum Bayar','2026-05-02 16:24:28'),
(331,'INV-052026-060',91,'Mei 2026',110000,'2026-05-25','Belum Bayar','2026-05-02 16:24:28'),
(332,'INV-052026-061',92,'Mei 2026',110000,'2026-05-25','Belum Bayar','2026-05-02 16:24:28'),
(333,'INV-052026-062',93,'Mei 2026',110000,'2026-05-25','Belum Bayar','2026-05-02 16:24:28'),
(334,'INV-052026-063',94,'Mei 2026',110000,'2026-05-29','Belum Bayar','2026-05-02 16:24:28'),
(335,'INV-052026-064',95,'Mei 2026',110000,'2026-05-29','Belum Bayar','2026-05-02 16:24:28'),
(336,'INV-052026-065',96,'Juni 2026',110000,'2026-06-01','Belum Bayar','2026-05-02 16:24:28'),
(337,'INV-052026-066',39,'Mei 2026',145000,'2026-05-04','Lunas','2026-05-02 16:24:28'),
(338,'INV-052026-067',77,'Juni 2026',145000,'2026-05-31','Lunas','2026-05-02 16:24:28'),
(339,'INV-052026-068',42,'Mei 2026',195000,'2026-05-08','Lunas','2026-05-02 16:24:28'),
(340,'INV-052026-069',59,'Mei 2026',195000,'2026-05-17','Belum Bayar','2026-05-02 16:24:28'),
(341,'INV-052026-070',60,'Mei 2026',195000,'2026-05-20','Belum Bayar','2026-05-02 16:24:28');
/*!40000 ALTER TABLE `tagihan` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-16  6:40:04
