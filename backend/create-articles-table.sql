-- 創建 articles 表來存儲生成的文章和圖片
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'standalone-user',
  content_type TEXT NOT NULL,  -- 'product', 'travel', 'discussion'
  content TEXT NOT NULL,  -- 文章內容
  form_data JSONB,  -- 表單數據
  locations JSONB,  -- 地點座標陣列
  images JSONB,  -- 圖片資料陣列
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引加速查詢
CREATE INDEX IF NOT EXISTS articles_user_id_idx ON articles(user_id);
CREATE INDEX IF NOT EXISTS articles_created_at_idx ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS articles_content_type_idx ON articles(content_type);

-- 啟用 Row Level Security (可選，暫時不啟用)
-- ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
