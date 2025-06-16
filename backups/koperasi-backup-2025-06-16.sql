-- MySQL dump 10.13  Distrib 8.1.0, for Win64 (x86_64)
--
-- Host: localhost    Database: koperasi
-- ------------------------------------------------------
-- Server version	8.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `angsuran`
--

DROP TABLE IF EXISTS `angsuran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `angsuran` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_pinjaman` int NOT NULL,
  `jumlah_bayar` int NOT NULL,
  `asal_pembayaran` enum('anggota','penagih') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `status` enum('aktif','lunas','menunggak','libur') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `tanggal_pembayaran` timestamp NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_pinjaman` (`id_pinjaman`),
  CONSTRAINT `angsuran_ibfk_1` FOREIGN KEY (`id_pinjaman`) REFERENCES `pinjaman` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `angsuran`
--

LOCK TABLES `angsuran` WRITE;
/*!40000 ALTER TABLE `angsuran` DISABLE KEYS */;
INSERT INTO `angsuran` VALUES (1,1,130000,'anggota','lunas','2025-05-30 17:00:00'),(2,1,130000,'anggota','lunas','2025-06-30 17:00:00'),(3,1,0,NULL,'menunggak','2025-07-30 17:00:00'),(4,1,0,NULL,'libur','2025-08-30 17:00:00'),(5,1,0,NULL,'aktif','2025-09-30 17:00:00'),(6,1,0,NULL,'aktif','2025-09-30 17:00:00'),(7,1,0,NULL,'aktif','2025-10-30 17:00:00'),(8,1,0,NULL,'aktif','2025-11-30 17:00:00'),(9,1,0,NULL,'aktif','2025-12-30 17:00:00'),(10,1,0,NULL,'aktif','2026-01-30 17:00:00'),(11,1,0,NULL,'aktif','2026-03-02 17:00:00'),(12,2,0,NULL,'aktif','2025-05-30 17:00:00'),(13,2,0,NULL,'aktif','2025-06-30 17:00:00'),(14,2,0,NULL,'aktif','2025-07-30 17:00:00'),(15,2,0,NULL,'libur','2025-08-30 17:00:00'),(16,2,0,NULL,'aktif','2025-09-30 17:00:00'),(17,2,0,NULL,'aktif','2025-09-30 17:00:00'),(18,2,0,NULL,'aktif','2025-10-30 17:00:00'),(19,2,0,NULL,'aktif','2025-11-30 17:00:00'),(20,2,0,NULL,'aktif','2025-12-30 17:00:00'),(21,2,0,NULL,'aktif','2026-01-30 17:00:00'),(22,2,0,NULL,'aktif','2026-03-02 17:00:00'),(23,1,0,NULL,'aktif','2026-04-02 17:00:00'),(24,1,0,NULL,'aktif','2026-05-02 17:00:00'),(25,1,0,NULL,'aktif','2026-06-02 17:00:00'),(26,3,163150,'anggota','lunas','2025-06-15 17:00:00'),(27,3,0,NULL,'menunggak','2025-07-15 17:00:00'),(28,3,163150,'anggota','lunas','2025-08-15 17:00:00'),(29,3,163150,'penagih','lunas','2025-09-15 17:00:00'),(30,3,0,NULL,'aktif','2025-10-15 17:00:00'),(31,3,0,NULL,'libur','2025-11-15 17:00:00'),(32,3,0,NULL,'aktif','2025-12-15 17:00:00'),(33,3,0,NULL,'aktif','2025-12-15 17:00:00'),(34,3,0,NULL,'aktif','2026-01-15 17:00:00'),(35,3,0,NULL,'aktif','2026-02-15 17:00:00'),(36,3,0,NULL,'aktif','2026-03-15 17:00:00'),(37,3,0,NULL,'aktif','2026-04-15 17:00:00'),(38,4,0,NULL,'aktif','2025-06-15 17:00:00'),(39,4,0,NULL,'aktif','2025-07-15 17:00:00'),(40,4,0,NULL,'aktif','2025-08-15 17:00:00'),(41,4,0,NULL,'aktif','2025-09-15 17:00:00'),(42,4,0,NULL,'aktif','2025-10-15 17:00:00'),(43,4,0,NULL,'libur','2025-11-15 17:00:00'),(44,4,0,NULL,'aktif','2025-12-15 17:00:00'),(45,4,0,NULL,'aktif','2025-12-15 17:00:00'),(46,4,0,NULL,'aktif','2026-01-15 17:00:00'),(47,4,0,NULL,'aktif','2026-02-15 17:00:00'),(48,4,0,NULL,'aktif','2026-03-15 17:00:00');
/*!40000 ALTER TABLE `angsuran` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `areas`
--

DROP TABLE IF EXISTS `areas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `areas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `area_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `subdistrict` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `village` varchar(100) NOT NULL,
  `address` varchar(100) NOT NULL,
  `status` enum('aktif','nonAktif') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `areas`
--

LOCK TABLES `areas` WRITE;
/*!40000 ALTER TABLE `areas` DISABLE KEYS */;
INSERT INTO `areas` VALUES (1,'Kelompok A','Bondowoso','Tenggarang','Bataan','Jl. Pakisan No 21','aktif','2025-05-24 04:27:41',NULL,NULL),(2,'Temp','m','m','m','m','aktif','2025-05-24 04:28:03','2025-05-24 04:36:07','2025-05-24 04:36:08');
/*!40000 ALTER TABLE `areas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_details`
--

DROP TABLE IF EXISTS `group_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `group_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `group` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `group_staff` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_details`
--

LOCK TABLES `group_details` WRITE;
/*!40000 ALTER TABLE `group_details` DISABLE KEYS */;
INSERT INTO `group_details` VALUES (2,4,2,'2025-05-24 04:46:09',NULL,NULL),(3,4,1,'2025-05-24 04:47:15',NULL,NULL);
/*!40000 ALTER TABLE `group_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_name` varchar(70) NOT NULL,
  `area_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `area_id` (`area_id`),
  CONSTRAINT `group_area` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groups`
--

LOCK TABLES `groups` WRITE;
/*!40000 ALTER TABLE `groups` DISABLE KEYS */;
INSERT INTO `groups` VALUES (1,'Kelompok 1',1,'2025-05-24 04:36:41',NULL,NULL),(2,'k',1,'2025-05-24 04:46:09','2025-05-24 04:46:13','2025-05-24 04:46:14');
/*!40000 ALTER TABLE `groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `complete_name` varchar(70) NOT NULL,
  `address` varchar(100) NOT NULL,
  `sequence_number` int unsigned NOT NULL,
  `area_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `area_id` (`area_id`),
  CONSTRAINT `members_ibfk_1` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--

LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
INSERT INTO `members` VALUES (1,'Ahmad Bayu','Bataan',1,1,'2025-05-24 04:31:52',NULL,NULL),(2,'Bayu Adullah','Bondowoso',2,1,'2025-05-24 05:05:51',NULL,NULL),(3,'Muchlis','Banyuglugur',3,1,'2025-06-09 13:27:11',NULL,NULL),(4,'t','t',4,1,'2025-06-09 14:27:38',NULL,NULL);
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `penagih_angsuran`
--

DROP TABLE IF EXISTS `penagih_angsuran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `penagih_angsuran` (
  `id_angsuran` int NOT NULL,
  `id_karyawan` int NOT NULL,
  KEY `id_angsuran` (`id_angsuran`),
  KEY `id_karyawan` (`id_karyawan`),
  CONSTRAINT `fr_angsuran` FOREIGN KEY (`id_angsuran`) REFERENCES `angsuran` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fr_karyawan` FOREIGN KEY (`id_karyawan`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `penagih_angsuran`
--

LOCK TABLES `penagih_angsuran` WRITE;
/*!40000 ALTER TABLE `penagih_angsuran` DISABLE KEYS */;
INSERT INTO `penagih_angsuran` VALUES (1,4),(2,4),(3,4),(26,4),(27,4),(28,4),(29,4);
/*!40000 ALTER TABLE `penagih_angsuran` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pinjaman`
--

DROP TABLE IF EXISTS `pinjaman`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pinjaman` (
  `id` int NOT NULL AUTO_INCREMENT,
  `anggota_id` int NOT NULL,
  `kode` char(10) NOT NULL,
  `jumlah_pinjaman` int NOT NULL,
  `persen_bunga` decimal(5,2) NOT NULL DEFAULT '0.00',
  `total_bunga` int NOT NULL,
  `total_pinjaman` int NOT NULL,
  `total_pinjaman_diterima` int NOT NULL,
  `jumlah_angsuran` int NOT NULL,
  `tanggal_angsuran_pertama` date DEFAULT NULL,
  `modal_do` int NOT NULL,
  `penanggung_jawab` int DEFAULT NULL,
  `petugas_input` int DEFAULT NULL,
  `sisa_pembayaran` int NOT NULL,
  `besar_tunggakan` int DEFAULT '0',
  `status` enum('aktif','lunas','menunggak') NOT NULL DEFAULT 'aktif',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `petugas_input` (`petugas_input`),
  KEY `penanggung_jawab` (`penanggung_jawab`),
  KEY `anggota_id` (`anggota_id`),
  CONSTRAINT `pinjaman_ibfk_1` FOREIGN KEY (`anggota_id`) REFERENCES `members` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `pinjaman_ibfk_2` FOREIGN KEY (`penanggung_jawab`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `pinjaman_ibfk_3` FOREIGN KEY (`petugas_input`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pinjaman`
--

LOCK TABLES `pinjaman` WRITE;
/*!40000 ALTER TABLE `pinjaman` DISABLE KEYS */;
INSERT INTO `pinjaman` VALUES (1,1,'I/1',1000000,30.00,300000,1300000,870000,130000,'2025-05-31',130000,4,1,1040000,130000,'aktif','2025-05-24 04:48:33','2025-05-24 04:48:33',NULL),(2,2,'I/2',1000000,30.00,300000,1300000,870000,130000,'2025-05-31',130000,4,1,1300000,0,'aktif','2025-05-24 05:06:08','2025-05-24 05:06:08','2025-05-24 05:06:12'),(3,3,'I/3',1255000,30.00,376500,1631500,1091850,163150,'2025-06-16',163150,4,1,1142050,0,'aktif','2025-06-09 13:29:10','2025-06-09 13:29:10',NULL),(4,4,'IV/1',10,30.00,3,13,9,1,'2025-06-16',1,4,1,13,0,'aktif','2025-06-09 14:59:39','2025-06-09 14:59:39',NULL);
/*!40000 ALTER TABLE `pinjaman` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule`
--

DROP TABLE IF EXISTS `schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `area_id` int NOT NULL,
  `group_id` int NOT NULL,
  `day` enum('senin','selasa','rabu','kamis','jumat','sabtu','minggu') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` enum('aktif','nonAktif') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `area_id` (`area_id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `schedule_ibfk_1` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `schedule_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule`
--

LOCK TABLES `schedule` WRITE;
/*!40000 ALTER TABLE `schedule` DISABLE KEYS */;
INSERT INTO `schedule` VALUES (1,1,1,'senin','aktif','2025-05-24 04:44:55','2025-05-24 04:45:13',NULL),(2,1,1,'selasa','aktif','2025-05-24 04:45:19',NULL,NULL),(3,1,1,'rabu','aktif','2025-05-24 04:45:25',NULL,NULL),(4,1,1,'kamis','aktif','2025-05-24 04:45:31',NULL,NULL),(5,1,1,'jumat','aktif','2025-05-24 04:45:45',NULL,NULL);
/*!40000 ALTER TABLE `schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `complete_name` varchar(70) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('staff','controller','pusat','super admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `access_apps` enum('access','noAccess') COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('aktif','nonAktif') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'aktif',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Users_username_key` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Muhammad Nor Kholit  ','admin','$2b$10$6Hib5ccu3Hx4VYEl/.w4OOKLv93Edp0.LA0N4PjeGXb9Yhv8uAjMa','pusat','access',NULL,'aktif','2025-05-24 03:37:49','2025-06-10 11:58:31',NULL),(2,'Ahmad Safi','safi','$2b$10$l3qHSLL/9ptZsBdkWpUpGO50Y4JGE4q6CDkvB8ItIsqvSSN7WRSfi','staff','access',NULL,'aktif','2025-05-24 04:23:49',NULL,NULL),(3,'Muhammad Ibrohim','ibrohim','$2b$10$AxEufyYSPe8HZ5EWxo.wxeTn7ecGKl244OTw.v4OAhZaE..5x8WVG','controller','access',NULL,'aktif','2025-05-24 04:24:08',NULL,NULL),(4,'Ahmad Sukri',NULL,NULL,'staff','noAccess','Ketua Kelompok','aktif','2025-05-24 04:26:31',NULL,NULL),(5,'Muhammad Nor Kholit  ','super admin','$2b$10$6Hib5ccu3Hx4VYEl/.w4OOKLv93Edp0.LA0N4PjeGXb9Yhv8uAjMa','super admin','access',NULL,'aktif','2025-05-24 03:37:49','2025-06-11 08:17:11',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-16 16:58:05
