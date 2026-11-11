-- =========================================================================
-- SETTLE: SUPABASE / POSTGRESQL SCHEMA (Multi-Tenant & Zero AI Architecture)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- =========================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Creators / Users (Authentication & Multi-Tenant Isolation)
CREATE TABLE IF NOT EXISTS creators (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  studio_name VARCHAR(255) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  api_key VARCHAR(128) UNIQUE NOT NULL,
  plan VARCHAR(32) DEFAULT 'Pro',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clients Table (Scoped by Creator)
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(64) PRIMARY KEY,
  creator_id VARCHAR(64) REFERENCES creators(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Proposals Table (Commercial Scope & Milestones)
CREATE TABLE IF NOT EXISTS proposals (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(128) UNIQUE NOT NULL,
  creator_id VARCHAR(64) REFERENCES creators(id) ON DELETE CASCADE,
  client_id VARCHAR(64) REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(32) DEFAULT 'SENT', -- SENT, ACCEPTED, PAID, DRAFT
  total_amount NUMERIC(12, 2) DEFAULT 0,
  deposit_amount NUMERIC(12, 2) DEFAULT 0,
  deposit_paid INTEGER DEFAULT 0, -- 0 or 1
  currency VARCHAR(10) DEFAULT 'USD',
  revisions_included INTEGER DEFAULT 2,
  turnaround_days INTEGER DEFAULT 14,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Line Items Table (Itemized Deliverables)
CREATE TABLE IF NOT EXISTS line_items (
  id VARCHAR(64) PRIMARY KEY,
  proposal_id VARCHAR(64) REFERENCES proposals(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) DEFAULT 1,
  unit_price NUMERIC(12, 2) DEFAULT 0,
  amount NUMERIC(12, 2) DEFAULT 0
);

-- 5. Invoices Table (Direct Stripe Payments & Settlement)
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(64) PRIMARY KEY,
  creator_id VARCHAR(64) REFERENCES creators(id) ON DELETE CASCADE,
  proposal_id VARCHAR(64) REFERENCES proposals(id) ON DELETE SET NULL,
  client_id VARCHAR(64) REFERENCES clients(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  due_date VARCHAR(64),
  status VARCHAR(32) DEFAULT 'UNPAID', -- UNPAID, PAID, OVERDUE
  stripe_checkout_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Seed Default Creators
INSERT INTO creators (id, name, email, password_hash, studio_name, currency, api_key, plan)
VALUES 
  ('cr_alex_rivera', 'Alex Rivera', 'alex@apexcut.studio', 'demo_hash_pass123', 'Apex Cut Creative Studio', 'USD', 'stl_live_alex_9a82b1', 'Pro'),
  ('cr_elena_vance', 'Elena Vance', 'elena@vancefilms.io', 'demo_hash_pass123', 'Vance Motion Works', 'USD', 'stl_live_elena_7c34d9', 'Pro')
ON CONFLICT (id) DO NOTHING;
