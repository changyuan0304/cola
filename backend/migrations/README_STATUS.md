# 添加文章狀態欄位 Migration

## 功能說明

此 migration 為 `articles` 表添加 `status` 欄位，用於追蹤文章狀態：
- **generated**（已生成）：文章剛生成完成
- **published**（已發布）：文章已發布到社交媒體

## 執行 Migration

### 方法 1：使用 Supabase Dashboard（推薦）

1. 登入 Supabase Dashboard: https://supabase.com/dashboard
2. 選擇你的專案
3. 點擊左側選單的「SQL Editor」
4. 點擊「+ New query」
5. 複製 `add_status_to_articles.sql` 的內容貼上
6. 點擊「Run」執行

### 方法 2：使用 psql 指令

```bash
psql -h <YOUR_SUPABASE_HOST> \
     -p 5432 \
     -U postgres \
     -d postgres \
     -f migrations/add_status_to_articles.sql
```

## Migration 內容

此 migration 會執行以下操作：

1. **添加 status 欄位**
   - 類型：TEXT
   - 預設值：'generated'
   - 限制：只能是 'generated' 或 'published'

2. **更新現有資料**
   - 將所有現有文章的 status 設為 'generated'

3. **創建索引**
   - 為 status 欄位創建索引，加速按狀態查詢

4. **添加註解**
   - 為欄位添加說明文字

## 驗證 Migration

執行完 migration 後，可以執行以下 SQL 來驗證：

```sql
-- 查看表結構
\d articles

-- 查看是否有 status 欄位
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'articles' AND column_name = 'status';

-- 查看各狀態的文章數量
SELECT status, COUNT(*) as count
FROM articles
GROUP BY status;
```

## 相關功能

執行此 migration 後，以下功能將可用：

### 前端功能
- ✅ 每篇文章卡片顯示狀態標籤（已生成/已發布）
- ✅ 點擊標籤可切換狀態
- ✅ 刪除文章功能

### API 端點
- `DELETE /api/product-location-story/articles/:id` - 刪除文章
- `PATCH /api/product-location-story/articles/:id` - 更新文章狀態

### 使用範例

**更新文章狀態：**
```bash
curl -X PATCH http://localhost:4001/api/product-location-story/articles/123 \
  -H "Content-Type: application/json" \
  -d '{"status": "published"}'
```

**刪除文章：**
```bash
curl -X DELETE http://localhost:4001/api/product-location-story/articles/123
```

## 回滾（如需要）

如果需要移除此功能，可以執行：

```sql
-- 移除索引
DROP INDEX IF EXISTS articles_status_idx;

-- 移除欄位
ALTER TABLE articles DROP COLUMN IF EXISTS status;
```

---

**更新日期**: 2026-01-08
**版本**: v1.0
