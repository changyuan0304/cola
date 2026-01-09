# 資料庫 Migration 說明

## 如何執行 Migration

由於 Supabase 的限制，建議使用以下方式執行 SQL migration：

### 方法 1：使用 Supabase Dashboard（推薦）

1. 登入 Supabase Dashboard: https://supabase.com/dashboard
2. 選擇你的專案
3. 點擊左側選單的 「SQL Editor」
4. 點擊 「+ New query」
5. 複製 `create_popular_tours_table.sql` 的內容貼上
6. 點擊 「Run」 執行

### 方法 2：使用指令執行（如果有設定好 psql）

```bash
psql -h <YOUR_SUPABASE_HOST> \
     -p 5432 \
     -U postgres \
     -d postgres \
     -f migrations/create_popular_tours_table.sql
```

## Migration 檔案說明

### `create_popular_tours_table.sql`

此檔案會創建以下資料表：

1. **popular_tours** - 儲存熱門行程資料
   - id: UUID 主鍵
   - name: 行程名稱
   - destination: 目的地
   - type: 行程類型
   - highlights: 行程亮點
   - price: 價格
   - source: 來源網站
   - created_at: 創建時間
   - updated_at: 更新時間

2. **tours_scrape_log** - 記錄爬取歷史
   - id: UUID 主鍵
   - scraped_at: 爬取時間
   - total_count: 總行程數
   - eztravel_count: 易遊網行程數
   - settour_count: 東南旅遊行程數

## 驗證 Migration 是否成功

執行完 migration 後，可以在 Supabase Dashboard 的 「Table Editor」 查看是否有以下兩個資料表：
- popular_tours
- tours_scrape_log

或者啟動後端服務，執行爬取功能，如果成功存入資料庫即表示 migration 成功。
