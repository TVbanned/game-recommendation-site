ALTER TABLE activities ADD COLUMN IF NOT EXISTS banner_urls jsonb DEFAULT '[]'::jsonb;
