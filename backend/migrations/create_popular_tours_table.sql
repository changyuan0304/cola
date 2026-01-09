-- 創建熱門行程資料表
CREATE TABLE IF NOT EXISTS popular_tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  type TEXT NOT NULL,
  highlights TEXT NOT NULL,
  price TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_popular_tours_source ON popular_tours(source);
CREATE INDEX IF NOT EXISTS idx_popular_tours_created_at ON popular_tours(created_at DESC);

-- 創建更新時間戳記的函數
CREATE OR REPLACE FUNCTION update_popular_tours_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 創建觸發器
DROP TRIGGER IF EXISTS trigger_update_popular_tours_updated_at ON popular_tours;
CREATE TRIGGER trigger_update_popular_tours_updated_at
  BEFORE UPDATE ON popular_tours
  FOR EACH ROW
  EXECUTE FUNCTION update_popular_tours_updated_at();

-- 創建爬取記錄表（追蹤最後一次爬取時間）
CREATE TABLE IF NOT EXISTS tours_scrape_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_count INTEGER NOT NULL,
  eztravel_count INTEGER NOT NULL,
  settour_count INTEGER NOT NULL
);

-- 為爬取記錄表創建索引
CREATE INDEX IF NOT EXISTS idx_tours_scrape_log_scraped_at ON tours_scrape_log(scraped_at DESC);
