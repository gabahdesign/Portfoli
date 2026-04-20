-- Add accent_color column to works table
alter table works add column if not exists accent_color text;
