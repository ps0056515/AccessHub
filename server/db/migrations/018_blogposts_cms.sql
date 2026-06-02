CREATE TABLE IF NOT EXISTS blogposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content_html TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  cover_image VARCHAR(512),
  is_published BOOLEAN DEFAULT false,
  published_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
