-- ============================================================
-- Kaamly — Database Schema
-- Run AFTER init.sql (which creates the database).
-- ============================================================

USE kaamly;

-- -------------------------------------------------------
-- users
-- Every person in the system: customers, mechanics, admins.
-- Mechanics also have a row in the `mechanics` table with
-- shop-specific details; this table holds login credentials.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL UNIQUE,
  phone       VARCHAR(15)   NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,              -- bcrypt hash
  role        ENUM('CUSTOMER','MECHANIC','ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  avatar_url  VARCHAR(500)  DEFAULT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- categories
-- Top-level service type. "Cycle Repair" is the first one.
-- Future examples: "AC Repair", "Plumbing", etc.
-- Shops and services belong to a category so the platform
-- can grow into multiple verticals.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL UNIQUE,
  slug        VARCHAR(100)  NOT NULL UNIQUE,       -- URL-friendly key, e.g. "cycle-repair"
  icon_url    VARCHAR(500)  DEFAULT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- shops
-- A physical or virtual shop that provides services.
-- source = MAP  → added from Google Maps by the system
-- source = ADMIN → manually created by an admin
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS shops (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id   INT UNSIGNED  NOT NULL,
  name          VARCHAR(200)  NOT NULL,
  slug          VARCHAR(200)  NOT NULL UNIQUE,
  description   TEXT          DEFAULT NULL,
  phone         VARCHAR(15)   DEFAULT NULL,
  address       VARCHAR(500)  NOT NULL,
  city          VARCHAR(100)  NOT NULL,
  area          VARCHAR(100)  DEFAULT NULL,        -- neighbourhood / locality
  latitude      DECIMAL(10,7) NOT NULL,            -- 7 decimal places ≈ 1 cm precision
  longitude     DECIMAL(10,7) NOT NULL,
  source        ENUM('MAP','ADMIN') NOT NULL DEFAULT 'ADMIN',
  status        ENUM('ACTIVE','INACTIVE','PENDING') NOT NULL DEFAULT 'PENDING',
  rating        DECIMAL(2,1)  DEFAULT 0.0,         -- shop-level average (1.0–5.0)
  total_reviews INT UNSIGNED  DEFAULT 0,
  image_url     VARCHAR(500)  DEFAULT NULL,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_shops_category FOREIGN KEY (category_id) REFERENCES categories(id),

  INDEX idx_shops_city (city),
  INDEX idx_shops_location (latitude, longitude)   -- speeds up nearby-shop queries
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- mechanics
-- A mechanic works at one shop and has a users account.
-- Their rating is separate from the shop's rating.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS mechanics (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED  NOT NULL UNIQUE,   -- links to users table
  shop_id         INT UNSIGNED  NOT NULL,           -- which shop they belong to
  experience_yrs  TINYINT UNSIGNED DEFAULT 0,      -- years of experience
  specialisation  VARCHAR(200)  DEFAULT NULL,       -- e.g. "gear cycles, e-bikes"
  is_available    BOOLEAN       DEFAULT TRUE,       -- can accept new bookings right now?
  rating          DECIMAL(2,1)  DEFAULT 0.0,        -- mechanic-level average (1.0–5.0)
  total_reviews   INT UNSIGNED  DEFAULT 0,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_mechanics_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_mechanics_shop FOREIGN KEY (shop_id) REFERENCES shops(id)
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- services
-- A master list of service types within a category.
-- e.g. "Flat Tyre Fix", "Brake Adjustment" under Cycle Repair.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id   INT UNSIGNED  NOT NULL,
  name          VARCHAR(200)  NOT NULL,
  description   TEXT          DEFAULT NULL,
  base_price    DECIMAL(8,2)  NOT NULL DEFAULT 0.00,  -- suggested starting price
  image_url     VARCHAR(500)  DEFAULT NULL,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_services_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- shop_services
-- Which services a particular shop actually offers, and
-- at what price (may differ from the service's base_price).
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS shop_services (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  shop_id     INT UNSIGNED  NOT NULL,
  service_id  INT UNSIGNED  NOT NULL,
  price       DECIMAL(8,2)  NOT NULL,              -- this shop's price for this service
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_ss_shop    FOREIGN KEY (shop_id)    REFERENCES shops(id),
  CONSTRAINT fk_ss_service FOREIGN KEY (service_id) REFERENCES services(id),
  UNIQUE KEY  uk_shop_service (shop_id, service_id)  -- a shop lists each service only once
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- bookings
-- A customer books a mechanic for a service at their doorstep.
--
-- Status state machine:
--   PENDING ─→ ACCEPTED ─→ EN_ROUTE ─→ IN_PROGRESS ─→ COMPLETED
--       │          │
--       └→ CANCELLED  (customer cancels before acceptance)
--       └→ REJECTED   (mechanic declines)
--           │
--           └→ CANCELLED (customer can cancel an accepted booking too)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id       INT UNSIGNED  NOT NULL,          -- the user who placed the booking
  mechanic_id       INT UNSIGNED  NOT NULL,          -- the mechanic assigned
  shop_id           INT UNSIGNED  NOT NULL,
  shop_service_id   INT UNSIGNED  NOT NULL,          -- which service (with shop's price)
  status            ENUM('PENDING','ACCEPTED','REJECTED','EN_ROUTE','IN_PROGRESS','COMPLETED','CANCELLED')
                    NOT NULL DEFAULT 'PENDING',
  address           VARCHAR(500)  NOT NULL,          -- customer's doorstep address
  latitude          DECIMAL(10,7) DEFAULT NULL,
  longitude         DECIMAL(10,7) DEFAULT NULL,
  scheduled_at      DATETIME      DEFAULT NULL,      -- when the customer wants the visit
  started_at        DATETIME      DEFAULT NULL,      -- when mechanic starts working
  completed_at      DATETIME      DEFAULT NULL,
  total_amount      DECIMAL(8,2)  DEFAULT 0.00,
  notes             TEXT          DEFAULT NULL,       -- customer's description of the issue
  created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_bookings_customer      FOREIGN KEY (customer_id)     REFERENCES users(id),
  CONSTRAINT fk_bookings_mechanic      FOREIGN KEY (mechanic_id)     REFERENCES mechanics(id),
  CONSTRAINT fk_bookings_shop          FOREIGN KEY (shop_id)         REFERENCES shops(id),
  CONSTRAINT fk_bookings_shop_service  FOREIGN KEY (shop_service_id) REFERENCES shop_services(id),

  INDEX idx_bookings_customer (customer_id),
  INDEX idx_bookings_mechanic (mechanic_id),
  INDEX idx_bookings_status   (status)
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- reviews
-- A customer reviews a completed booking.
-- shop_rating and mechanic_rating are stored separately
-- so each entity's average can be computed independently.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id      INT UNSIGNED  NOT NULL UNIQUE,     -- one review per booking
  customer_id     INT UNSIGNED  NOT NULL,
  mechanic_id     INT UNSIGNED  NOT NULL,
  shop_id         INT UNSIGNED  NOT NULL,
  shop_rating     TINYINT UNSIGNED NOT NULL,         -- 1–5
  mechanic_rating TINYINT UNSIGNED NOT NULL,         -- 1–5
  comment         TEXT          DEFAULT NULL,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_reviews_booking   FOREIGN KEY (booking_id)   REFERENCES bookings(id),
  CONSTRAINT fk_reviews_customer  FOREIGN KEY (customer_id)  REFERENCES users(id),
  CONSTRAINT fk_reviews_mechanic  FOREIGN KEY (mechanic_id)  REFERENCES mechanics(id),
  CONSTRAINT fk_reviews_shop      FOREIGN KEY (shop_id)      REFERENCES shops(id),

  CONSTRAINT chk_shop_rating     CHECK (shop_rating BETWEEN 1 AND 5),
  CONSTRAINT chk_mechanic_rating CHECK (mechanic_rating BETWEEN 1 AND 5)
) ENGINE=InnoDB;
