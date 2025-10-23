ALTER TABLE call_records
ADD COLUMN call_id text,
ADD COLUMN status text,
ADD COLUMN start_time timestamp,
ADD COLUMN end_time timestamp,
ADD COLUMN duration_seconds numeric,
ADD COLUMN agent_id text;
