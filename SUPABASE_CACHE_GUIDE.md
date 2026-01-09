# 熱門行程資料庫快取功能說明

## 功能概述

已成功實作熱門行程的 Supabase 資料庫快取功能，現在：
- ✅ 首次載入時會從資料庫讀取快取資料（毫秒級速度）
- ✅ 如果沒有快取，自動爬取並儲存到資料庫
- ✅ 可以手動點擊「重新爬取」強制更新資料庫
- ✅ 每次爬取後自動覆蓋舊資料

## 使用流程

### 1. 執行資料庫 Migration

**方法一：使用 Supabase Dashboard（推薦）**

1. 前往 https://supabase.com/dashboard
2. 選擇你的專案
3. 點擊左側「SQL Editor」
4. 點擊「+ New query」
5. 複製貼上 `backend/migrations/create_popular_tours_table.sql` 的內容
6. 點擊「Run」執行

**方法二：使用 psql 指令**

```bash
cd backend
psql -h <YOUR_SUPABASE_HOST> \
     -p 5432 \
     -U postgres \
     -d postgres \
     -f migrations/create_popular_tours_table.sql
```

### 2. 啟動應用程式

```bash
# 後端
cd backend
npm start

# 前端
cd frontend
npm start
```

### 3. 使用快取功能

1. **首次使用**：進入「熱門行程」頁面，點擊「開始爬取」
   - 會爬取約 60 秒
   - 爬取完成後自動存入資料庫

2. **後續使用**：再次進入「熱門行程」頁面
   - 自動從資料庫載入（1 秒內完成）
   - 無需等待爬取

3. **手動更新**：點擊「重新爬取」按鈕
   - 強制重新爬取最新資料
   - 覆蓋資料庫中的舊資料
   - 完成後顯示更新提示

## 技術實作細節

### 1. 資料表結構

**popular_tours 表**
```sql
- id: UUID (主鍵)
- name: TEXT (行程名稱)
- destination: TEXT (目的地)
- type: TEXT (行程類型)
- highlights: TEXT (行程亮點)
- price: TEXT (價格)
- source: TEXT (來源：易遊網/東南旅遊)
- created_at: TIMESTAMP (創建時間)
- updated_at: TIMESTAMP (更新時間，自動更新)
```

**tours_scrape_log 表**
```sql
- id: UUID (主鍵)
- scraped_at: TIMESTAMP (爬取時間)
- total_count: INTEGER (總行程數)
- eztravel_count: INTEGER (易遊網行程數)
- settour_count: INTEGER (東南旅遊行程數)
```

### 2. 修改的檔案

#### 後端

**`services/ProductLocationStoryService.js`**
- 新增 `getToursFromDatabase()` - 從資料庫讀取快取
- 新增 `saveToursToDatabase(tours, totalCount)` - 儲存/覆蓋資料
- 修改 `fetchAndOrganizePopularTours(forceRefresh)` - 支援快取優先策略

**`routes/product-location-story.js`**
- 修改 `/fetch-popular-tours` 端點，接受 `forceRefresh` 參數

#### 前端

**`src/ProductLocationStory.js`**
- 修改 `handleFetchPopularTours(forceRefresh)` 函數
- 「重新爬取」按鈕傳遞 `forceRefresh: true`
- 顯示資料來源訊息（快取 or 爬取）

### 3. API 使用方式

```javascript
// 從快取讀取（優先）
fetch('/api/product-location-story/fetch-popular-tours', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ forceRefresh: false })
});

// 強制重新爬取
fetch('/api/product-location-story/fetch-popular-tours', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ forceRefresh: true })
});
```

**回應格式**
```json
{
  "success": true,
  "eztravel": [...],
  "settour": [...],
  "totalCount": 60,
  "scrapedAt": "2026-01-08T14:00:00.000Z",
  "fromCache": true,  // true=快取, false=爬取
  "performance": {
    "totalTime": "0.5s",
    "scrapeTime": "47.2s",
    "parallel": true
  }
}
```

## 測試腳本

### 測試資料庫連接和快取功能

```bash
cd backend
node scripts/test-tours-cache.js
```

這個腳本會：
1. 檢查資料庫連接
2. 測試從快取讀取
3. 測試強制爬取（會覆蓋資料）
4. 驗證儲存是否成功

## 效能提升

| 操作 | 未使用快取 | 使用快取 | 提升 |
|------|-----------|---------|------|
| 載入行程 | ~60 秒 | ~0.5 秒 | **120倍** |
| 使用者體驗 | 需等待 | 即時載入 | ⭐⭐⭐⭐⭐ |

## 注意事項

1. **環境變數**：確保 `.env` 有正確的 Supabase 配置
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   ```

2. **權限設定**：確保 Supabase RLS (Row Level Security) 政策允許讀寫
   - 可以在 Supabase Dashboard → Authentication → Policies 設定

3. **資料更新**：建議每天或每週手動「重新爬取」一次，保持資料新鮮度

4. **錯誤處理**：
   - 如果資料庫讀取失敗，會自動 fallback 到爬取
   - 如果爬取失敗，不會覆蓋現有快取

## 未來擴展建議

1. 新增定時自動更新（使用 cron job）
2. 新增快取過期機制（例如：超過 7 天自動重新爬取）
3. 新增行程變更通知
4. 新增更細緻的資料來源篩選

---

**版本**: v1.0
**更新日期**: 2026-01-08
**作者**: Claude Code
