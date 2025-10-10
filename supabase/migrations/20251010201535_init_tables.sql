-- Enable gen_random_uuid() support (pgcrypto is usually enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 🧠 Table 1: agent_configs
CREATE TABLE agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 📞 Table 2: call_records
CREATE TABLE call_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_name TEXT,
  phone_number TEXT,
  load_number TEXT,
  call_outcome TEXT,
  structured_data JSONB,
  transcript TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
