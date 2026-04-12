-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 12, 2026 at 01:04 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `billing_internet`
--

-- --------------------------------------------------------

--
-- Table structure for table `karyawan`
--

CREATE TABLE `karyawan` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','bendahara','karyawan') DEFAULT 'karyawan',
  `telepon` varchar(20) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `aktif` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `gaji` decimal(15,0) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `karyawan`
--

INSERT INTO `karyawan` (`id`, `nama`, `email`, `password`, `role`, `telepon`, `alamat`, `foto`, `aktif`, `created_at`, `gaji`) VALUES
(1, 'Tino', 'admin@tam.net', '$2b$10$7wEydIVv.oJocs55iHsqeeJMbDR5YS/qgIroGsVslPqPXeKgsw8C2', 'admin', '08986355829', 'Serut Tapan Kedungwaru Tulungagung', NULL, 1, '2026-03-18 07:49:04', 0),
(2, 'Tiko', 'tiko@tam.net', '$2b$10$c8NnqipsKImf3ty3TIivV.QjjPYf6J4UgI7bjriSzbQ29NOQ3q4JK', 'bendahara', '082332323345', 'Serut Tapan Kedungwaru Tulungagung', NULL, 1, '2026-03-18 07:49:04', 1500000),
(3, 'Pardan', 'pardan@tam.net', '$2b$10$2zGUnKQ/dc9e9pWNCFTkKux4vl7XgFO8NjxJX1KWTUYU7hYzLlLMq', 'karyawan', '098989898787878', 'Plandaan Kedungwaru Tulungagung', NULL, 1, '2026-03-18 07:49:04', 800000),
(4, 'Mas Pras', 'pras@tam.net', '$2b$10$7Aaq5sB4Tw9Xa24olVeCmOcC7ctpcSjlptIOZspJ4AU79.965kSxO', 'karyawan', '0898989787878432', 'Serut Tapan Kedungwaru Tulungagung', NULL, 1, '2026-03-18 14:41:30', 800000);

-- --------------------------------------------------------

--
-- Table structure for table `paket`
--

CREATE TABLE `paket` (
  `id` int(11) NOT NULL,
  `nama_paket` varchar(100) NOT NULL,
  `kecepatan` int(11) NOT NULL COMMENT 'Mbps',
  `harga` decimal(12,0) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `paket`
--

INSERT INTO `paket` (`id`, `nama_paket`, `kecepatan`, `harga`, `deskripsi`, `created_at`) VALUES
(1, 'Paket Starter 15M', 15, 110000, 'Cocok untuk 1-2 perangkat rumahan', '2026-03-18 00:33:28'),
(2, 'Paket Keluarga 25M', 25, 145000, 'Streaming & browsing seluruh keluarga', '2026-03-18 00:33:28'),
(3, 'Paket Rumahan 35M', 35, 175000, 'Gaming & kerja dari rumah', '2026-03-18 00:33:28'),
(4, 'Paket Bisnis 65M', 65, 195000, 'Performa maksimal untuk bisnis', '2026-03-18 00:33:28');

-- --------------------------------------------------------

--
-- Table structure for table `pelanggan`
--

CREATE TABLE `pelanggan` (
  `id` int(11) NOT NULL,
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
  `longitude` decimal(11,8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pelanggan`
--

INSERT INTO `pelanggan` (`id`, `nama`, `email`, `telepon`, `alamat`, `ip_address`, `id_paket`, `status`, `tgl_bergabung`, `created_at`, `pppoe_username`, `pppoe_password`, `mikrotik_id`, `status_online`, `last_online_check`, `offline_notified`, `offline_since`, `latitude`, `longitude`) VALUES
(8, 'karjito-donorejo', '', '085704857720', 'DS.tapan dsn.donorejo', '192.168.14.248', 1, 'Aktif', '2025-12-20', '2026-03-19 03:00:41', 'karjito-donorejo', 'qwerty', '*2', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02907958, 111.92142905),
(9, 'sumarti-donorejo', '', '085235224533', 'DS.tapan dsn.donorejo', '192.168.14.243', 1, 'Aktif', '2025-12-19', '2026-03-19 03:00:41', 'sumarti-donorejo', 'qwerty', '*3', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02909673, 111.92127751),
(10, 'wartini-donorejo', '', '081233628355', 'DS.tapan dsn.donorejo', '192.168.14.206', 1, 'Aktif', '2025-12-19', '2026-03-19 03:00:41', 'wartini-donorejo', 'qwerty', '*4', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02907281, 111.92138254),
(11, 'rifky-donorejo', '', '087859110125', 'DS.tapan dsn.donorejo', '192.168.14.224', 1, 'Aktif', '2025-12-20', '2026-03-19 03:00:41', 'rifky-donorejo', 'qwerty', '*6', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02773710, 111.92258920),
(12, 'sundari-donorejo', '', '0895635405624', 'DS Tapan dsn.donorejo', '192.168.14.246', 1, 'Aktif', '2025-12-19', '2026-03-19 03:00:41', 'sundari-donorejo', 'qwerty', '*7', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02804199, 111.92210290),
(13, 'ikodewanto-donorejo', '', '085755110810', 'DS.tapan dsn.donorejo', '192.168.14.196', 1, 'Aktif', '2026-01-20', '2026-03-19 03:00:41', 'ikodewanto-donorejo', 'qwerty', '*9', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02915665, 111.92071609),
(14, 'adit-donorejo', '', '085330308103', 'Donorejo Tapan Kedungwaru Tulungagung', '192.168.14.226', 1, 'Aktif', '2026-03-16', '2026-03-19 03:00:41', 'adit-donorejo', 'qwerty', '*A', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02703087, 111.92253097),
(15, 'roni-donorejo', '', '081235808018', 'DS.tapan dsn.donorejo', '192.168.14.247', 1, 'Aktif', '2025-12-19', '2026-03-19 03:00:41', 'roni-donorejo', 'qwerty', '*B', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02883967, 111.92290395),
(16, 'agus-donorejo', '', '082333245894', 'DS.tapan dsn.donoreko', '192.168.14.225', 1, 'Aktif', '2025-12-06', '2026-03-19 03:00:41', 'agus-donorejo', 'qwerty', '*C', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.03196419, 111.91830167),
(17, 'lucky-donorejo', '', '081231669238', 'DS.tapan dsn.donorejo', '192.168.14.231', 1, 'Aktif', '2025-12-20', '2026-03-19 03:00:41', 'lucky-donorejo', 'qwerty', '*D', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02848375, 111.92303391),
(18, 'eka-donorejo', '', '081615649731', 'DS.tapan dsn.donorejo', '192.168.14.202', 1, 'Aktif', '2025-12-20', '2026-03-19 03:00:41', 'eka-donorejo', 'qwerty', '*E', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02838533, 111.92306839),
(19, 'oky-donorejo', '', '082282822012', 'DS.tapan dsn.donorejo', '192.168.14.234', 1, 'Aktif', '2025-12-06', '2026-03-19 03:00:41', 'oky-donorejo', 'qwerty', '*F', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.03178128, 111.91864717),
(20, 'koko-serut', '', '081335957785', 'DS.tapan dsn.serut', '192.168.14.229', 1, 'Aktif', '2025-12-20', '2026-03-19 03:00:41', 'koko-serut', 'qwerty', '*11', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02578263, 111.92325391),
(21, 'yitno-serut', '', '081234722670', 'DS Tapan dsn.serut', '192.168.14.204', 1, 'Aktif', '2026-01-19', '2026-03-19 03:00:41', 'yitno-serut', 'qwerty', '*12', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02571505, 111.92308797),
(22, 'ayu-serut', '', '085806531059', 'DS Tapan dsn.serut', '192.168.14.212', 1, 'Aktif', '2026-01-20', '2026-03-19 03:00:41', 'ayu-serut', 'qwerty', '*13', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02579185, 111.92305941),
(23, 'ririn-donorejo', '', '081219156768', 'DS Tapan dsn.donorejo', '192.168.14.232', 1, 'Aktif', '2026-01-19', '2026-03-19 03:00:41', 'ririn-donorejo', 'qwerty', '*16', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02667414, 111.92142499),
(24, 'bima-donorejo', '', '081775127217', 'DS Tapan dsn.donorejo', '192.168.14.197', 1, 'Aktif', '2026-01-24', '2026-03-19 03:00:41', 'bima-donorejo', 'qwerty', '*17', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02760530, 111.92231562),
(25, 'heru-serut', '', '081231503813', 'DS.tapan dsn.serut081231503813', '192.168.14.211', 1, 'Aktif', '2026-01-25', '2026-03-19 03:00:41', 'heru-serut', 'qwerty', '*18', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02609688, 111.92275468),
(26, 'ulik-serut', '', '080000', 'DS.tapan dsn.seru', '192.168.14.208', 1, 'Aktif', '2026-01-24', '2026-03-19 03:00:41', 'ulik-serut', 'qwerty', '*19', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02609100, 111.92267918),
(27, 'marno-donorejo', '', '-', 'DS.tapan dsn.donorejo', '192.168.14.199', 1, 'Aktif', '2025-12-31', '2026-03-19 03:00:41', 'marno-donorejo', 'qwerty', '*1A', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02674850, 111.92290509),
(28, 'noko-donorejo', '', '081233529499', 'DS.tapan dsn.donorejo', '192.168.14.238', 1, 'Aktif', '2026-01-01', '2026-03-19 03:00:41', 'noko-donorejo', 'qwerty', '*1B', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02854040, 111.92237166),
(30, 'rembo-donorejo', '', '085706585895', 'DS.tapan dsn.donorejo', '192.168.14.205', 1, 'Aktif', '2025-12-31', '2026-03-19 03:00:41', 'rembo-donorejo', 'qwerty', '*1D', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02910359, 111.92194198),
(31, 'retno-donorejo', '', '085790248589', 'DS.taoan dsn.donorejo', '192.168.14.217', 1, 'Aktif', '2026-01-03', '2026-03-19 03:00:41', 'retno-donorejo', 'qwerty', '*1E', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.03071484, 111.92244956),
(32, 'doni-serut', '', '085829315569', 'DS.tapan dsn.serut', '192.168.14.198', 1, 'Aktif', '2026-02-27', '2026-03-19 03:00:41', 'doni-serut', 'qwerty', '*1F', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02374063, 111.92246821),
(33, 'halimah-donorejo', '', '085735588885', 'DS.tapan dsn.donorejo', '192.168.14.222', 1, 'Aktif', '2025-12-31', '2026-03-19 03:00:41', 'halimah-donorejo', 'qwerty', '*20', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.03055065, 111.92195942),
(34, 'sindy-donorejo', '', '085852800341', 'DS.Tapan dsn.donorejo', '192.168.14.207', 1, 'Aktif', '2025-12-31', '2026-03-19 03:00:41', 'sindy-donorejo', 'qwerty', '*21', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.03053154, 111.92203813),
(36, 'doni-donorejo', '', '082140023976', 'DS.tapan dsn.donorejo', '192.168.14.239', 1, 'Aktif', '2025-12-31', '2026-03-19 03:00:42', 'doni-donorejo', 'qwerty', '*24', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.03076251, 111.92234383),
(37, 'pakdi-donorejo', '', '081249143430', 'Ds.tapan dsn.donorejo', '192.168.14.210', 1, 'Aktif', '2026-01-01', '2026-03-19 03:00:42', 'pakdi-donorejo', 'qwerty', '*26', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02906848, 111.92381066),
(38, 'koirul-donorejo', '', '085707340557', 'Ds.tapan dsn serut', '192.168.14.235', 1, 'Aktif', '2026-01-02', '2026-03-19 03:00:42', 'koirul-donorejo', 'qwerty', '*27', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.03049619, 111.92356417),
(39, 'fani-serut', '', '081333370550', 'Ds.tapan dsn.serut', '192.168.14.209', 2, 'Aktif', '2026-01-02', '2026-03-19 03:00:42', 'fani-serut', 'qwerty', '*28', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02338525, 111.92628779),
(40, 'sunar-donorejo', '', '0895808065030', 'Ds.tapan dsn.serut', '192.168.14.251', 1, 'Aktif', '2026-01-04', '2026-03-19 03:00:42', 'sunar-donorejo', 'qwerty', '*29', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02816090, 111.92249198),
(41, 'elsa-donorejo', '', '085215893150', 'Da.tapan dsn.serut', '192.168.14.227', 1, 'Aktif', '2026-01-06', '2026-03-19 03:00:42', 'elsa-donorejo', 'qwerty', '*2A', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02813723, 111.92265237),
(42, 'woro-donorejo', '', '082138336571', 'DS.tapan dsn.donorejo', '192.168.14.240', 4, 'Aktif', '2026-01-06', '2026-03-19 03:00:42', 'woro-donorejo', 'qwerty', '*2B', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02830613, 111.92258112),
(43, 'angga-donorejo', '', '085708260649', 'DS Tapan dsn.donorejo', '192.168.14.242', 1, 'Aktif', '2026-01-14', '2026-03-19 03:00:42', 'angga-donorejo', 'qwerty', '*2C', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02858338, 111.92210230),
(44, 'tino-l2tp', '', '08986355829', '', '', NULL, 'Aktif', '2026-03-18', '2026-03-19 03:00:42', 'tino-l2tp', 'tinocaem', '*2E', 'Offline', '2026-04-12 18:02:01', 0, NULL, NULL, NULL),
(45, 'suyoto-donorejo', '', '085649177378', 'DS Tapan dsn.donorejo', '192.168.14.220', 1, 'Aktif', '2026-01-19', '2026-03-19 03:00:42', 'suyoto-donorejo', 'qwerty', '*2F', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02893644, 111.92215583),
(46, 'jose-donorejo', '', '085606583465', 'DS Tapan dsn.donorejo', '192.168.14.254', 1, 'Aktif', '2026-01-21', '2026-03-19 03:00:42', 'jose-donorejo', 'qwerty', '*30', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02889824, 111.92208531),
(47, 'bangkit-donorejo', '', '081335962651', 'DS.tapan dsn.donorejo', '192.168.14.214', 1, 'Aktif', '2026-01-22', '2026-03-19 03:00:42', 'bangkit-donorejo', 'qwerty', '*31', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02854155, 111.92213193),
(48, 'rio-donorejo', '', '0895985316206', 'DS.tapan dsn.donorejo', '192.168.14.221', 1, 'Aktif', '2026-01-22', '2026-03-19 03:00:42', 'rio-donorejo', 'qwerty', '*32', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02849556, 111.92212843),
(49, 'wira-serut', '', '081252394492', 'DS.tapan dsn.serut', '192.168.14.250', 1, 'Aktif', '2026-02-01', '2026-03-19 03:00:42', 'wira-serut', 'qwerty', '*33', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02652106, 111.92448958),
(50, 'bayu-donorejo', '', '088991345286', 'DS.tapan dsn.donorejo', '192.168.14.236', 1, 'Aktif', '2026-02-02', '2026-03-19 03:00:42', 'bayu-donorejo', 'qwerty', '*34', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.03221938, 111.91829595),
(51, 'malik-donorejo', '', '085274431967', 'DS.tapan dsn.donorejo', '192.168.14.213', 1, 'Aktif', '2026-02-24', '2026-03-19 03:00:42', 'malik-donorejo', 'qwerty', '*35', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02787425, 111.92199730),
(52, 'silvi-rejoagung', NULL, '-', NULL, '', NULL, 'Aktif', '2026-03-19', '2026-03-19 03:00:42', 'silvi-rejoagung', 'qwerty', '*37', 'Offline', '2026-04-12 18:02:01', 0, NULL, NULL, NULL),
(54, 'daat-serut', '', '082232425411', 'DS Tapan dsn.serut', '192.168.14.245', 1, 'Aktif', '2026-02-12', '2026-03-19 03:00:42', 'daat-serut', 'qwerty', '*39', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02509562, 111.92523258),
(56, 'anjani-donorejo', '', '0895627884856', 'DS Tapan dsn.donorejo', '192.168.14.244', 1, 'Aktif', '2026-02-16', '2026-03-19 03:00:42', 'anjani-donorejo', 'qwerty', '*3B', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.03214894, 111.91815230),
(57, 'spensakandat', NULL, '-', NULL, '192.167.100.2', NULL, 'Aktif', '2026-03-19', '2026-03-19 03:00:42', 'spensakandat', 'kandat', '*3C', 'Online', '2026-04-12 18:02:01', 0, NULL, NULL, NULL),
(58, 'fardan-remote', NULL, '-', NULL, '10.10.10.2', NULL, 'Aktif', '2026-03-19', '2026-03-19 03:00:42', 'fardan-remote', '123', '*41', 'Offline', '2026-04-12 18:02:01', 0, NULL, NULL, NULL),
(59, 'erik-donorejo', '', '081515799232', 'DS.tapan dsn.donorejo', '192.168.14.253', 4, 'Aktif', '2026-02-15', '2026-03-19 03:00:42', 'erik-donorejo', 'qwerty', '*42', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02575438, 111.92072619),
(60, 'kemenag-tulungagung', '', '085649819752', 'DS rejoagung', '192.168.14.200', 4, 'Aktif', '2026-01-18', '2026-03-19 03:00:42', 'kemenag-tulungagung', 'qwerty', '*43', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.04493870, 111.91187879),
(61, 'sapii-donorejo', '', '085265641413', 'DS.tapan dsn.donorejo', '192.168.14.219', 1, 'Aktif', '2026-04-27', '2026-03-19 03:00:42', 'sapii-donorejo', 'qwerty', '*44', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.03200903, 111.91800329),
(62, 'devi-serut', '', '081330388522', 'DS.tapan dsn.serut', '192.168.14.233', 1, 'Aktif', '2026-04-27', '2026-03-19 03:00:42', 'devi-serut', 'qwerty', '*45', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02588532, 111.92326155),
(63, 'adi-serut', '', '085732593605', 'DS.tapan dsn.donorejo', '192.168.14.249', 1, 'Aktif', '2026-03-14', '2026-03-19 03:00:42', 'adi-serut', 'qwerty', '*46', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02535540, 111.92318470),
(64, 'ridwan-donorejo', '', '085859820481', 'DS Tapan dsn.donorejo', '192.168.14.201', 1, 'Aktif', '2026-04-04', '2026-03-19 03:00:42', 'ridwan-donorejo', 'qwerty', '*47', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02966832, 111.92197202),
(66, 'afan-donorejo', '', '081334462306', 'DS.tapan dsn.donorejo', '192.168.14.223', 1, 'Aktif', '2026-03-05', '2026-03-19 03:00:42', 'afan-donorejo', 'qwerty', '*4B', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.03174074, 111.92275077),
(67, 'gito-donorejo', '', '081335243982', 'DS Tapan dsn.donorejo', '192.168.14.216', 1, 'Aktif', '2026-03-01', '2026-03-19 03:00:42', 'gito-donorejo', 'qwerty', '*4C', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.03030648, 111.92178669),
(68, 'wahyu-donorejo', '', '085852698628', 'DS.tapan dsn.donorejo', '192.168.14.252', 1, 'Aktif', '2026-04-07', '2026-03-19 03:00:42', 'wahyu-donorejo', 'qwerty', '*4D', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.03005781, 111.92078763),
(69, 'tiko-serut', NULL, '-', NULL, '192.168.14.230', NULL, 'Aktif', '2026-03-19', '2026-03-19 03:00:42', 'tiko-serut', 'qwerty', '*4E', 'Online', '2026-04-12 18:02:01', 0, NULL, NULL, NULL),
(71, 'smkn1-grogol', NULL, '-', NULL, '192.167.100.3', NULL, 'Aktif', '2026-03-19', '2026-03-19 03:00:42', 'smkn1-grogol', 'grogol', '*53', 'Online', '2026-04-12 18:02:01', 0, NULL, NULL, NULL),
(72, 'yogo-donorejo', '', '081216121187', 'DS.tapan dsn.donorejo', '192.168.14.215', 1, 'Aktif', '2026-04-18', '2026-03-19 03:00:42', 'yogo-donorejo', 'qwerty', '*54', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02851660, 111.92233048),
(73, 'fajar-donorejo', '', '089536726189', 'DS.tapan dsn.donorejo', '192.168.14.241', 1, 'Aktif', '2026-04-18', '2026-03-19 03:00:42', 'fajar-donorejo', 'qwerty', '*55', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02842965, 111.92216901),
(75, 'bagus-donorejo', '', ' 085232183511', 'DS.tapan dsn.donorejo', '192.168.14.203', 1, 'Aktif', '2026-03-19', '2026-03-24 13:34:12', 'bagus-donorejo', 'qwerty', '*56', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02945661, 111.92171005),
(77, 'sella-donorejo', '', '085607784961', '', '192.168.14.195', 2, 'Aktif', '2026-03-29', '2026-04-02 11:43:08', 'sella-donorejo', 'qwerty', '*57', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02790496, 111.92131690),
(79, 'amel-donorejo', '', '08973416457', 'ds.tapan dsn.serut', '192.168.14.218', 1, 'Aktif', '2026-01-01', '2026-04-06 10:14:02', 'amel-donorejo', 'qwerty', '*23', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.03044948, 111.92215770),
(81, 'smariduta-olt', NULL, '-', NULL, '192.167.100.4', NULL, 'Aktif', '2026-04-06', '2026-04-06 10:14:02', 'smariduta-olt', 'smariduta', '*58', 'Online', '2026-04-12 18:02:01', 0, NULL, NULL, NULL),
(82, 'riyanto-donorejo', '', '085745696697', 'ds.tapan dsn.serut', '192.168.14.228', 1, 'Aktif', '2026-02-27', '2026-04-06 10:27:50', 'riyanto-donorejo', 'qwerty', '*4F', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02975859, 111.92187998),
(83, 'bojes-donorejo', '', '085655754855', 'ds.tapan dsn.serut', '192.168.14.237', 1, 'Aktif', '2026-03-28', '2026-04-06 10:30:23', 'bojes-donorejo', 'qwerty', '*4A', 'Online', '2026-04-12 18:02:01', 0, NULL, -8.02980343, 111.92171292),
(84, 'hermin-rejoagung_titipan', NULL, '-', NULL, '', NULL, 'Aktif', '2026-04-07', '2026-04-07 11:08:17', 'hermin-rejoagung_titipan', 'qwerty', '*38', 'Offline', '2026-04-12 18:02:01', 0, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `pemasukan`
--

CREATE TABLE `pemasukan` (
  `id` int(11) NOT NULL,
  `kategori` varchar(50) NOT NULL,
  `jumlah` decimal(15,2) NOT NULL,
  `tgl_pemasukan` date NOT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pemasukan`
--

INSERT INTO `pemasukan` (`id`, `kategori`, `jumlah`, `tgl_pemasukan`, `keterangan`, `created_at`) VALUES
(1, 'Langganan', 240000.00, '2026-03-26', 'Pembayaran titipan', '2026-03-26 05:18:53'),
(4, 'Langganan', 85000.00, '2026-04-11', 'Andik-kras', '2026-04-11 14:28:01'),
(5, 'Langganan', 240000.00, '2026-04-11', 'Titipan cln', '2026-04-11 14:33:47');

-- --------------------------------------------------------

--
-- Table structure for table `pembayaran`
--

CREATE TABLE `pembayaran` (
  `id` int(11) NOT NULL,
  `id_tagihan` int(11) NOT NULL,
  `jumlah` decimal(12,0) NOT NULL,
  `metode` enum('Transfer Bank','Tunai','QRIS','E-Wallet') DEFAULT 'Tunai',
  `tgl_bayar` datetime DEFAULT current_timestamp(),
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pembayaran`
--

INSERT INTO `pembayaran` (`id`, `id_tagihan`, `jumlah`, `metode`, `tgl_bayar`, `keterangan`, `created_at`) VALUES
(28, 140, 195000, 'Tunai', '2026-03-21 00:00:00', 'Pembayaran INV-032026-057', '2026-03-21 04:10:10'),
(29, 125, 110000, 'Tunai', '2026-03-21 00:00:00', 'Pembayaran INV-032026-042', '2026-03-21 04:10:16'),
(30, 124, 110000, 'Tunai', '2026-03-21 00:00:00', 'Pembayaran INV-032026-041', '2026-03-21 04:10:52'),
(31, 122, 110000, 'Tunai', '2026-03-21 00:00:00', 'Pembayaran INV-032026-039', '2026-03-21 04:11:00'),
(32, 117, 110000, 'Tunai', '2026-03-21 00:00:00', 'Pembayaran INV-032026-034', '2026-03-21 04:11:21'),
(33, 116, 110000, 'Tunai', '2026-03-21 00:00:00', 'Pembayaran INV-032026-033', '2026-03-21 04:11:29'),
(34, 115, 110000, 'Tunai', '2026-03-21 00:00:00', 'Pembayaran INV-032026-032', '2026-03-21 04:11:33'),
(35, 114, 110000, 'Tunai', '2026-03-21 00:00:00', 'Pembayaran INV-032026-031', '2026-03-21 04:11:38'),
(36, 139, 195000, 'Tunai', '2026-03-21 00:00:00', 'Pembayaran INV-032026-056', '2026-03-21 04:11:47'),
(37, 138, 195000, 'Tunai', '2026-03-21 00:00:00', 'Pembayaran INV-032026-055', '2026-03-21 04:11:55'),
(38, 137, 145000, 'Tunai', '2026-03-21 00:00:00', 'Pembayaran INV-032026-054', '2026-03-21 04:12:00'),
(39, 128, 110000, 'Tunai', '2026-03-21 00:00:00', 'Pembayaran INV-032026-045', '2026-03-21 04:12:22'),
(40, 135, 110000, 'Tunai', '2026-03-21 00:00:00', 'Pembayaran INV-032026-052', '2026-03-21 14:21:37'),
(41, 131, 110000, 'Tunai', '2026-03-21 00:00:00', 'Pembayaran INV-032026-048', '2026-03-21 14:21:43'),
(42, 133, 110000, 'Tunai', '2026-03-21 00:00:00', 'Pembayaran INV-032026-050', '2026-03-21 14:21:57'),
(44, 112, 110000, 'Tunai', '2026-03-22 00:00:00', 'Pembayaran INV-032026-029', '2026-03-22 01:31:34'),
(45, 113, 110000, 'Tunai', '2026-03-22 00:00:00', 'Pembayaran INV-032026-030', '2026-03-22 01:32:14'),
(46, 111, 110000, 'Tunai', '2026-03-22 00:00:00', 'Pembayaran INV-032026-028', '2026-03-22 01:32:45'),
(47, 95, 110000, 'Tunai', '2026-03-22 00:00:00', 'Pembayaran INV-032026-012', '2026-03-22 01:33:05'),
(48, 92, 110000, 'Tunai', '2026-03-22 00:00:00', 'Pembayaran INV-032026-009', '2026-03-22 01:33:13'),
(50, 109, 110000, 'Tunai', '2026-03-22 00:00:00', 'Pembayaran INV-032026-026', '2026-03-22 01:33:26'),
(51, 108, 110000, 'Tunai', '2026-03-22 00:00:00', 'Pembayaran INV-032026-025', '2026-03-22 01:33:36'),
(52, 106, 110000, 'Tunai', '2026-03-22 00:00:00', 'Pembayaran INV-032026-023', '2026-03-22 01:33:50'),
(53, 104, 110000, 'Tunai', '2026-03-22 00:00:00', 'Pembayaran INV-032026-021', '2026-03-22 01:34:56'),
(54, 103, 110000, 'Tunai', '2026-03-22 00:00:00', 'Pembayaran INV-032026-020', '2026-03-22 01:35:05'),
(55, 99, 110000, 'Tunai', '2026-03-22 00:00:00', 'Pembayaran INV-032026-016', '2026-03-22 01:36:04'),
(56, 84, 110000, 'Tunai', '2026-03-22 00:00:00', 'Pembayaran INV-032026-001', '2026-03-22 01:36:10'),
(57, 121, 110000, 'Tunai', '2026-03-25 00:00:00', 'Pembayaran INV-032026-038', '2026-03-25 09:40:51'),
(58, 126, 110000, 'Tunai', '2026-03-25 00:00:00', 'Pembayaran INV-032026-043', '2026-03-25 09:41:12'),
(59, 127, 110000, 'Tunai', '2026-03-25 00:00:00', 'Pembayaran INV-032026-044', '2026-03-25 09:41:15'),
(60, 129, 110000, 'Tunai', '2026-03-25 00:00:00', 'Pembayaran INV-032026-046', '2026-03-25 09:41:30'),
(61, 96, 110000, 'Tunai', '2026-03-25 00:00:00', 'Pembayaran INV-032026-013', '2026-03-25 09:41:40'),
(62, 94, 110000, 'Tunai', '2026-03-25 00:00:00', 'Pembayaran INV-032026-011', '2026-03-25 09:41:55'),
(63, 93, 110000, 'Tunai', '2026-03-25 00:00:00', 'Pembayaran INV-032026-010', '2026-03-25 09:42:09'),
(64, 88, 110000, 'Tunai', '2026-03-25 00:00:00', 'Pembayaran INV-032026-005', '2026-03-25 09:42:21'),
(65, 87, 110000, 'Tunai', '2026-03-25 00:00:00', 'Pembayaran INV-032026-004', '2026-03-25 09:42:35'),
(66, 85, 110000, 'Tunai', '2026-03-25 00:00:00', 'Pembayaran INV-032026-002', '2026-03-25 09:42:51'),
(67, 86, 110000, 'Tunai', '2026-03-25 00:00:00', 'Pembayaran INV-032026-003', '2026-03-25 09:42:56'),
(68, 91, 110000, 'Tunai', '2026-03-25 00:00:00', 'Pembayaran INV-032026-008', '2026-03-25 09:43:03'),
(69, 97, 110000, 'Tunai', '2026-03-25 00:00:00', 'Pembayaran INV-032026-014', '2026-03-25 09:43:09'),
(70, 98, 110000, 'Tunai', '2026-03-25 00:00:00', 'Pembayaran INV-032026-015', '2026-03-25 09:43:15'),
(71, 89, 110000, 'Tunai', '2026-03-30 00:00:00', 'Pembayaran INV-032026-006', '2026-03-30 06:41:51'),
(72, 123, 110000, 'Tunai', '2026-03-30 00:00:00', 'Pembayaran INV-032026-040', '2026-03-30 06:42:12'),
(73, 120, 110000, 'Tunai', '2026-03-30 00:00:00', 'Pembayaran INV-032026-037', '2026-03-30 06:42:19'),
(74, 119, 110000, 'Tunai', '2026-03-30 00:00:00', 'Pembayaran INV-032026-036', '2026-03-30 06:42:23'),
(75, 102, 110000, 'Tunai', '2026-03-30 00:00:00', 'Pembayaran INV-032026-019', '2026-03-30 06:42:34'),
(76, 101, 110000, 'Tunai', '2026-03-30 00:00:00', 'Pembayaran INV-032026-018', '2026-03-30 06:42:39'),
(77, 100, 110000, 'Tunai', '2026-03-30 00:00:00', 'Pembayaran INV-032026-017', '2026-03-30 06:42:44'),
(78, 118, 110000, 'Tunai', '2026-03-30 00:00:00', 'Pembayaran INV-032026-035', '2026-03-30 12:34:22'),
(79, 107, 110000, 'Tunai', '2026-03-31 00:00:00', 'Pembayaran INV-032026-024', '2026-03-31 08:03:25'),
(80, 165, 110000, 'Tunai', '2026-04-01 17:00:00', 'Pembayaran INV-042026-025', '2026-04-01 07:16:12'),
(81, 163, 110000, 'Tunai', '2026-04-01 17:00:00', 'Pembayaran INV-042026-023', '2026-04-01 07:33:06'),
(82, 105, 110000, 'Tunai', '2026-04-01 17:00:00', 'Pembayaran INV-032026-022', '2026-04-01 11:32:35'),
(83, 168, 110000, 'Tunai', '2026-04-01 17:00:00', 'Pembayaran INV-042026-028', '2026-04-01 11:49:04'),
(85, 166, 110000, 'Tunai', '2026-04-01 17:00:00', 'Pembayaran INV-042026-026', '2026-04-01 11:49:58'),
(88, 200, 145000, 'Tunai', '2026-04-02 00:00:00', 'Pembayaran INV-2604-117', '2026-04-02 11:48:07'),
(92, 90, 110000, 'Tunai', '2026-04-02 00:00:00', 'Pembayaran INV-032026-007', '2026-04-02 11:56:21'),
(95, 132, 110000, 'Tunai', '2026-04-02 00:00:00', 'Pembayaran INV-032026-049', '2026-04-02 12:51:38'),
(96, 170, 110000, 'Tunai', '2026-04-03 00:00:00', 'Pembayaran INV-042026-030', '2026-04-03 03:21:48'),
(97, 195, 145000, 'Tunai', '2026-04-03 00:00:00', 'Pembayaran INV-042026-055', '2026-04-03 03:22:00'),
(98, 169, 110000, 'Tunai', '2026-04-03 00:00:00', 'Pembayaran INV-042026-029', '2026-04-03 03:22:17'),
(99, 161, 110000, 'Tunai', '2026-04-03 00:00:00', 'Pembayaran INV-042026-021', '2026-04-03 12:26:13'),
(100, 160, 110000, 'Tunai', '2026-04-04 00:00:00', 'Pembayaran INV-042026-020', '2026-04-04 06:32:12'),
(101, 149, 110000, 'Tunai', '2026-04-04 00:00:00', 'Pembayaran INV-042026-009', '2026-04-04 10:13:32'),
(102, 186, 110000, 'Tunai', '2026-04-05 00:00:00', 'Pembayaran INV-042026-046', '2026-04-05 05:45:15'),
(103, 201, 110000, 'Tunai', '2026-04-06 00:00:00', 'Pembayaran INV-042026-059', '2026-04-06 10:17:27'),
(105, 172, 110000, 'Tunai', '2026-04-06 00:00:00', 'Pembayaran INV-042026-032', '2026-04-06 10:39:50'),
(106, 269, 110000, 'Tunai', '2026-04-06 00:00:00', 'Pembayaran INV-2604-112', '2026-04-06 10:51:56'),
(107, 270, 110000, 'Tunai', '2026-04-06 00:00:00', 'Pembayaran INV-2604-113', '2026-04-06 10:52:09'),
(108, 185, 110000, 'Tunai', '2026-04-07 00:00:00', 'Pembayaran INV-042026-045', '2026-04-07 06:57:44'),
(109, 196, 195000, 'Tunai', '2026-04-09 00:00:00', 'Pembayaran INV-042026-056', '2026-04-09 11:07:41'),
(110, 152, 110000, 'Tunai', '2026-04-09 00:00:00', 'Pembayaran INV-042026-012', '2026-04-09 11:07:50'),
(111, 179, 110000, 'Tunai', '2026-04-09 00:00:00', 'Pembayaran INV-042026-039', '2026-04-09 13:18:57'),
(112, 188, 110000, 'Tunai', '2026-04-09 00:00:00', 'Pembayaran INV-042026-048', '2026-04-09 14:13:57'),
(113, 190, 110000, 'Tunai', '2026-04-10 00:00:00', 'Pembayaran INV-042026-050', '2026-04-10 13:28:30'),
(114, 171, 110000, 'Tunai', '2026-04-10 00:00:00', 'Pembayaran INV-042026-031', '2026-04-10 13:28:45');

-- --------------------------------------------------------

--
-- Table structure for table `pengaturan`
--

CREATE TABLE `pengaturan` (
  `id` int(11) NOT NULL,
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
  `wa_notif_enabled` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pengaturan`
--

INSERT INTO `pengaturan` (`id`, `nama_isp`, `telepon`, `email`, `website`, `alamat`, `logo_url`, `created_at`, `updated_at`, `mikrotik_host`, `mikrotik_user`, `mikrotik_password`, `mikrotik_port`, `wa_api_url`, `wa_api_token`, `wa_notif_enabled`) VALUES
(1, 'TAMnet', '(0355) 123-4567', 'info@netbill.id', 'https://netbill.id', 'Jl. Mawar No. 12, Tulungagung, Jawa Timur', '/uploads/logo-1775916405142.png', '2026-03-18 01:18:53', '2026-04-11 14:06:45', '157.15.67.185', 'tamnet', 'tino2025', 9125, '', '', 1),
(6, 'NetBill Internet Provider', '(0355) 123-4567', 'info@netbill.id', 'https://netbill.id', 'Jl. Mawar No. 12, Tulungagung', NULL, '2026-04-11 13:48:44', '2026-04-11 13:48:44', NULL, NULL, NULL, 8728, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `pengeluaran`
--

CREATE TABLE `pengeluaran` (
  `id` int(11) NOT NULL,
  `kategori` varchar(50) NOT NULL,
  `jumlah` decimal(12,0) NOT NULL,
  `tgl_pengeluaran` date NOT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_karyawan` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pengeluaran`
--

INSERT INTO `pengeluaran` (`id`, `kategori`, `jumlah`, `tgl_pengeluaran`, `keterangan`, `created_at`, `id_karyawan`) VALUES
(1, 'Listrik', 350000, '2026-03-05', 'Tagihan listrik bulan Maret', '2026-04-11 13:48:44', NULL),
(2, 'Peralatan', 700000, '2026-03-20', 'Kabel 1 core\nSplitter 1/8-1pcs\nIsolasi-1pcs\nTies-1pcs', '2026-03-20 16:06:05', NULL),
(3, 'Operasional', 50000, '2026-03-07', 'Tarik jalur odp 130mtr', '2026-03-20 16:06:48', NULL),
(4, 'Operasional', 200000, '2026-03-24', 'THR adit', '2026-03-25 09:32:12', NULL),
(5, 'Operasional', 50000, '2026-03-23', 'Psb gito-donorejo', '2026-03-25 09:46:37', NULL),
(6, 'Operasional', 50000, '2026-03-25', 'Psb wahyu-donorejo', '2026-03-25 09:46:56', NULL),
(7, 'Operasional', 50000, '2026-03-25', 'Psb riyanto-donorejo', '2026-03-25 09:47:12', NULL),
(8, 'Operasional', 50000, '2026-03-23', 'Psb bojes-donorejo', '2026-03-25 09:48:41', NULL),
(9, 'Operasional', 50000, '2026-03-25', 'Psb ridwan-donorejo', '2026-03-25 09:48:59', NULL),
(10, 'Operasional', 50000, '2026-03-25', 'Psb bagus-donorejo', '2026-03-25 09:49:17', NULL),
(11, 'Operasional', 50000, '2026-03-25', 'Psb afan-donorejo', '2026-03-25 09:49:49', NULL),
(12, 'Operasional', 50000, '2026-03-25', 'Psb sapii-donorejo', '2026-03-25 09:50:04', NULL),
(13, 'Operasional', 50000, '2026-03-25', 'Psb devi-serut', '2026-03-25 09:50:19', NULL),
(14, 'Operasional', 50000, '2026-03-25', 'Psb yogo-donorejo', '2026-03-25 09:50:55', NULL),
(15, 'Operasional', 50000, '2026-03-25', 'Psb fajar-donorejo', '2026-03-25 09:51:11', NULL),
(16, 'Pemasaran', 550000, '2026-03-25', 'Fee psb 11', '2026-03-25 09:56:28', NULL),
(19, 'Peralatan', 1500000, '2026-03-31', 'Ke pak Tino beli modem', '2026-03-31 10:21:10', NULL),
(20, 'Gaji', 1500000, '2026-03-05', 'Gaji Tiko', '2026-04-01 00:32:12', 2),
(21, 'Gaji', 800000, '2026-04-01', 'Gaji Mas Pras', '2026-04-01 00:52:44', 4),
(22, 'Operasional', 50000, '2026-04-02', 'Psb sella-donorejo', '2026-04-02 11:50:56', NULL),
(23, 'Pemasaran', 50000, '2026-04-02', 'Fee rembo(sella)', '2026-04-02 11:51:23', NULL),
(24, 'Peralatan', 160000, '2026-04-01', 'beli klem aki 2 set', '2026-04-03 12:40:23', NULL),
(25, 'Peralatan', 90000, '2026-04-04', 'Beli avo meter', '2026-04-04 07:56:56', NULL),
(26, 'Gaji', 1500000, '2026-04-04', 'Gaji Tiko', '2026-04-04 07:57:34', 2),
(27, 'Peralatan', 200000, '2026-04-04', 'Tukar tambah aki', '2026-04-04 17:05:33', NULL),
(28, 'Listrik', 60000, '2026-04-07', 'Alat sanyo otomatis', '2026-04-07 06:58:31', NULL),
(29, 'Operasional', 200000, '2026-04-08', 'Pembayaran alat pak tino', '2026-04-09 13:21:15', NULL),
(30, 'Operasional', 120000, '2026-04-09', 'Solar + minum (maintenance Grogol)', '2026-04-09 13:21:40', NULL),
(31, 'Operasional', 100000, '2026-04-11', 'Solar', '2026-04-11 12:44:05', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `key` varchar(50) NOT NULL,
  `value` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`key`, `value`) VALUES
('alamat', 'Serut Tapan Kedungwaru Tulungagung'),
('denda', '5000'),
('ketua', 'Bapak Pardan'),
('namaRT', 'RT 01'),
('namaRW', 'RW 07'),
('telp', '08986355829');

-- --------------------------------------------------------

--
-- Table structure for table `tagihan`
--

CREATE TABLE `tagihan` (
  `id` int(11) NOT NULL,
  `no_tagihan` varchar(30) NOT NULL,
  `id_pelanggan` int(11) NOT NULL,
  `periode` varchar(30) DEFAULT NULL,
  `jumlah` decimal(12,0) NOT NULL,
  `tgl_jatuh_tempo` date DEFAULT NULL,
  `status` enum('Lunas','Belum Bayar','Terlambat') DEFAULT 'Belum Bayar',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tagihan`
--

INSERT INTO `tagihan` (`id`, `no_tagihan`, `id_pelanggan`, `periode`, `jumlah`, `tgl_jatuh_tempo`, `status`, `created_at`) VALUES
(84, 'INV-032026-001', 8, 'Maret 2026', 110000, '2026-03-21', 'Lunas', '2026-03-21 03:54:21'),
(85, 'INV-032026-002', 9, 'Maret 2026', 110000, '2026-03-22', 'Lunas', '2026-03-21 03:54:21'),
(86, 'INV-032026-003', 10, 'Maret 2026', 110000, '2026-03-22', 'Lunas', '2026-03-21 03:54:21'),
(87, 'INV-032026-004', 11, 'Maret 2026', 110000, '2026-03-22', 'Lunas', '2026-03-21 03:54:21'),
(88, 'INV-032026-005', 12, 'Maret 2026', 110000, '2026-03-22', 'Lunas', '2026-03-21 03:54:21'),
(89, 'INV-032026-006', 13, 'Maret 2026', 110000, '2026-03-22', 'Lunas', '2026-03-21 03:54:21'),
(90, 'INV-032026-007', 14, 'Maret 2026', 110000, '2026-03-20', 'Lunas', '2026-03-21 03:54:21'),
(91, 'INV-032026-008', 15, 'Maret 2026', 110000, '2026-03-22', 'Lunas', '2026-03-21 03:54:21'),
(92, 'INV-032026-009', 16, 'Maret 2026', 110000, '2026-03-09', 'Lunas', '2026-03-21 03:54:21'),
(93, 'INV-032026-010', 17, 'Maret 2026', 110000, '2026-03-22', 'Lunas', '2026-03-21 03:54:21'),
(94, 'INV-032026-011', 18, 'Maret 2026', 110000, '2026-03-22', 'Lunas', '2026-03-21 03:54:21'),
(95, 'INV-032026-012', 19, 'Maret 2026', 110000, '2026-03-09', 'Lunas', '2026-03-21 03:54:21'),
(96, 'INV-032026-013', 20, 'Maret 2026', 110000, '2026-03-22', 'Lunas', '2026-03-21 03:54:21'),
(97, 'INV-032026-014', 21, 'Maret 2026', 110000, '2026-03-22', 'Lunas', '2026-03-21 03:54:21'),
(98, 'INV-032026-015', 22, 'Maret 2026', 110000, '2026-03-22', 'Lunas', '2026-03-21 03:54:21'),
(99, 'INV-032026-016', 23, 'Maret 2026', 110000, '2026-03-22', 'Lunas', '2026-03-21 03:54:21'),
(100, 'INV-032026-017', 24, 'Maret 2026', 110000, '2026-03-27', 'Lunas', '2026-03-21 03:54:21'),
(101, 'INV-032026-018', 25, 'Maret 2026', 110000, '2026-03-27', 'Lunas', '2026-03-21 03:54:21'),
(102, 'INV-032026-019', 26, 'Maret 2026', 110000, '2026-03-27', 'Lunas', '2026-03-21 03:54:21'),
(103, 'INV-032026-020', 27, 'Maret 2026', 110000, '2026-03-03', 'Lunas', '2026-03-21 03:54:21'),
(104, 'INV-032026-021', 28, 'Maret 2026', 110000, '2026-03-04', 'Lunas', '2026-03-21 03:54:21'),
(105, 'INV-032026-022', 30, 'Maret 2026', 110000, '2026-03-03', 'Lunas', '2026-03-21 03:54:21'),
(106, 'INV-032026-023', 31, 'Maret 2026', 110000, '2026-03-06', 'Lunas', '2026-03-21 03:54:21'),
(107, 'INV-032026-024', 32, 'Maret 2026', 110000, '2026-03-30', 'Lunas', '2026-03-21 03:54:21'),
(108, 'INV-032026-025', 33, 'Maret 2026', 110000, '2026-03-03', 'Lunas', '2026-03-21 03:54:21'),
(109, 'INV-032026-026', 34, 'Maret 2026', 110000, '2026-03-03', 'Lunas', '2026-03-21 03:54:21'),
(111, 'INV-032026-028', 36, 'Maret 2026', 110000, '2026-03-04', 'Lunas', '2026-03-21 03:54:21'),
(112, 'INV-032026-029', 37, 'Maret 2026', 110000, '2026-03-04', 'Lunas', '2026-03-21 03:54:21'),
(113, 'INV-032026-030', 38, 'Maret 2026', 110000, '2026-03-05', 'Lunas', '2026-03-21 03:54:21'),
(114, 'INV-032026-031', 40, 'Maret 2026', 110000, '2026-03-07', 'Lunas', '2026-03-21 03:54:21'),
(115, 'INV-032026-032', 41, 'Maret 2026', 110000, '2026-03-08', 'Lunas', '2026-03-21 03:54:21'),
(116, 'INV-032026-033', 43, 'Maret 2026', 110000, '2026-03-17', 'Lunas', '2026-03-21 03:54:21'),
(117, 'INV-032026-034', 45, 'Maret 2026', 110000, '2026-03-22', 'Lunas', '2026-03-21 03:54:21'),
(118, 'INV-032026-035', 46, 'Maret 2026', 110000, '2026-03-24', 'Lunas', '2026-03-21 03:54:21'),
(119, 'INV-032026-036', 47, 'Maret 2026', 110000, '2026-03-25', 'Lunas', '2026-03-21 03:54:21'),
(120, 'INV-032026-037', 48, 'Maret 2026', 110000, '2026-03-25', 'Lunas', '2026-03-21 03:54:21'),
(121, 'INV-032026-038', 49, 'Maret 2026', 110000, '2026-03-04', 'Lunas', '2026-03-21 03:54:21'),
(122, 'INV-032026-039', 50, 'Maret 2026', 110000, '2026-03-05', 'Lunas', '2026-03-21 03:54:21'),
(123, 'INV-032026-040', 51, 'Maret 2026', 110000, '2026-03-28', 'Lunas', '2026-03-21 03:54:21'),
(124, 'INV-032026-041', 54, 'Maret 2026', 110000, '2026-03-15', 'Lunas', '2026-03-21 03:54:21'),
(125, 'INV-032026-042', 56, 'Maret 2026', 110000, '2026-03-19', 'Lunas', '2026-03-21 03:54:21'),
(126, 'INV-032026-043', 61, 'Maret 2026', 110000, '2026-03-30', 'Lunas', '2026-03-21 03:54:21'),
(127, 'INV-032026-044', 62, 'Maret 2026', 110000, '2026-03-30', 'Lunas', '2026-03-21 03:54:21'),
(128, 'INV-032026-045', 63, 'Maret 2026', 110000, '2026-03-20', 'Lunas', '2026-03-21 03:54:21'),
(129, 'INV-032026-046', 64, 'Maret 2026', 110000, '2026-03-07', 'Lunas', '2026-03-21 03:54:21'),
(131, 'INV-032026-048', 66, 'Maret 2026', 110000, '2026-03-09', 'Lunas', '2026-03-21 03:54:21'),
(132, 'INV-032026-049', 67, 'Maret 2026', 110000, '2026-03-11', 'Lunas', '2026-03-21 03:54:21'),
(133, 'INV-032026-050', 68, 'Maret 2026', 110000, '2026-03-11', 'Lunas', '2026-03-21 03:54:21'),
(135, 'INV-032026-052', 72, 'Maret 2026', 110000, '2026-03-21', 'Lunas', '2026-03-21 03:54:21'),
(136, 'INV-032026-053', 73, 'Maret 2026', 110000, '2026-03-21', 'Belum Bayar', '2026-03-21 03:54:21'),
(137, 'INV-032026-054', 39, 'Maret 2026', 145000, '2026-03-05', 'Lunas', '2026-03-21 03:54:21'),
(138, 'INV-032026-055', 42, 'Maret 2026', 195000, '2026-03-09', 'Lunas', '2026-03-21 03:54:21'),
(139, 'INV-032026-056', 59, 'Maret 2026', 195000, '2026-03-18', 'Lunas', '2026-03-21 03:54:21'),
(140, 'INV-032026-057', 60, 'Maret 2026', 195000, '2026-03-22', 'Lunas', '2026-03-21 03:54:21'),
(141, 'INV-042026-001', 8, 'April 2026', 110000, '2026-04-21', 'Belum Bayar', '2026-03-31 23:14:32'),
(142, 'INV-042026-002', 9, 'April 2026', 110000, '2026-04-22', 'Belum Bayar', '2026-03-31 23:14:32'),
(143, 'INV-042026-003', 10, 'April 2026', 110000, '2026-04-22', 'Belum Bayar', '2026-03-31 23:14:32'),
(144, 'INV-042026-004', 11, 'April 2026', 110000, '2026-04-22', 'Belum Bayar', '2026-03-31 23:14:32'),
(145, 'INV-042026-005', 12, 'April 2026', 110000, '2026-04-22', 'Belum Bayar', '2026-03-31 23:14:32'),
(146, 'INV-042026-006', 13, 'April 2026', 110000, '2026-04-22', 'Belum Bayar', '2026-03-31 23:14:32'),
(147, 'INV-042026-007', 14, 'April 2026', 110000, '2026-04-19', 'Belum Bayar', '2026-03-31 23:14:32'),
(148, 'INV-042026-008', 15, 'April 2026', 110000, '2026-04-22', 'Belum Bayar', '2026-03-31 23:14:32'),
(149, 'INV-042026-009', 16, 'April 2026', 110000, '2026-04-09', 'Lunas', '2026-03-31 23:14:32'),
(150, 'INV-042026-010', 17, 'April 2026', 110000, '2026-04-22', 'Belum Bayar', '2026-03-31 23:14:32'),
(151, 'INV-042026-011', 18, 'April 2026', 110000, '2026-04-22', 'Belum Bayar', '2026-03-31 23:14:32'),
(152, 'INV-042026-012', 19, 'April 2026', 110000, '2026-04-09', 'Lunas', '2026-03-31 23:14:32'),
(153, 'INV-042026-013', 20, 'April 2026', 110000, '2026-04-22', 'Belum Bayar', '2026-03-31 23:14:32'),
(154, 'INV-042026-014', 21, 'April 2026', 110000, '2026-04-22', 'Belum Bayar', '2026-03-31 23:14:32'),
(155, 'INV-042026-015', 22, 'April 2026', 110000, '2026-04-22', 'Belum Bayar', '2026-03-31 23:14:32'),
(156, 'INV-042026-016', 23, 'April 2026', 110000, '2026-04-22', 'Belum Bayar', '2026-03-31 23:14:32'),
(157, 'INV-042026-017', 24, 'April 2026', 110000, '2026-04-27', 'Belum Bayar', '2026-03-31 23:14:32'),
(158, 'INV-042026-018', 25, 'April 2026', 110000, '2026-04-27', 'Belum Bayar', '2026-03-31 23:14:32'),
(159, 'INV-042026-019', 26, 'April 2026', 110000, '2026-04-27', 'Belum Bayar', '2026-03-31 23:14:32'),
(160, 'INV-042026-020', 27, 'April 2026', 110000, '2026-04-03', 'Lunas', '2026-03-31 23:14:32'),
(161, 'INV-042026-021', 28, 'April 2026', 110000, '2026-04-04', 'Lunas', '2026-03-31 23:14:32'),
(162, 'INV-042026-022', 30, 'April 2026', 110000, '2026-04-03', 'Belum Bayar', '2026-03-31 23:14:32'),
(163, 'INV-042026-023', 31, 'April 2026', 110000, '2026-04-06', 'Lunas', '2026-03-31 23:14:32'),
(164, 'INV-042026-024', 32, 'Mei 2026', 110000, '2026-04-30', 'Belum Bayar', '2026-03-31 23:14:32'),
(165, 'INV-042026-025', 33, 'April 2026', 110000, '2026-04-03', 'Lunas', '2026-03-31 23:14:32'),
(166, 'INV-042026-026', 34, 'April 2026', 110000, '2026-04-03', 'Lunas', '2026-03-31 23:14:32'),
(168, 'INV-042026-028', 36, 'April 2026', 110000, '2026-04-03', 'Lunas', '2026-03-31 23:14:32'),
(169, 'INV-042026-029', 37, 'April 2026', 110000, '2026-04-04', 'Lunas', '2026-03-31 23:14:32'),
(170, 'INV-042026-030', 38, 'April 2026', 110000, '2026-04-05', 'Lunas', '2026-03-31 23:14:32'),
(171, 'INV-042026-031', 40, 'April 2026', 110000, '2026-04-07', 'Lunas', '2026-03-31 23:14:32'),
(172, 'INV-042026-032', 41, 'April 2026', 110000, '2026-04-08', 'Lunas', '2026-03-31 23:14:32'),
(173, 'INV-042026-033', 43, 'April 2026', 110000, '2026-04-17', 'Belum Bayar', '2026-03-31 23:14:32'),
(174, 'INV-042026-034', 45, 'April 2026', 110000, '2026-04-22', 'Belum Bayar', '2026-03-31 23:14:32'),
(175, 'INV-042026-035', 46, 'April 2026', 110000, '2026-04-24', 'Belum Bayar', '2026-03-31 23:14:32'),
(176, 'INV-042026-036', 47, 'April 2026', 110000, '2026-04-25', 'Belum Bayar', '2026-03-31 23:14:32'),
(177, 'INV-042026-037', 48, 'April 2026', 110000, '2026-04-25', 'Belum Bayar', '2026-03-31 23:14:32'),
(178, 'INV-042026-038', 49, 'April 2026', 110000, '2026-04-04', 'Belum Bayar', '2026-03-31 23:14:32'),
(179, 'INV-042026-039', 50, 'April 2026', 110000, '2026-04-05', 'Lunas', '2026-03-31 23:14:32'),
(180, 'INV-042026-040', 51, 'April 2026', 110000, '2026-04-28', 'Belum Bayar', '2026-03-31 23:14:32'),
(181, 'INV-042026-041', 54, 'April 2026', 110000, '2026-04-15', 'Belum Bayar', '2026-03-31 23:14:32'),
(182, 'INV-042026-042', 56, 'April 2026', 110000, '2026-04-19', 'Belum Bayar', '2026-03-31 23:14:32'),
(183, 'INV-042026-043', 61, 'Mei 2026', 110000, '2026-05-30', 'Belum Bayar', '2026-03-31 23:14:32'),
(184, 'INV-042026-044', 62, 'Mei 2026', 110000, '2026-05-30', 'Belum Bayar', '2026-03-31 23:14:32'),
(185, 'INV-042026-045', 63, 'April 2026', 110000, '2026-04-18', 'Lunas', '2026-03-31 23:14:32'),
(186, 'INV-042026-046', 64, 'Mei 2026', 110000, '2026-05-07', 'Lunas', '2026-03-31 23:14:32'),
(188, 'INV-042026-048', 66, 'April 2026', 110000, '2026-04-08', 'Lunas', '2026-03-31 23:14:32'),
(189, 'INV-042026-049', 67, 'Mei 2026', 110000, '2026-05-11', 'Belum Bayar', '2026-03-31 23:14:32'),
(190, 'INV-042026-050', 68, 'Mei 2026', 110000, '2026-05-10', 'Lunas', '2026-03-31 23:14:32'),
(192, 'INV-042026-052', 72, 'Mei 2026', 110000, '2026-05-21', 'Belum Bayar', '2026-03-31 23:14:32'),
(193, 'INV-042026-053', 73, 'April 2026', 110000, '2026-04-21', 'Belum Bayar', '2026-03-31 23:14:32'),
(194, 'INV-042026-054', 75, 'April 2026', 110000, '2026-04-23', 'Belum Bayar', '2026-03-31 23:14:32'),
(195, 'INV-042026-055', 39, 'April 2026', 145000, '2026-04-05', 'Lunas', '2026-03-31 23:14:32'),
(196, 'INV-042026-056', 42, 'April 2026', 195000, '2026-04-09', 'Lunas', '2026-03-31 23:14:32'),
(197, 'INV-042026-057', 59, 'April 2026', 195000, '2026-04-18', 'Belum Bayar', '2026-03-31 23:14:32'),
(198, 'INV-042026-058', 60, 'April 2026', 195000, '2026-04-21', 'Belum Bayar', '2026-03-31 23:14:32'),
(200, 'INV-2604-117', 77, 'April 2026', 145000, '2026-04-19', 'Lunas', '2026-04-02 11:48:03'),
(201, 'INV-042026-059', 79, 'April 2026', 110000, '2026-04-03', 'Lunas', '2026-04-06 10:17:06'),
(269, 'INV-2604-112', 83, 'April 2026', 110000, '2026-04-01', 'Lunas', '2026-04-06 10:51:49'),
(270, 'INV-2604-113', 82, 'April 2026', 110000, '2026-04-01', 'Lunas', '2026-04-06 10:52:06');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `karyawan`
--
ALTER TABLE `karyawan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `paket`
--
ALTER TABLE `paket`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pelanggan`
--
ALTER TABLE `pelanggan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pel_status` (`status`),
  ADD KEY `idx_pel_id_paket` (`id_paket`),
  ADD KEY `idx_pel_nama` (`nama`);

--
-- Indexes for table `pemasukan`
--
ALTER TABLE `pemasukan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pay_tagihan` (`id_tagihan`),
  ADD KEY `idx_pay_tgl` (`tgl_bayar`);

--
-- Indexes for table `pengaturan`
--
ALTER TABLE `pengaturan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pengeluaran`
--
ALTER TABLE `pengeluaran`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pgl_tgl` (`tgl_pengeluaran`),
  ADD KEY `idx_pgl_kategori` (`kategori`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `tagihan`
--
ALTER TABLE `tagihan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `no_tagihan` (`no_tagihan`),
  ADD KEY `idx_tag_pelanggan` (`id_pelanggan`),
  ADD KEY `idx_tag_status` (`status`),
  ADD KEY `idx_tag_created` (`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `karyawan`
--
ALTER TABLE `karyawan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `paket`
--
ALTER TABLE `paket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `pelanggan`
--
ALTER TABLE `pelanggan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `pemasukan`
--
ALTER TABLE `pemasukan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `pembayaran`
--
ALTER TABLE `pembayaran`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

--
-- AUTO_INCREMENT for table `pengaturan`
--
ALTER TABLE `pengaturan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `pengeluaran`
--
ALTER TABLE `pengeluaran`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `tagihan`
--
ALTER TABLE `tagihan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=271;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `pelanggan`
--
ALTER TABLE `pelanggan`
  ADD CONSTRAINT `pelanggan_ibfk_1` FOREIGN KEY (`id_paket`) REFERENCES `paket` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD CONSTRAINT `pembayaran_ibfk_1` FOREIGN KEY (`id_tagihan`) REFERENCES `tagihan` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tagihan`
--
ALTER TABLE `tagihan`
  ADD CONSTRAINT `tagihan_ibfk_1` FOREIGN KEY (`id_pelanggan`) REFERENCES `pelanggan` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
