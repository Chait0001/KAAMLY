-- ============================================================
-- Kaamly — Seed Data
-- Run AFTER schema.sql to populate tables with sample data.
-- Passwords below are bcrypt hashes of "password123".
-- ============================================================

USE kaamly;

-- -------------------------------------------------------
-- 1. Category
-- -------------------------------------------------------
INSERT INTO categories (name, slug) VALUES
  ('Cycle Repair', 'cycle-repair');

-- -------------------------------------------------------
-- 2. Users (1 customer + 3 mechanics + 1 admin = 5 users)
--    bcrypt hash for "password123" (10 rounds):
--    $2a$10$Dow86llJSa1GOfGKEOFBYuZMkMBCazYiryLbGRxhkVbfJMGKslUKW
-- -------------------------------------------------------
INSERT INTO users (name, email, phone, password, role) VALUES
  ('Rahul Sharma',   'rahul@example.com',   '9876543210', '$2a$10$Dow86llJSa1GOfGKEOFBYuZMkMBCazYiryLbGRxhkVbfJMGKslUKW', 'CUSTOMER'),
  ('Vijay Kumar',    'vijay@example.com',    '9876543211', '$2a$10$Dow86llJSa1GOfGKEOFBYuZMkMBCazYiryLbGRxhkVbfJMGKslUKW', 'MECHANIC'),
  ('Anil Yadav',     'anil@example.com',     '9876543212', '$2a$10$Dow86llJSa1GOfGKEOFBYuZMkMBCazYiryLbGRxhkVbfJMGKslUKW', 'MECHANIC'),
  ('Suresh Reddy',   'suresh@example.com',   '9876543213', '$2a$10$Dow86llJSa1GOfGKEOFBYuZMkMBCazYiryLbGRxhkVbfJMGKslUKW', 'MECHANIC'),
  ('Admin User',     'admin@kaamly.com',     '9876543200', '$2a$10$Dow86llJSa1GOfGKEOFBYuZMkMBCazYiryLbGRxhkVbfJMGKslUKW', 'ADMIN');

-- -------------------------------------------------------
-- 3. Shops (2 cycle repair shops in Hyderabad)
-- -------------------------------------------------------
INSERT INTO shops (category_id, name, slug, description, phone, address, city, area, latitude, longitude, source, status, rating) VALUES
  (1, 'SpeedGear Cycle Works', 'speedgear-cycle-works',
   'Expert cycle repair and servicing for all brands.',
   '04012345678',
   '12-3-456, Near Charminar, Hyderabad',
   'Hyderabad', 'Charminar',
   17.3616000, 78.4747000,
   'ADMIN', 'ACTIVE', 4.2),

  (1, 'PedalFix Hub', 'pedalfix-hub',
   'Quick doorstep cycle repairs — gears, brakes, tyres.',
   '04098765432',
   '8-1-290, Road No 12, Banjara Hills, Hyderabad',
   'Hyderabad', 'Banjara Hills',
   17.4156000, 78.4347000,
   'MAP', 'ACTIVE', 4.5);

-- -------------------------------------------------------
-- 4. Mechanics (3 mechanics across the 2 shops)
--    user_id references the MECHANIC users inserted above.
-- -------------------------------------------------------
INSERT INTO mechanics (user_id, shop_id, experience_yrs, specialisation, is_available, rating) VALUES
  (2, 1, 5, 'Gear cycles, road bikes',    TRUE,  4.3),   -- Vijay  → SpeedGear
  (3, 1, 3, 'Kids cycles, tyre repairs',  TRUE,  4.0),   -- Anil   → SpeedGear
  (4, 2, 7, 'E-bikes, premium cycles',    TRUE,  4.7);   -- Suresh → PedalFix Hub

-- -------------------------------------------------------
-- 5. Services (6 common cycle repair services)
-- -------------------------------------------------------
INSERT INTO services (category_id, name, description, base_price) VALUES
  (1, 'Flat Tyre Fix',      'Puncture repair or tube replacement.',           150.00),
  (1, 'Brake Adjustment',   'Adjust or replace brake pads and cables.',       200.00),
  (1, 'Gear Tuning',        'Derailleur alignment and gear cable tuning.',    250.00),
  (1, 'Chain Replacement',  'Replace worn-out chain with a new one.',         350.00),
  (1, 'Full Service',       'Complete inspection, cleaning, lubrication and adjustments.', 600.00),
  (1, 'Wheel Truing',       'Straighten bent or wobbly wheels.',             300.00);

-- -------------------------------------------------------
-- 6. Shop–Service links (each shop offers services at its own price)
-- -------------------------------------------------------
INSERT INTO shop_services (shop_id, service_id, price) VALUES
  -- SpeedGear offers all 6 services
  (1, 1, 150.00),   -- Flat Tyre Fix
  (1, 2, 180.00),   -- Brake Adjustment (slightly cheaper)
  (1, 3, 250.00),   -- Gear Tuning
  (1, 4, 350.00),   -- Chain Replacement
  (1, 5, 550.00),   -- Full Service
  (1, 6, 280.00),   -- Wheel Truing

  -- PedalFix Hub offers 5 services (no Wheel Truing)
  (2, 1, 170.00),   -- Flat Tyre Fix
  (2, 2, 200.00),   -- Brake Adjustment
  (2, 3, 270.00),   -- Gear Tuning
  (2, 4, 400.00),   -- Chain Replacement
  (2, 5, 650.00);   -- Full Service
