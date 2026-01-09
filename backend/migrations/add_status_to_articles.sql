-- 添加 status 欄位到 articles 表
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'published'));

-- 為舊資料設定預設狀態
UPDATE articles
SET status = 'generated'
WHERE status IS NULL;

-- 創建索引以加速按狀態查詢
CREATE INDEX IF NOT EXISTS articles_status_idx ON articles(status);

-- 註解說明
COMMENT ON COLUMN articles.status IS '文章狀態：generated（已生成）或 published（已發布）';
